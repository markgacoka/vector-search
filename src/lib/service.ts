import { QdrantClient } from '@qdrant/js-client-rest'
import { BookItem, sampleBooks } from './types'
import { generateDenseVector, generateSparseVector, VECTOR_SIZE } from './vectors'

const client = new QdrantClient({ 
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY
})

const COLLECTION = 'books'

async function ensureCollectionExists(): Promise<boolean> {
    try {
        const collections = await client.getCollections()
        if (!collections.collections.some(c => c.name === COLLECTION)) {
            return createCollectionStructure()
        }
        return true
    } catch (error) {
        console.error('Failed to check collection:', error)
        throw new Error('Failed to check if collection exists')
    }
}

async function createCollectionStructure(): Promise<boolean> {
    try {
        await client.createCollection(COLLECTION, {
            vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
            sparse_vectors: { keywords: {} }
        })

        const fields = ['title', 'description', 'author', 'category', 'theme', 'format']
        await Promise.all(fields.map(field => 
            client.createPayloadIndex(COLLECTION, {
                field_name: field,
                field_schema: { type: 'text', tokenizer: 'word', lowercase: true },
                wait: true
            })
        ))

        return true
    } catch (error) {
        console.error('Failed to create collection structure:', error)
        throw new Error('Failed to create collection structure')
    }
}

export async function initCollection(): Promise<boolean> {
    try {
        await ensureCollectionExists()

        const points = await Promise.all(sampleBooks.map(async book => ({
            id: book.id,
            vector: generateDenseVector(book),
            payload: {
                ...book,
                sparse_indices: generateSparseVector(book).indices,
                sparse_values: generateSparseVector(book).values
            }
        })))

        await client.upsert(COLLECTION, { points })
        return true
    } catch (error) {
        console.error('Failed to initialize collection:', error)
        throw new Error('Failed to initialize collection with sample data')
    }
}

export async function upsertBook(book: BookItem): Promise<boolean> {
    try {
        await ensureCollectionExists()
        
        await client.upsert(COLLECTION, {
            points: [{
                id: book.id,
                vector: generateDenseVector(book),
                payload: {
                    ...book,
                    sparse_indices: generateSparseVector(book).indices,
                    sparse_values: generateSparseVector(book).values
                }
            }]
        })
        return true
    } catch (error) {
        console.error('Failed to upsert book:', error)
        throw new Error('Failed to add book to collection')
    }
}

