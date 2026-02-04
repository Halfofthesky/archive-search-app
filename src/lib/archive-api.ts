import { generateQueryVariants, containsCyrillic } from './transliteration';

const ARCHIVE_API_BASE = 'https://archive.org/advancedsearch.php';

export interface SearchParams {
  query?: string;
  title?: string;
  creator?: string;
  year_from?: number;
  year_to?: number;
  language?: string;
  search_mode: 'full_text' | 'metadata' | 'both';
  page?: number;
  rows?: number;
}

export interface SearchResult {
  identifier: string;
  title?: string;
  creator?: string;
  year?: string;
  language?: string;
  description?: string;
  mediatype?: string;
  downloads?: number;
  matched_via?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total_results: number;
  page: number;
  rows: number;
  query_variants_used: string[];
}

export interface FileInfo {
  name: string;
  format: string;
  size?: string;
  download_url: string;
}

export interface ItemDetails {
  identifier: string;
  title?: string;
  creator?: string;
  year?: string;
  publisher?: string;
  language?: string;
  description?: string;
  subjects: string[];
  files: FileInfo[];
  thumbnail_url: string;
  details_url: string;
}

function buildQueryString(
  query: string | undefined,
  title: string | undefined,
  creator: string | undefined,
  yearFrom: number | undefined,
  yearTo: number | undefined,
  language: string | undefined,
  searchMode: string,
  skipLanguageFilter: boolean = false
): string {
  const parts: string[] = ['mediatype:texts'];

  if (query?.trim()) {
    switch (searchMode) {
      case 'full_text':
        parts.push(`text:"${query}"`);
        break;
      case 'metadata':
        parts.push(`(title:"${query}" OR creator:"${query}" OR subject:"${query}")`);
        break;
      default:
        parts.push(`"${query}"`);
    }
  }

  if (title?.trim()) {
    parts.push(`title:"${title}"`);
  }

  if (creator?.trim()) {
    parts.push(`creator:"${creator}"`);
  }

  if (yearFrom && yearTo) {
    parts.push(`year:[${yearFrom} TO ${yearTo}]`);
  } else if (yearFrom) {
    parts.push(`year:[${yearFrom} TO *]`);
  } else if (yearTo) {
    parts.push(`year:[* TO ${yearTo}]`);
  }

  // Skip language filter for transliterated queries (items with Latin titles often have different language metadata)
  if (!skipLanguageFilter && language?.trim() && language !== 'any') {
    parts.push(`language:"${language}"`);
  }

  return parts.join(' AND ');
}

