// Book interface
export interface BookItem {
    id: number
    title: string
    description: string
    author: string
    category?: string
    theme?: string
    format?: string
}

// Sample book data
export const sampleBooks: BookItem[] = [
    {
        id: 1,
        title: 'The Art of Programming',
        author: 'John Smith',
        description: 'A comprehensive guide to software development and coding practices, covering algorithms and data structures.',
        category: 'Technology',
        theme: 'Education',
        format: 'Hardcover'
    },
    {
        id: 2,
        title: 'Quantum Physics for Beginners',
        author: 'Sarah Chen',
        description: 'An accessible introduction to quantum mechanics and its fundamental principles.',
        category: 'Science',
        theme: 'Education',
        format: 'Digital'
    },
    {
        id: 3,
        title: 'The Last Symphony',
        author: 'Maria Garcia',
        description: 'A gripping novel about a talented musician discovering a mysterious composition in war-torn Europe.',
        category: 'Fiction',
        theme: 'Mystery',
        format: 'Paperback'
    },
    {
        id: 4,
        title: 'Sustainable Gardening',
        author: 'James Wilson',
        description: 'Learn practical techniques for creating and maintaining an eco-friendly garden in any climate.',
        category: 'Gardening',
        theme: 'Sustainability',
        format: 'Digital'
    },
    {
        id: 5,
        title: 'Modern Architecture',
        author: 'Emma Thompson',
        description: 'Explore contemporary architectural designs and their impact on urban landscapes.',
        category: 'Architecture',
        theme: 'Design',
        format: 'Hardcover'
    },
    {
        id: 6,
        title: 'The Psychology of Decision Making',
        author: 'Dr. Michael Lee',
        description: 'Understanding how humans make choices and what influences their decisions.',
        category: 'Psychology',
        theme: 'Science',
        format: 'Digital'
    },
    {
        id: 7,
        title: 'World Cuisine Mastery',
        author: 'Chef Ana Patel',
        description: 'Master the art of cooking with recipes and techniques from different cultures around the globe.',
        category: 'Cooking',
        theme: 'Culture',
        format: 'Hardcover'
    },
    {
        id: 8,
        title: 'Financial Freedom',
        author: 'Robert Chang',
        description: 'A practical guide to personal finance, investment strategies, and building long-term wealth.',
        category: 'Finance',
        theme: 'Education',
        format: 'Digital'
    },
    {
        id: 9,
        title: 'The Art of Photography',
        author: 'David Martinez',
        description: 'Learn advanced photography techniques and artistic composition for stunning images.',
        category: 'Photography',
        theme: 'Art',
        format: 'Digital'
    },
    {
        id: 10,
        title: 'Ancient Civilizations',
        author: 'Dr. Elizabeth Brown',
        description: 'Discover the fascinating history of ancient cultures and their lasting impact on modern society.',
        category: 'History',
        theme: 'Education',
        format: 'Paperback'
    },
    {
        id: 11,
        title: 'Space Exploration',
        author: 'Neil Anderson',
        description: 'A journey through the past, present, and future of human space exploration and discovery.',
        category: 'Science',
        theme: 'Technology',
        format: 'Digital'
    },
    {
        id: 12,
        title: 'The Digital Marketing Handbook',
        author: 'Lisa Zhang',
        description: 'Comprehensive strategies for modern digital marketing and online business growth.',
        category: 'Marketing',
        theme: 'Business',
        format: 'Digital'
    },
    {
        id: 13,
        title: 'Mindful Living',
        author: 'Dr. Sarah Palmer',
        description: 'Practical approaches to mindfulness and meditation for a balanced, stress-free life.',
        category: 'Self-Help',
        theme: 'Wellness',
        format: 'Paperback'
    },
    {
        id: 14,
        title: 'The Future of AI',
        author: 'Dr. James Lee',
        description: 'Exploring artificial intelligence advancements and their impact on society and technology.',
        category: 'Technology',
        theme: 'Science',
        format: 'Digital'
    },
    {
        id: 15,
        title: 'Classical Music Appreciation',
        author: 'Thomas Wagner',
        description: 'Understanding and enjoying classical music compositions from different eras.',
        category: 'Music',
        theme: 'Art',
        format: 'Digital'
    }
] 
