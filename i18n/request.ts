// Locale configuration for the application
// This file no longer uses getRequestConfig as we're using NextIntlClientProvider directly

// Can be imported from a shared config
export const locales = ['ar', 'en'] as const;
export const defaultLocale = 'ar' as const;

export type Locale = (typeof locales)[number];