export async function searchBooks(query: string): Promise<(BookItem & { score: number })[]> {
    try {
        const collections = await client.getCollections()
        if (!collections.collections.some(c => c.name === COLLECTION)) return []

        if (!query.trim()) return (await getAllBooks()).map(book => ({ ...book, score: 1.0 }))

        const queryParts = query.split(/\s+/)
        const potentialNames = queryParts.filter(part => part.length > 1 && /^[A-Z]/.test(part)).join(' ')
        
        const searchItem = { 
            id: 0, 
            title: query,
            description: query,
            author: potentialNames || query,
            category: query,
            theme: query,
            format: query
        }
        const denseVector = generateDenseVector(searchItem)
        const sparseVector = generateSparseVector(searchItem)

        const results = await client.search(COLLECTION, {
            vector: denseVector,
            with_payload: true,
            limit: 20,
            filter: {
                should: [
                    { key: 'title', match: { text: query } },
                    { key: 'author', match: { text: query } },
                    { key: 'format', match: { text: query } },
                    { key: 'category', match: { text: query } },
                    { key: 'theme', match: { text: query } },
                    { key: 'title', match: { text: query.split(/\s+/).join(' ') } },
                    { key: 'description', match: { text: query.split(/\s+/).join(' ') } },
                    ...(potentialNames ? [{ key: 'author', match: { text: potentialNames } }] : []),
                    { key: 'sparse_indices', match: { any: sparseVector.indices } },
                    { must: [{ key: 'category', match: { text: query } }, { key: 'theme', match: { text: query } }] }
                ]
            },
            params: { hnsw_ef: 128, exact: true }
        })

        const processedResults = results.map(hit => {
            const payload = hit.payload as Record<string, unknown>
            let finalScore = hit.score
            const queryLower = query.toLowerCase()
            const titleLower = (payload.title as string).toLowerCase()
            const descLower = (payload.description as string).toLowerCase()
            const authorLower = (payload.author as string).toLowerCase()
            const categoryLower = ((payload.category as string) || '').toLowerCase()
            const themeLower = ((payload.theme as string) || '').toLowerCase()
            const formatLower = ((payload.format as string) || '').toLowerCase()

            if (titleLower === queryLower) finalScore *= 2.5
            if (authorLower === queryLower) finalScore *= 2.2
            if (formatLower === queryLower) finalScore *= 2.0
            if (categoryLower === queryLower) finalScore *= 1.8
            if (themeLower === queryLower) finalScore *= 1.8

            if (titleLower.includes(queryLower)) finalScore *= 1.8
            if (authorLower.includes(queryLower)) finalScore *= 1.6
            if (descLower.includes(queryLower)) finalScore *= 1.4
            if (formatLower.includes(queryLower)) finalScore *= 1.4
            if (categoryLower.includes(queryLower)) finalScore *= 1.3
            if (themeLower.includes(queryLower)) finalScore *= 1.3

            const queryWords = queryLower.split(/\s+/)
            const titleWords = titleLower.split(/\s+/)
            const descWords = descLower.split(/\s+/)
            const authorWords = authorLower.split(/\s+/)
            
            const titleMatchCount = queryWords.filter(w => titleWords.some(tw => tw.includes(w))).length
            const descMatchCount = queryWords.filter(w => descWords.some(dw => dw.includes(w))).length
            const authorMatchCount = queryWords.filter(w => authorWords.some(aw => aw.includes(w))).length
            
            if (titleMatchCount > 0) finalScore *= (1 + (titleMatchCount / queryWords.length) * 0.8)
            if (descMatchCount > 0) finalScore *= (1 + (descMatchCount / queryWords.length) * 0.4)
            if (authorMatchCount > 0) finalScore *= (1 + (authorMatchCount / queryWords.length) * 0.6)

            if (potentialNames) {
                const nameWords = potentialNames.toLowerCase().split(/\s+/)
                const authorMatchCount = nameWords.filter(name => authorLower.includes(name)).length
                if (authorMatchCount > 0) finalScore *= (1 + (authorMatchCount / nameWords.length))
            }

            return {
                id: payload.id as number,
                title: payload.title as string,
                description: payload.description as string,
                author: payload.author as string,
                category: payload.category as string | undefined,
                theme: payload.theme as string | undefined,
                format: payload.format as string | undefined,
                score: finalScore
            }
        })

        const maxScore = Math.max(...processedResults.map(r => r.score))
        return processedResults
            .map(result => ({ ...result, score: result.score / (maxScore || 1) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)

    } catch (error) {
        console.error('Failed to search books:', error)
        throw new Error('Failed to search books')
    }
}

export async function getAllBooks(): Promise<BookItem[]> {
    try {
        const collections = await client.getCollections()
        if (!collections.collections.some(c => c.name === COLLECTION)) return []

        const { points } = await client.scroll(COLLECTION, { limit: 100, with_payload: true })
        return points.map(point => {
            const payload = point.payload as Record<string, unknown>
            return {
                id: payload.id as number,
                title: payload.title as string,
                description: payload.description as string,
                author: payload.author as string,
                category: payload.category as string | undefined,
                theme: payload.theme as string | undefined,
                format: payload.format as string | undefined
            }
        })
    } catch (error) {
        console.error('Failed to get books:', error)
        throw new Error('Failed to get books')
    }
}

export async function clearBooks(): Promise<boolean> {
    try {
        const collections = await client.getCollections()
        if (!collections.collections.some(c => c.name === COLLECTION)) return true

        await client.deleteCollection(COLLECTION)
        return true
    } catch (error) {
        console.error('Failed to clear books:', error)
        throw new Error('Failed to clear books collection')
    }
} 
