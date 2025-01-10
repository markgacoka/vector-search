# Vector Search Demo with Qdrant

A Next.js app showcasing semantic search using the Qdrant vector database, eliminating the need for costly embedding APIs.

## Features

- **Semantic Search**: Search books by meaning, not exact text
- **Custom Vectors**: Dense vectors via topic modeling
- **Instant Results**: Real-time search with scores

## Why Qdrant?

Chosen for its self-hosting, free tier, performance, simple API, active development, cost-effectiveness, and rich features like filtering and payload storage.

## Vector Generation

Custom approach using topic modeling, dense vectors, normalization, and cosine similarity for ranking.

## Getting Started

### Prerequisites

- Node.js
- npm
- Qdrant account

### Installation

1. **Clone the Repository**: 
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**: 
   ```sh
   npm install
   ```

3. **Set Up Environment Variables**: 
   Create a `.env` file in the root directory and add the following:
   ```env
   QDRANT_URL="your-qdrant-instance-url"
   QDRANT_API_KEY="your-qdrant-api-key"
   ```

4. **Start the Development Server**: 
   ```sh
   npm run dev
   ```

5. **Access the Application**: 
   Open your browser and visit [http://localhost:3000](http://localhost:3000)

## API Routes

- `GET /api/books`: Retrieve books
- `POST /api/books`: Add sample books
- `DELETE /api/books`: Remove all books
- `POST /api/search`: Query books

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a PR

## Future Improvements

- [ ] Batch operations
- [ ] Multiple collections
- [ ] Pagination
- [ ] Unit tests

## Acknowledgments

- [Qdrant](https://qdrant.tech/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)