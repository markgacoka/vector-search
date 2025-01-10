import { NextResponse } from 'next/server'
import { clearBooks, getAllBooks, initCollection } from '@/lib/service'

export async function GET() {
    try {
        const books = await getAllBooks()
        return NextResponse.json(books)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get books' },
            { status: 500 }
        )
    }
}

export async function POST() {
    try {
        const success = await initCollection()
        if (!success) {
            throw new Error('Failed to initialize collection')
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to initialize collection' },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    try {
        const success = await clearBooks()
        if (!success) {
            throw new Error('Failed to clear collection')
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to clear collection' },
            { status: 500 }
        )
    }
} 