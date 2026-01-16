'use client';

import { createContext, useContext, ReactNode } from 'react';

type Messages = Record<string, any>;

interface IntlContextType {
    locale: string;
    messages: Messages;
    timeZone?: string;
    now?: Date;
}

const IntlContext = createContext<IntlContextType | undefined>(undefined);

/**
 * Simple i18n provider that's compatible with next-intl hooks
 * but doesn't require server configuration
 */
export function IntlProvider({
    children,
    locale,
    messages,
}: {
    children: ReactNode;
    locale: string;
    messages: Messages;
}) {
    return (
        <IntlContext.Provider
            value={{
                locale,
                messages,
                timeZone: 'Asia/Riyadh',
                now: new Date()
            }}
        >
            {children}
        </IntlContext.Provider>
    );
}

// Hook to get the context
export function useIntl() {
    const context = useContext(IntlContext);
    if (!context) {
        throw new Error('useIntl must be used within IntlProvider');
    }
    return context;
}
