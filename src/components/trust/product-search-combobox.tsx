'use client'

import React, { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { useProductsStore } from '@/lib/stores/products-store'
import { useTranslations } from '@/lib/hooks/use-translations'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface ProductSearchComboboxProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function ProductSearchCombobox({ value, onChange }: ProductSearchComboboxProps) {
    const t = useTranslations('trust.adminVotePage.form')
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedQuery = useDebounce(searchQuery, 300)

    const { products, isLoading, searchProducts } = useProductsStore()

    useEffect(() => {
        if (debouncedQuery.length > 0) {
            searchProducts({ query: debouncedQuery })
            setOpen(true)
        } else {
            setOpen(false)
        }
    }, [debouncedQuery, searchProducts])

    // Update local query when external value changes (optional, but good for edit mode)
    useEffect(() => {
        if (value) {
            const p = products.find(p => p.id === value)
            if (p) {
                setSearchQuery(`${p.nameEn || p.nameAr} (${p.barcode})`)
            }
        }
    }, [value, products])


    return (
        <div className="relative w-full">
            <Command className="rounded-lg border shadow-sm overflow-visible bg-transparent">
                <CommandInput
                    placeholder={t('searchProductPlaceholder')}
                    value={searchQuery}
                    onValueChange={(val) => {
                        setSearchQuery(val)
                        if (!val) {
                            setOpen(false)
                            // If user clears input, maybe clear value?
                            // onChange('') 
                        }
                    }}
                    onFocus={() => {
                        if (searchQuery.length > 0) setOpen(true)
                    }}
                    onBlur={() => {
                        // Delay closing to allow clicking item
                        setTimeout(() => setOpen(false), 200)
                    }}
                    className="border-none focus:ring-0"
                />

                {open && searchQuery.length > 0 && (
                    <div className="absolute top-full z-50 w-full mt-1 bg-popover rounded-md border shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95">
                        <CommandList>
                            {isLoading ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    {products.length === 0 && <CommandEmpty>{t('noProductFound')}</CommandEmpty>}
                                    <CommandGroup>
                                        {products.map((product) => (
                                            <CommandItem
                                                key={product.id}
                                                value={product.id} // This is used for filtering usually, but here we disabled filter
                                                onSelect={() => {
                                                    onChange(product.id)
                                                    setSearchQuery(`${product.nameEn || product.nameAr} (${product.barcode})`)
                                                    setOpen(false)
                                                }}
                                                // Mouse down prevents blur from firing before click
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value === product.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col">
                                                    <span>{product.nameEn || product.nameAr}</span>
                                                    <span className="text-xs text-muted-foreground">{product.barcode}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>
    )
}
