# Simplified AI Chatbot

This is a simplified version of the Vercel AI Chatbot template, configured to use Google's Gemini model.

## Features

- AI chat with Google Gemini 1.5 Pro
- Clean, minimalist UI
- File upload support
- Chat history
- User authentication

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Google AI Studio API key (get one at https://aistudio.google.com/app/apikey)

### Environment Setup

1. Copy the `.env.local` file and fill in the required values:

```sh
# AUTH_SECRET can be generated with: openssl rand -base64 32
AUTH_SECRET=your_auth_secret_key_here

# Get your Google API key from https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here

# Database and Blob storage are needed for chat persistence
POSTGRES_URL=your_postgres_url_here
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

2. Install dependencies:

```sh
pnpm install
```

3. Run the development server:

```sh
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

You can deploy this app on Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/ai-chatbot&env=AUTH_SECRET,GOOGLE_GENERATIVE_AI_API_KEY,POSTGRES_URL,BLOB_READ_WRITE_TOKEN)

## License

This project is licensed under the MIT License.
# dc-chatbot
