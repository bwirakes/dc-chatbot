# Stairway - DC Probate Assistant

This is a Next.js chatbot application using the AI SDK, configured to help with DC probate matters.

## Features

- AI chat with Google Gemini 1.5 Pro and other models
- Clean, minimalist UI
- File upload support
- Chat history
- User authentication
- Supabase database integration
- Redis caching (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Google AI Studio API key (get one at https://aistudio.google.com/app/apikey)
- A Supabase account (for database)
- A Vercel account (for deployment)

### Environment Setup

1. Copy the `.env.example` file to `.env.local` and fill in the required values:

```sh
# AUTH_SECRET can be generated with: openssl rand -base64 32
AUTH_SECRET=your_auth_secret_key_here

# API keys for models
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
XAI_API_KEY=your_xai_key_here
GROQ_API_KEY=your_groq_key_here

# Database connections
POSTGRES_URL=your_postgres_url_here
# Other database variables...

# Supabase connections
SUPABASE_URL=your_supabase_url
# Other Supabase variables...

# Storage
BLOB_READ_WRITE_TOKEN=your_blob_token_here

# Redis (optional)
REDIS_URL=your_redis_url
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

## Deployment to Vercel

### Automatic Deployment

You can deploy this app on Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/your-repo&env=AUTH_SECRET,GOOGLE_GENERATIVE_AI_API_KEY,XAI_API_KEY,GROQ_API_KEY,POSTGRES_URL,BLOB_READ_WRITE_TOKEN,SUPABASE_URL,NEXT_PUBLIC_SUPABASE_URL,SUPABASE_JWT_SECRET,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Manual Deployment

1. **Push your code to GitHub**:
   ```sh
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New..." and select "Project"
   - Import your Git repository
   - Select "Next.js" as the framework preset

3. **Configure Environment Variables**:
   - In the Vercel project settings, go to "Environment Variables"
   - Add all the variables from your `.env.production` file
   - Make sure to set proper values for production environment

4. **Configure Build Settings**:
   - Build Command: `pnpm run build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

5. **Deploy**:
   - Click "Deploy" and wait for the build to complete

### Post-Deployment Steps

1. **Set up Database Migrations**:
   - If using the Vercel PostgreSQL integration, migrations will run automatically during build
   - For custom database setups, you may need to run migrations manually

2. **Verify Environment Variables**:
   - After deployment, verify all environment variables are set correctly
   - You can check the "Deployments" tab for any build errors related to missing variables

3. **Enable Preview Deployments** (optional):
   - In your project settings, you can enable preview deployments for pull requests

## Troubleshooting

- **Database Connection Issues**: Ensure your POSTGRES_URL is correctly formatted and accessible from Vercel's servers
- **Build Failures**: Check the build logs for specific errors
- **API Key Issues**: Verify all API keys are correctly set in environment variables
- **Missing Environment Variables**: Make sure all required environment variables are set in the Vercel dashboard

## License

This project is licensed under the MIT License.
