/**
 * IMDb Title ID & URL Parser and Validator
 *
 * Supports:
 * - Direct IDs: tt3896198, tt0133093, TT0903747
 * - Desktop URLs: https://www.imdb.com/title/tt3896198/
 * - Mobile URLs: https://m.imdb.com/title/tt3896198/
 * - Bare domain URLs: https://imdb.com/title/tt3896198
 * - URLs with subpaths: /reference, /fullcredits, /episodes
 * - URLs with query strings: ?ref_=nv_sr_srsg_0
 * - Protocol-less strings: imdb.com/title/tt3896198
 */

export interface ImdbParseResult {
  isValid: boolean;
  imdbId?: string;
  inputType?: 'url' | 'id';
  error?: string;
}

const IMDB_ID_REGEX = /tt\d{7,10}/i;
const DIRECT_ID_STRICT_REGEX = /^tt\d{7,10}$/i;

export function parseImdbInput(rawInput: string): ImdbParseResult {
  const trimmed = (rawInput || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please enter or paste an IMDb link or title ID.',
    };
  }

  // Check 1: Direct IMDb ID format (e.g., tt3896198)
  if (DIRECT_ID_STRICT_REGEX.test(trimmed)) {
    return {
      isValid: true,
      imdbId: trimmed.toLowerCase(),
      inputType: 'id',
    };
  }

  // Check if user entered something like 'tt' followed by fewer than 7 digits
  if (/^tt\d+$/i.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid IMDb Title ID length. Title IDs typically have 7 to 10 digits (e.g., tt0133093 or tt3896198).',
    };
  }

  // Check 2: IMDb Person link (nm...) detection
  if (trimmed.includes('imdb.com/name/') || /^nm\d+$/i.test(trimmed)) {
    return {
      isValid: false,
      error: 'This is an IMDb Person profile link (nm...). Please enter a Movie or TV Series link (tt...).',
    };
  }

  // Check 3: Non-IMDb URL check
  const isUrlLike = trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('www.') ||
    trimmed.startsWith('m.imdb.') ||
    trimmed.startsWith('imdb.');

  if (isUrlLike) {
    // Verify it's an imdb.com domain
    const isImdbDomain = /(^|\/\/)((m|www|app)\.)?imdb\.com\b/i.test(trimmed);
    if (!isImdbDomain) {
      return {
        isValid: false,
        error: 'Unsupported URL. Please enter an official IMDb title link (e.g. https://www.imdb.com/title/tt3896198/).',
      };
    }

    // Check if it's a general IMDb page without /title/
    if (!trimmed.includes('/title/')) {
      return {
        isValid: false,
        error: 'This IMDb link does not point to a specific title. Expected format: https://www.imdb.com/title/tt.../',
      };
    }
  }

  // Check 4: Extract tt\d{7,10} pattern from anywhere in the string/URL
  const match = trimmed.match(IMDB_ID_REGEX);
  if (match) {
    return {
      isValid: true,
      imdbId: match[0].toLowerCase(),
      inputType: isUrlLike ? 'url' : 'id',
    };
  }

  // Fallback error
  return {
    isValid: false,
    error: 'Could not extract a valid IMDb title ID. Expected format: https://www.imdb.com/title/tt3896198/ or tt3896198.',
  };
}

/**
 * Generates a safe canonical IMDb title URL for opening in a new tab
 */
export function getCanonicalImdbUrl(imdbId: string): string {
  const cleanId = (imdbId || '').trim().toLowerCase();
  return `https://www.imdb.com/title/${cleanId}/`;
}
