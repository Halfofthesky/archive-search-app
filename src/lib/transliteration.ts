// ALA-LC Romanization with diacritics and ligatures
const ALA_LC_MAP: Record<string, string> = {
  // Basic vowels
  'а': 'a', 'е': 'e', 'ё': 'ë', 'и': 'i', 'о': 'o', 'у': 'u', 'ы': 'y', 'э': 'ė',
  // Soft/hard vowels with ligatures
  'я': 'i︠a︡', 'ю': 'i︠u︡',
  // Consonants
  'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ж': 'zh', 'з': 'z', 'к': 'k',
  'л': 'l', 'м': 'm', 'н': 'n', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'ф': 'f', 'х': 'kh', 'ц': 't︠s︡', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  // Signs
  'й': 'ĭ', 'ь': 'ʹ', 'ъ': 'ʺ',
  // Pre-reform letters
  'ѣ': 'i︠e︡', 'і': 'ī', 'ѳ': 'ḟ', 'ѵ': 'ẏ',
  // Uppercase
  'А': 'A', 'Е': 'E', 'Ё': 'Ë', 'И': 'I', 'О': 'O', 'У': 'U', 'Ы': 'Y', 'Э': 'Ė',
  'Я': 'I︠A︡', 'Ю': 'I︠U︡',
  'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Ж': 'Zh', 'З': 'Z', 'К': 'K',
  'Л': 'L', 'М': 'M', 'Н': 'N', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
  'Ф': 'F', 'Х': 'Kh', 'Ц': 'T︠s︡', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Й': 'Ĭ', 'Ь': 'ʹ', 'Ъ': 'ʺ',
  'Ѣ': 'I︠e︡', 'І': 'Ī', 'Ѳ': 'Ḟ', 'Ѵ': 'Ẏ',
};

// Simplified ASCII romanization (no diacritics)
const SIMPLIFIED_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'iu', 'я': 'ia',
  // Pre-reform
  'ѣ': 'e', 'і': 'i', 'ѳ': 'f', 'ѵ': 'i',
  // Uppercase
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'I', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Iu', 'Я': 'Ia',
  'Ѣ': 'E', 'І': 'I', 'Ѳ': 'F', 'Ѵ': 'I',
};

export function toAlaLc(text: string): string {
  return [...text].map(c => ALA_LC_MAP[c] ?? c).join('');
}

export function toSimplified(text: string): string {
  return [...text].map(c => SIMPLIFIED_MAP[c] ?? c).join('');
}

const CONSONANTS = 'бвгджзклмнпрстфхцчшщБВГДЖЗКЛМНПРСТФХЦЧШЩ';
const VOWELS = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ';

function addFinalHardSign(text: string): string {
  let result = '';
  const chars = [...text];

  for (let i = 0; i < chars.length; i++) {
    result += chars[i];
    const isConsonant = CONSONANTS.includes(chars[i]);
    const atWordEnd = i + 1 >= chars.length || !/\p{L}/u.test(chars[i + 1]);

    if (isConsonant && atWordEnd) {
      result += 'ъ';
    }
  }

  return result;
}

function convertIToDecimal(text: string): string {
  let result = '';
  const chars = [...text];

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if ((c === 'и' || c === 'И') && i + 1 < chars.length) {
      const next = chars[i + 1];
      if (VOWELS.includes(next)) {
        result += c === 'и' ? 'і' : 'І';
        continue;
      }
    }
    result += c;
  }

  return result;
}

// Common roots where ѣ was used
const YAT_ROOTS: [string, string][] = [
  ['свет', 'свѣт'], ['цвет', 'цвѣт'], ['след', 'слѣд'], ['дел', 'дѣл'],
  ['мест', 'мѣст'], ['лет', 'лѣт'], ['вер', 'вѣр'], ['бел', 'бѣл'],
  ['хлеб', 'хлѣб'], ['время', 'врѣмя'], ['человек', 'человѣк'],
];

function generateYatVariants(text: string): string[] {
  let variants = [text];

  for (const [modern, prereform] of YAT_ROOTS) {
    const newVariants: string[] = [];
    for (const variant of variants) {
      if (variant.includes(modern)) {
        newVariants.push(variant.replace(new RegExp(modern, 'g'), prereform));
      }
    }
    variants = [...variants, ...newVariants];
  }

  return [...new Set(variants)];
}

export function toPrereform(text: string): string[] {
  let result = text;

  // Add hard sign after final consonants
  result = addFinalHardSign(result);

  // -ого/-его → -аго/-яго (genitive adjective endings)
  result = result.replace(/ого/g, 'аго').replace(/его/g, 'яго');

  // и → і before vowels
  result = convertIToDecimal(result);

  // Generate ѣ variants
  return generateYatVariants(result);
}

