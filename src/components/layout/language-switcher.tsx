'use client';

import { useLocale } from '@/lib/hooks/use-translations';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLanguage = (newLocale: string) => {
        // Get the pathname without the locale prefix
        const segments = pathname.split('/').filter(Boolean);
        // Remove the first segment (current locale)
        const pathnameWithoutLocale = segments.length > 1 ? '/' + segments.slice(1).join('/') : '';
        // Navigate to new locale
        router.push(`/${newLocale}${pathnameWithoutLocale}`);
        router.refresh();
    };

    const currentLanguage = languages.find((lang) => lang.code === locale);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline-flex">
                        {currentLanguage?.flag} {currentLanguage?.name}
                    </span>
                    <span className="sm:hidden">{currentLanguage?.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => switchLanguage(language.code)}
                        className={locale === language.code ? 'bg-accent' : ''}
                    >
                        <span className="mr-2">{language.flag}</span>
                        {language.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
