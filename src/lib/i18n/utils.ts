import viTranslations from './locales/vi.json';
import enTranslations from './locales/en.json';

export type Locale = 'vi' | 'en';
export type TranslationKey = string;

const translations: Record<Locale, Record<string, unknown>> = {
  vi: viTranslations,
  en: enTranslations,
};

const defaultLocale: Locale = 'vi';
const locales: Locale[] = ['vi', 'en'];

/**
 * Get the current locale from URL pathname
 */
export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (locales.includes(lang as Locale)) {
    return lang as Locale;
  }
  return defaultLocale;
}

/**
 * Get locale from Astro context
 */
export function getLocale(url?: URL): Locale {
  if (!url) {
    return defaultLocale;
  }
  return getLocaleFromUrl(url);
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Translation function - returns translated string for given key
 */
export function t(key: TranslationKey, locale: Locale = defaultLocale): string {
  const localeTranslations = translations[locale];
  const value = getNestedValue(localeTranslations, key);

  if (value === undefined) {
    // Fallback to default locale
    if (locale !== defaultLocale) {
      const fallbackValue = getNestedValue(translations[defaultLocale], key);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
    }
    // Return key if no translation found
    console.warn(`Missing translation for key: ${key}`);
    return key;
  }

  return value;
}

/**
 * Create a translation function bound to a specific locale
 */
export function useTranslations(locale: Locale) {
  return (key: TranslationKey): string => t(key, locale);
}

/**
 * Get localized path for a given path
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove leading slash for processing
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Check if path already has a locale prefix
  const pathLocale = cleanPath.split('/')[0];
  const hasLocalePrefix = locales.includes(pathLocale as Locale);

  // Remove existing locale prefix if present
  const pathWithoutLocale = hasLocalePrefix
    ? cleanPath.split('/').slice(1).join('/')
    : cleanPath;

  // For default locale, don't add prefix
  if (locale === defaultLocale) {
    return `/${pathWithoutLocale}`;
  }

  // Add locale prefix for non-default locales
  return `/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;
}

/**
 * Get all localized paths for a given path
 */
export function getLocalizedPaths(path: string): Array<{ locale: Locale; path: string }> {
  return locales.map((locale) => ({
    locale,
    path: getLocalizedPath(path, locale),
  }));
}

/**
 * Get alternate language links for SEO
 */
export function getAlternateLanguageLinks(path: string, siteUrl: string): Array<{ hreflang: string; href: string }> {
  const links = locales.map((locale) => ({
    hreflang: locale === 'vi' ? 'vi-VN' : 'en-US',
    href: `${siteUrl}${getLocalizedPath(path, locale)}`,
  }));

  // Add x-default pointing to default locale
  links.push({
    hreflang: 'x-default',
    href: `${siteUrl}${getLocalizedPath(path, defaultLocale)}`,
  });

  return links;
}

export { defaultLocale, locales };
