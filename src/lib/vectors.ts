import { BookItem } from './types'
import { uniq, flatten, sum, map, reduce } from 'lodash'

const TOPICS = {
    technology: ['programming', 'software', 'computer', 'code', 'development', 'web', 'data', 'cloud', 'algorithm', 'algorithms', 'ai', 'artificial intelligence', 'tech', 'digital', 'computing', 'technology', 'coding', 'developer', 'application', 'system', 'database'],
    science: ['physics', 'quantum', 'mechanics', 'scientific', 'exploration', 'discovery', 'research', 'experiment', 'theory', 'principles', 'space', 'astronomy', 'science', 'laboratory', 'hypothesis', 'observation', 'analysis', 'methodology', 'empirical'],
    education: ['learn', 'guide', 'tutorial', 'basics', 'introduction', 'master', 'understanding', 'concepts', 'education', 'educational', 'beginner', 'advanced', 'comprehensive', 'practical', 'teaching', 'instruction', 'learning', 'study', 'knowledge', 'skills'],
    arts: ['art', 'music', 'photography', 'composition', 'design', 'creative', 'artistic', 'visual', 'classical', 'contemporary', 'modern', 'symphony', 'architecture', 'painting', 'sculpture', 'drawing', 'performance', 'exhibition', 'gallery', 'museum'],
    lifestyle: ['cooking', 'gardening', 'mindful', 'wellness', 'living', 'health', 'meditation', 'sustainable', 'eco-friendly', 'culture', 'cuisine', 'recipe', 'technique', 'planting', 'growing', 'organic', 'lifestyle', 'healthy', 'balance', 'wellbeing', 'garden'],
    business: ['finance', 'marketing', 'investment', 'strategy', 'business', 'wealth', 'money', 'market', 'digital marketing', 'growth', 'management', 'financial', 'economics', 'trading', 'stocks', 'entrepreneur', 'startup', 'revenue', 'profit', 'banking', 'success'],
    history: ['ancient', 'civilization', 'historical', 'empire', 'dynasty', 'archaeology', 'artifacts', 'culture', 'heritage', 'tradition', 'mayan', 'egyptian', 'roman', 'greek', 'medieval', 'renaissance', 'modern', 'century', 'era', 'period'],
    format: ['digital', 'hardcover', 'paperback', 'ebook', 'print', 'audio', 'book', 'books', 'guide', 'handbook', 'manual', 'textbook', 'publication', 'edition', 'volume', 'series', 'collection', 'anthology', 'reference']
}

const AUTHOR_PREFIXES = ['dr', 'prof', 'professor', 'mr', 'mrs', 'ms', 'sir', 'dame']
const AUTHOR_SUFFIXES = ['phd', 'md', 'dds', 'jr', 'sr', 'ii', 'iii', 'iv']

export const VECTOR_SIZE = Object.keys(TOPICS).length

const processAuthorName = (name: string) => {
    const parts = name.toLowerCase().split(/[\s.]+/)
    return parts.filter(part => !AUTHOR_PREFIXES.includes(part) && !AUTHOR_SUFFIXES.includes(part))
}

const cleanText = (text: string, isAuthor = false) => {
    const words = isAuthor ? processAuthorName(text) : text.toLowerCase().replace(/[^\w\s-]/g, ' ').split(/[\s-]+/).filter(Boolean)
    return uniq(flatten(words.map(word => {
        const variations = [word]
        if (word.endsWith('s') && !word.endsWith('ss')) variations.push(word.slice(0, -1))
        if (word.endsWith('ies')) variations.push(word.slice(0, -3) + 'y')
        if (word.endsWith('es')) variations.push(word.slice(0, -2))
        if (word.endsWith('ing')) variations.push(word.slice(0, -3), word.slice(0, -3) + 'e')
        if (word.endsWith('ed')) variations.push(word.slice(0, -2), word.slice(0, -1))
        if (word.length > 6) variations.push(...word.split(/(?=[A-Z])/))
        return variations
    })))
}

const calculateWordImportance = (word: string, field: string) => {
    const fieldImportance = { title: 3.0, author: 2.5, description: 2.0, category: 2.0, theme: 1.8, format: 1.5 }[field] || 1.0
    const lengthBoost = Math.min(word.length / 5, 1.5)
    const commonWords = new Set(['the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with'])
    const commonWordPenalty = commonWords.has(word) ? 0.5 : 1.0
    return fieldImportance * lengthBoost * commonWordPenalty
}

const calculateFrequencies = (words: string[], field: string) =>
    words.reduce((freq, word) => {
        const importance = calculateWordImportance(word, field)
        freq[word] = (freq[word] || 0) + importance
        return freq
    }, {} as Record<string, number>)

const normalize = (values: number[]) => {
    const magnitude = Math.sqrt(sum(values.map(v => v * v)))
    return magnitude > 0 ? values.map(v => v / magnitude) : values
}

