import { NextResponse } from 'next/server'
import { searchBooks } from '@/lib/service'

export async function POST(req: Request) {
    const { query } = await req.json()
    const results = await searchBooks(query)
    return NextResponse.json(results)
} 