export function containsCyrillic(text: string): boolean {
  return /[\u0400-\u04FF\u0500-\u052F]/.test(text);
}

export function containsPrereform(text: string): boolean {
  // Check for pre-reform letters: ѣ, і, ѳ, ѵ, and final ъ after consonants
  return /[ѣіѳѵЃІѲѴ]/.test(text) || /[бвгджзклмнпрстфхцчшщБВГДЖЗКЛМНПРСТФХЦЧШЩ]ъ\b/.test(text);
}

export interface QueryVariant {
  query: string;
  variant_type: string;
}

/**
 * Generate all query variants for comprehensive Russian text search.
 *
 * Input detection:
 * - NRS (New Russian Spelling): Modern Cyrillic without pre-reform letters
 * - ORS (Old Russian Spelling): Cyrillic with ѣ, і, ѳ, ѵ, or final ъ
 * - SRT (Simplified Romanization): Latin without ALA-LC diacritics
 * - ALA-LC: Latin with diacritics like ī, i︠a︡, etc.
 *
 * Always generates all four variants for maximum coverage.
 */
export function generateQueryVariants(text: string): QueryVariant[] {
  const variants: QueryVariant[] = [];
  const hasCyrillic = containsCyrillic(text);
  const hasPrereform = containsPrereform(text);

  console.log(`generateQueryVariants("${text}"): hasCyrillic=${hasCyrillic}, hasPrereform=${hasPrereform}`);

  if (hasCyrillic) {
    if (hasPrereform) {
      // Input is ORS (Old Russian Spelling)
      // Generate: ORS (original), NRS, ALA-LC, SRT
      variants.push({ query: text, variant_type: 'ors' });

      // Convert ORS to NRS (reverse the pre-reform changes)
      const nrs = orsToNrs(text);
      if (nrs !== text) {
        variants.push({ query: nrs, variant_type: 'nrs' });
      }

      // ALA-LC from original ORS
      variants.push({ query: toAlaLc(text), variant_type: 'ala_lc' });

      // Simplified from original ORS
      variants.push({ query: toSimplified(text), variant_type: 'simplified' });
    } else {
      // Input is NRS (New Russian Spelling / modern Cyrillic)
      // Generate: NRS (original), ORS, ALA-LC, SRT
      variants.push({ query: text, variant_type: 'nrs' });

      // Generate ORS variants
      const prereformVariants = toPrereform(text);
      console.log(`ORS variants for "${text}":`, prereformVariants);
      for (const prereform of prereformVariants) {
        if (prereform !== text) {
          variants.push({ query: prereform, variant_type: 'ors' });
        }
      }

      // ALA-LC romanization
      const alaLc = toAlaLc(text);
      console.log(`ALA-LC for "${text}": "${alaLc}"`);
      variants.push({ query: alaLc, variant_type: 'ala_lc' });

      // Simplified romanization
      const simplified = toSimplified(text);
      console.log(`Simplified for "${text}": "${simplified}"`);
      variants.push({ query: simplified, variant_type: 'simplified' });
    }
  } else {
    // Input is Latin-based (SRT or ALA-LC)
    // We can't reliably reverse-transliterate, so just search with original
    // But add the original query - user should use Cyrillic for best results
    variants.push({ query: text, variant_type: 'latin_original' });
  }

  console.log(`Final variants for "${text}":`, variants);
  return variants;
}

/**
 * Convert Old Russian Spelling back to New Russian Spelling (modern).
 * This reverses the pre-reform orthography changes.
 */
function orsToNrs(text: string): string {
  let result = text;

  // Remove final hard signs after consonants
  result = result.replace(/([бвгджзклмнпрстфхцчшщБВГДЖЗКЛМНПРСТФХЦЧШЩ])ъ(?=\s|$|[^\p{L}])/gu, '$1');

  // ѣ → е
  result = result.replace(/ѣ/g, 'е').replace(/Ѣ/g, 'Е');

  // і → и
  result = result.replace(/і/g, 'и').replace(/І/g, 'И');

  // ѳ → ф
  result = result.replace(/ѳ/g, 'ф').replace(/Ѳ/g, 'Ф');

  // ѵ → и
  result = result.replace(/ѵ/g, 'и').replace(/Ѵ/g, 'И');

  // Reverse genitive endings: -аго → -ого, -яго → -его
  result = result.replace(/аго\b/g, 'ого').replace(/яго\b/g, 'его');

  return result;
}
