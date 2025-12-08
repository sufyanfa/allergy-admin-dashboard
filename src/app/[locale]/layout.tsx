import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IntlProvider } from '@/lib/intl-provider';
import { locales } from '../../../i18n/request';
import { Rubik } from 'next/font/google';
import '../globals.css';
import { Toaster } from '@/components/ui/sonner';

// Import messages directly
import arMessages from '../../../messages/ar.json';
import enMessages from '../../../messages/en.json';

// Rubik font - supports both Arabic and Latin
const rubik = Rubik({
    subsets: ['arabic', 'latin'],
    variable: '--font-rubik',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    title: 'Allergy Checker Admin Dashboard',
    description: 'Admin dashboard for managing allergy checker application',
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Await params as required by Next.js 15
    const { locale } = await params;

    // Validate locale
    if (!locales.includes(locale as any)) {
        notFound();
    }

    // Get messages for the locale
    const allMessages = {
        ar: arMessages,
        en: enMessages
    };
    const messages = allMessages[locale as 'ar' | 'en'];

    // Determine text direction
    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir} className={rubik.variable}>
            <body suppressHydrationWarning>
                <IntlProvider locale={locale} messages={messages}>
                    {children}
                    <Toaster />
                </IntlProvider>
            </body>
        </html>
    );
}