const findSimilarWords = (word: string, vocabulary: string[]) => vocabulary.filter(vocabWord => {
    if (vocabWord === word || vocabWord.includes(word) || word.includes(vocabWord)) return true
    if (word.endsWith('s') && vocabWord === word.slice(0, -1)) return true
    if (vocabWord.endsWith('s') && word === vocabWord.slice(0, -1)) return true
    if (word.endsWith('ies') && vocabWord === word.slice(0, -3) + 'y') return true
    if (vocabWord.endsWith('ies') && word === vocabWord.slice(0, -3) + 'y') return true
    if (word.endsWith('es') && vocabWord === word.slice(0, -2)) return true
    if (vocabWord.endsWith('es') && word === vocabWord.slice(0, -2)) return true
    if (word.endsWith('ing')) {
        const base = word.slice(0, -3)
        if (vocabWord === base || vocabWord === base + 'e') return true
    }
    if (word.endsWith('ed')) {
        const base = word.slice(0, -2)
        if (vocabWord === base || vocabWord === base + 'e') return true
    }
    if (word.length > 6 && vocabWord.length > 6) {
        const wordParts = word.split(/(?=[A-Z])/).map(w => w.toLowerCase())
        const vocabParts = vocabWord.split(/(?=[A-Z])/).map(w => w.toLowerCase())
        return wordParts.some(wp => vocabParts.includes(wp)) || vocabParts.some(vp => wordParts.includes(vp))
    }
    if (word.length > 3 && vocabWord.length > 3) {
        let distance = 0
        const maxDistance = Math.floor(Math.min(word.length, vocabWord.length) * 0.3)
        for (let i = 0; i < Math.min(word.length, vocabWord.length); i++) {
            if (word[i] !== vocabWord[i]) distance++
            if (distance > maxDistance) return false
        }
        return distance <= maxDistance
    }
    return false
})

const generateSparseVectorComponents = (text: string, field = '') => {
    const words = cleanText(text, field === 'author')
    const frequencies = calculateFrequencies(words, field)
    const vocabulary = uniq(flatten(Object.values(TOPICS)))
    const maxValue = Math.max(...Object.values(frequencies)) || 1

    const indices: number[] = []
    const values: number[] = []
    const seenIndices = new Set<number>()

    Object.entries(frequencies).forEach(([word, freq]) => {
        findSimilarWords(word, vocabulary).forEach(similarWord => {
            const index = vocabulary.indexOf(similarWord)
            if (index !== -1 && !seenIndices.has(index)) {
                seenIndices.add(index)
                indices.push(index)
                const matchWeight = similarWord === word ? 1.0 : (similarWord.includes(word) || word.includes(similarWord)) ? 0.8 : 0.6
                values.push((freq * matchWeight) / maxValue)
            }
        })
    })

    return { indices, values }
}

export function generateDenseVector(item: BookItem) {
    const weights = { title: 3.0, description: 2.0, category: 2.5, theme: 2.0, author: 2.0, format: 1.5 }

    const scores = map(TOPICS, (keywords, topicName) => {
        const wordSet = new Set(keywords)
        return reduce(item, (totalScore, value, field) => {
            if (typeof value === 'string' && value.trim()) {
                const weight = weights[field as keyof typeof weights] || 1.0
                const words = cleanText(value, field === 'author')
                const matchScore = words.reduce((score, word) => {
                    if (wordSet.has(word)) return score + weight
                    if (field.toLowerCase() === topicName || (field === 'category' && keywords.includes(value.toLowerCase())) || (field === 'theme' && keywords.includes(value.toLowerCase()))) return score + (weight * 1.5)
                    const similarWords = findSimilarWords(word, Array.from(wordSet))
                    if (similarWords.length > 0) {
                        const bestMatch = Math.max(...similarWords.map(sw => sw === word ? 1.0 : (sw.includes(word) || word.includes(sw)) ? 0.8 : 0.6))
                        return score + (weight * bestMatch)
                    }
                    return score
                }, 0)
                return totalScore + matchScore
            }
            return totalScore
        }, 0)
    })

    return normalize(scores)
}

export function generateSparseVector(item: BookItem) {
    const weights = { title: 2.5, description: 1.5, category: 2.0, theme: 1.8, author: 2.0, format: 1.5 }

    const combinedIndices: number[] = []
    const combinedValues: number[] = []
    const seenIndices = new Set<number>()

    Object.entries(item).forEach(([field, value]) => {
        if (typeof value === 'string' && value.trim()) {
            const weight = weights[field as keyof typeof weights] || 1.0
            const { indices, values } = generateSparseVectorComponents(value, field)

            indices.forEach((index, i) => {
                if (!seenIndices.has(index)) {
                    seenIndices.add(index)
                    combinedIndices.push(index)
                    combinedValues.push(values[i] * weight)
                } else {
                    const existingIndex = combinedIndices.indexOf(index)
                    combinedValues[existingIndex] = Math.max(combinedValues[existingIndex], values[i] * weight)
                }
            })
        }
    })

    return { indices: combinedIndices, values: normalize(combinedValues) }
}
