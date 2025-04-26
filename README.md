# OpenBalti Dictionary

A web application for managing a Balti-English dictionary using Next.js 15 and MongoDB Atlas.

## Features

- Display a list of Balti-English word pairs
- Toggle between Balti→English and English→Balti views
- Search functionality to filter words
- Add, edit, and delete word pairs
- Responsive design with loading states and notifications

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Set up your MongoDB Atlas connection string as an environment variable:
   \`\`\`
   MONGODB_URI=your_mongodb_connection_string
   \`\`\`
4. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

## Adding Sample Data

To populate your database with sample Balti-English word pairs, run:

\`\`\`
npm run seed
\`\`\`

This will add 50 sample word pairs to your database. If you already have data in your database and still want to add the sample data, use:

\`\`\`
npm run seed:force
\`\`\`

## API Routes

- `GET /api/words` - Fetch all words (with optional search parameter)
- `POST /api/words` - Create a new word
- `GET /api/words/[id]` - Fetch a specific word
- `PUT /api/words/[id]` - Update a word
- `DELETE /api/words/[id]` - Delete a word

## Technologies Used

- Next.js 15
- MongoDB Atlas
- Mongoose
- React
- Tailwind CSS
- shadcn/ui
- React Toastify
