'use client';

import { useIntl, IntlProvider } from './intl-provider';

/**
 * Custom i18n hooks and provider that work without next-intl server configuration
 */

export function useLocale() {
    const { locale } = useIntl();
    return locale;
}

export function useTranslations(namespace?: string) {
    const { messages, locale } = useIntl();

    return (key: string, params?: Record<string, string | number>) => {
        const path = namespace ? `${namespace}.${key}` : key;
        const keys = path.split('.');
        let value: any = messages;

        for (const k of keys) {
            value = value?.[k];
        }

        if (value && typeof value === 'string' && params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                value = value.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
            });
        }

        // Debug first few calls
        if (Math.random() < 0.1) {
            console.log(`Translation [${locale}] ${path}:`, value || `MISSING (returning key: ${key})`);
        }

        return value || key;
    };
}

// Export the provider
export { IntlProvider as I18nProvider };
