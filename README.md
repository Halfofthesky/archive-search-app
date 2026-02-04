# Archive Search

A desktop application for searching and downloading books from Archive.org with advanced Russian transliteration support.

## Features

- **Search Archive.org** - Search through millions of books and texts
- **Russian Transliteration** - Automatically searches in multiple spellings:
  - NRS (New Russian Spelling) - modern Cyrillic
  - ORS (Old Russian Spelling) - pre-1918 orthography with ѣ, і, ѳ, ѵ
  - ALA-LC romanization - library standard transliteration
  - Simplified romanization - ASCII-friendly transliteration
- **Multi-select** - Select multiple books and add to download queue
- **Download Queue** - Manage downloads with format selection (PDF, EPUB, DjVu, MOBI)
- **Cross-platform** - Runs on Windows, macOS, and Linux

## Russian Transliteration

The app automatically expands Russian text queries to search in multiple spellings:

| Input | Expanded Searches |
|-------|-------------------|
| Война и мир | Война и мир, Война и миръ, Voĭna i mir, Voina i mir |
| Толстой | Толстой, Толстой, Tolstoĭ, Tolstoi |

This ensures you find books regardless of how they were catalogued - whether in modern Cyrillic, pre-revolutionary spelling, or Latin transliteration.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [Rust](https://rustup.rs/) (for desktop app)

### Web Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Desktop App (Tauri)

```bash
# Install Rust first: https://rustup.rs/

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

The built executables will be in `src-tauri/target/release/bundle/`.

## Building for Different Platforms

### Windows
Builds `.exe` installer and `.msi` package.

### macOS
Builds `.dmg` and `.app` bundle. Requires macOS for building.

### Linux
Builds `.deb`, `.rpm`, and `.AppImage`. Requires Linux for building.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Desktop**: Tauri 2.0 (Rust)
- **Styling**: Custom CSS with Cormorant Garamond + DM Sans fonts

## License

MIT
