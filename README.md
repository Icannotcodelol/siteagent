# SiteAgent - Document-Based AI Chatbot Platform

This project aims to build a multi-tenant web platform where users can upload documents, generate personalized AI chatbots based on that content, embed these chatbots on their own websites, and view usage analytics.

## Overview

Users can sign up, upload documents (like PDFs, text files), and the platform will process these documents to create a knowledge base for a custom AI chatbot. This chatbot can then answer questions based *only* on the information contained within the uploaded documents. Users receive an embeddable code snippet (likely an iframe or JavaScript widget) to easily integrate the chatbot onto their websites. A dashboard provides analytics on chatbot usage and performance.

## Core Features

*   **User Authentication:** Secure sign-up and login for users.
*   **Document Management:** Upload, view, and manage source documents.
*   **Chatbot Generation:** Automatic processing of documents (parsing, chunking, embedding) to create a personalized chatbot.
*   **Retrieval-Augmented Generation (RAG):** Chatbots use RAG to answer questions based on uploaded documents, minimizing hallucinations.
*   **Embeddable Widget:** Generate a simple code snippet (`<script>` or `<iframe>`) to embed the chatbot on external websites.
*   **Analytics Dashboard:** View metrics like the number of conversations, messages, user feedback, and potentially frequent topics.
*   **Multi-Tenancy:** User data (documents, chatbots, analytics) is kept separate and secure.

## Tech Stack

*   **Frontend:** Next.js (React)
*   **Backend:** Next.js API Routes (Node.js)
*   **Hosting:** Vercel
*   **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
*   **Vector Database:** Pinecone
*   **AI Models (API):** OpenAI (for Embeddings and LLM Chat Completions)

## Architecture

The application follows modern web architecture principles using Next.js.

*   **Frontend:** Component-based UI built with React, leveraging Next.js features like Server-Side Rendering (SSR) or Static Site Generation (SSG) where appropriate.
*   **Backend:** Serverless functions via Next.js API routes handle business logic, file processing, and interactions with external services (Supabase, Pinecone, OpenAI).
*   **AI Core:** A Retrieval-Augmented Generation (RAG) pipeline:
    1.  Documents are parsed, chunked, and converted into vector embeddings using an OpenAI model.
    2.  Embeddings are stored in Pinecone, associated with the user/chatbot.
    3.  User queries are embedded, used to search Pinecone for relevant document chunks.
    4.  Retrieved chunks + user query are fed into an OpenAI LLM (e.g., GPT-4) to generate a grounded answer.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)
*   Access keys/credentials for:
    *   Supabase (Project URL, Anon Key, Service Role Key)
    *   Pinecone (API Key, Environment)
    *   OpenAI (API Key)

### Installation & Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    # git clone <repository-url>
    cd siteagent
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory by copying `.env.example` (if it exists) or creating it manually. Add your credentials:
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # Keep this secret!

    # Pinecone
    PINECONE_API_KEY=your_pinecone_api_key
    PINECONE_ENVIRONMENT=your_pinecone_environment
    PINECONE_INDEX_NAME=your_chosen_pinecone_index_name # e.g., 'siteagent-chatbots'

    # OpenAI
    OPENAI_API_KEY=your_openai_api_key # Keep this secret!

    # Authentication (if using Supabase Auth, these might be covered above)
    # Add any other necessary variables (e.g., NEXTAUTH_SECRET if using NextAuth)

    NEXT_PUBLIC_APP_URL=http://localhost:3000 # Base URL for the app
    ```
    *Note: Ensure Supabase RLS (Row Level Security) is configured appropriately for data protection.*
    *Note: You will need to create a Pinecone index with the correct dimensions for your chosen embedding model (e.g., 1536 for OpenAI's `text-embedding-ada-002`).*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── public/             # Static assets
├── src/                # Source files
│   ├── app/            # Next.js App Router
│   │   ├── api/        # API routes
│   │   ├── (auth)/     # Routes related to authentication (sign-in, sign-up)
│   │   ├── (dashboard)/ # Protected routes requiring authentication
│   │   │   ├── layout.tsx # Dashboard specific layout
│   │   │   └── page.tsx   # Dashboard home
│   │   ├── favicon.ico
│   │   ├── globals.css # Global styles (imported by layout)
│   │   ├── layout.tsx  # Root layout
│   │   └── page.tsx    # Root page (e.g., landing page)
│   ├── components/     # Reusable React components
│   │   ├── ui/         # Generic UI elements (buttons, inputs, etc.)
│   │   └── features/   # Feature-specific components (FileUploader, ChatWindow)
│   ├── lib/            # Core logic, utilities, client initializations
│   │   ├── pinecone.ts # Pinecone client setup & functions
│   │   ├── supabase/   # Supabase client setup & helpers (client, server, middleware)
│   │   ├── openai.ts   # OpenAI API interactions
│   │   └── utils.ts    # General utility functions
│   ├── styles/         # Potential additional styles (if not solely using globals/tailwind)
│   └── hooks/          # Custom React hooks
├── .env.local          # Local environment variables (ignored by git)
├── .eslintrc.json      # ESLint configuration
├── .gitignore          # Git ignore rules
├── next.config.mjs     # Next.js configuration (using .mjs for ESM)
├── package.json        # Project dependencies and scripts
├── postcss.config.mjs  # PostCSS configuration (for Tailwind)
├── README.md           # This file
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

*(The structure reflects the setup with App Router and `src` directory. Files like `postcss.config.mjs` and `next.config.mjs` might use `.js` depending on the exact `create-next-app` version/choices).*

## Contributing

*(Optional: Add contribution guidelines if this is an open project).*

## License

*(Optional: Specify the project license, e.g., MIT).*
