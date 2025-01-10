'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    onSearch: (value: string) => void
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search books..."
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        onSearch(value)
                    }
                }}
                className="pl-10 rounded-full"
            />
        </div>
    )
} 