export async function searchArchive(params: SearchParams): Promise<SearchResponse> {
  const allResults: SearchResult[] = [];
  const seenIds = new Set<string>();
  let totalFound = 0;
  const variantsUsed: string[] = [];

  // Always expand queries for Russian text (auto-transliterate is always on)
  const hasRussianText =
    containsCyrillic(params.query || '') ||
    containsCyrillic(params.title || '') ||
    containsCyrillic(params.creator || '');

  // Also expand when Russian language is selected (user is searching for Russian content)
  const isRussianLanguage = params.language?.toLowerCase() === 'russian';

  // Expand for metadata searches with Russian text OR Russian language selected
  const needsExpansion = params.search_mode !== 'full_text' && (hasRussianText || isRussianLanguage);

  // Generate query variants
  type QueryTuple = [string | undefined, string | undefined, string | undefined, string];

  let queryVariants: QueryTuple[];

  if (needsExpansion) {
    const variants: QueryTuple[] = [];
    const seenQueries = new Set<string>();

    const qVariants = params.query ? generateQueryVariants(params.query) : [];
    const tVariants = params.title ? generateQueryVariants(params.title) : [];
    const cVariants = params.creator ? generateQueryVariants(params.creator) : [];

    // Helper to add unique variants
    const addVariant = (q: string | undefined, t: string | undefined, c: string | undefined, type: string) => {
      const key = `${q || ''}|${t || ''}|${c || ''}`;
      if (!seenQueries.has(key)) {
        seenQueries.add(key);
        variants.push([q, t, c, type]);
      }
    };

    // Add all query field variants (NRS, ORS, ALA-LC, simplified)
    if (qVariants.length > 0) {
      for (const qv of qVariants) {
        addVariant(qv.query, params.title, params.creator, `query:${qv.variant_type}`);
      }
    }

    // Add all title field variants
    if (tVariants.length > 0) {
      for (const tv of tVariants) {
        addVariant(params.query, tv.query, params.creator, `title:${tv.variant_type}`);
      }
    }

    // Add all creator field variants
    if (cVariants.length > 0) {
      for (const cv of cVariants) {
        addVariant(params.query, params.title, cv.query, `creator:${cv.variant_type}`);
      }
    }

    // If no variants generated, use original
    if (variants.length === 0) {
      variants.push([params.query, params.title, params.creator, 'original']);
    }

    console.log('Query variants to search:', variants.map(v => ({ query: v[0], title: v[1], creator: v[2], type: v[3] })));

    queryVariants = variants;
  } else {
    queryVariants = [[params.query, params.title, params.creator, 'original']];
  }

  // Execute searches for each variant
  for (const [query, title, creator, variantType] of queryVariants) {
    // Skip language filter for transliterated (Latin) variants - items with Latin titles
    // often have different or missing language metadata
    const isLatinVariant = variantType.includes('ala_lc') || variantType.includes('simplified');

    const queryString = buildQueryString(
      query, title, creator,
      params.year_from, params.year_to,
      params.language, params.search_mode,
      isLatinVariant // skip language filter for Latin variants
    );

    if (!queryString || queryString === 'mediatype:texts') continue;

    const page = params.page || 1;
    const rows = params.rows || 25;

    const url = `${ARCHIVE_API_BASE}?q=${encodeURIComponent(queryString)}&fl[]=identifier,title,creator,year,language,description,mediatype,downloads&rows=${rows}&page=${page}&output=json`;

    console.log(`Searching variant "${variantType}" (skipLang=${isLatinVariant}):`, queryString);
    console.log(`URL:`, url);

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log(`Results for "${variantType}": ${data.response?.numFound || 0} found`);

      if (data.response?.numFound > 0) {
        variantsUsed.push(variantType);
      }

      if (totalFound === 0) {
        totalFound = data.response?.numFound || 0;
      }

      for (const doc of data.response?.docs || []) {
        if (!seenIds.has(doc.identifier)) {
          seenIds.add(doc.identifier);
          allResults.push({
            identifier: doc.identifier,
            title: doc.title,
            creator: Array.isArray(doc.creator) ? doc.creator[0] : doc.creator,
            year: Array.isArray(doc.year) ? doc.year[0] : doc.year,
            language: Array.isArray(doc.language) ? doc.language[0] : doc.language,
            description: Array.isArray(doc.description) ? doc.description[0] : doc.description,
            mediatype: doc.mediatype,
            downloads: doc.downloads,
            matched_via: variantType,
          });
        }
      }
    } catch (error) {
      console.error(`Search error for variant ${variantType}:`, error);
    }
  }

  return {
    results: allResults,
    total_results: totalFound,
    page: params.page || 1,
    rows: params.rows || 25,
    query_variants_used: [...new Set(variantsUsed)],
  };
}

export async function getItemDetails(identifier: string): Promise<ItemDetails> {
  const url = `https://archive.org/metadata/${identifier}`;
  const response = await fetch(url);
  const data = await response.json();

  const meta = data.metadata || {};
  const filesArray = data.files || [];

  const subjects: string[] = Array.isArray(meta.subject)
    ? meta.subject
    : meta.subject
    ? [meta.subject]
    : [];

  const downloadableFormats = ['Text PDF', 'PDF', 'EPUB', 'DjVu', 'MOBI', 'Abbyy GZ'];

  const files: FileInfo[] = filesArray
    .filter((f: any) => downloadableFormats.includes(f.format))
    .map((f: any) => ({
      name: f.name,
      format: f.format,
      size: f.size,
      download_url: `https://archive.org/download/${identifier}/${encodeURIComponent(f.name)}`,
    }));

  return {
    identifier,
    title: meta.title,
    creator: Array.isArray(meta.creator) ? meta.creator[0] : meta.creator,
    year: meta.year || (meta.date ? meta.date.slice(0, 4) : undefined),
    publisher: meta.publisher,
    language: Array.isArray(meta.language) ? meta.language[0] : meta.language,
    description: Array.isArray(meta.description) ? meta.description[0] : meta.description,
    subjects,
    files,
    thumbnail_url: `https://archive.org/services/img/${identifier}`,
    details_url: `https://archive.org/details/${identifier}`,
  };
}
