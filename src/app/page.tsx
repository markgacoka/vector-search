'use client'

import { useEffect, useState } from 'react'
import { BookCard } from '@/components/BookCard'
import { SearchBar } from '@/components/SearchBar'
import { Button } from '@/components/ui/button'
import { BookItem } from '@/lib/types'
import { Loader2, Plus, Trash } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
    const [query, setQuery] = useState('')
    const [books, setBooks] = useState<(BookItem & { score?: number })[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [clearing, setClearing] = useState(false)

    // Load initial books
    useEffect(() => {
        loadBooks()
    }, [])

    const loadBooks = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/books')
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to fetch books')
            }
            const data = await response.json()
            setBooks(data)
        } catch (error) {
            console.error('Error fetching books:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to fetch books')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async (searchQuery: string) => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to search books')
            }
            const results = await response.json()
            // Only show results with non-zero scores when searching
            setBooks(searchQuery ? results.filter((book: BookItem & { score: number }) => book.score > 0) : results)
        } catch (error) {
            console.error('Error searching books:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to search books')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerateBooks = async () => {
        try {
            setGenerating(true)
            const response = await fetch('/api/books', { method: 'POST' })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to generate books')
            }
            toast.success('Books generated successfully')
            await loadBooks()
        } catch (error) {
            console.error('Error generating books:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to generate books')
        } finally {
            setGenerating(false)
        }
    }

    const handleClearBooks = async () => {
        try {
            setClearing(true)
            const response = await fetch('/api/books', { method: 'DELETE' })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to clear books')
            }
            toast.success('Books cleared successfully')
            setBooks([])
        } catch (error) {
            console.error('Error clearing books:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to clear books')
        } finally {
            setClearing(false)
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query) {
                handleSearch(query)
            } else {
                loadBooks()
            }
        }, 300)

        return () => clearTimeout(handler)
    }, [query])

    return (
        <main className="container py-10 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Vector Search Demo</h1>
                <p className="text-muted-foreground">
                    Search through books using vector similarity.
                </p>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <SearchBar
                        value={query}
                        onChange={setQuery}
                        onSearch={handleSearch}
                    />
                </div>
                <Button
                    onClick={handleGenerateBooks}
                    disabled={generating || isLoading}
                    className="gap-2"
                >
                    {generating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}
                    Generate
                </Button>
                <Button
                    onClick={handleClearBooks}
                    disabled={clearing || isLoading}
                    variant="destructive"
                    className="gap-2"
                >
                    {clearing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash className="h-4 w-4" />
                    )}
                    Clear
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="text-muted-foreground mt-2">Loading...</p>
                </div>
            ) : books.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {books.map(book => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    {query ? (
                        <>
                            <p className="text-lg font-medium">No matches found</p>
                            <p>Try adjusting your search terms or explore different keywords</p>
                        </>
                    ) : (
                        'No books found. Click Generate to add sample books.'
                    )}
                </div>
            )}
        </main>
    )
} 