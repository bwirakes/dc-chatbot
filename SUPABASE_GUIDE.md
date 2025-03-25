# Supabase Database Guide

This guide provides instructions for working with your Supabase PostgreSQL database for production deployment.

## Database Credentials

Your Supabase database credentials are stored in `.env.local` and should be kept secure. These credentials include:

- `POSTGRES_URL`: The main connection string for your database
- `POSTGRES_USER`: Your database username
- `POSTGRES_PASSWORD`: Your database password
- `POSTGRES_DATABASE`: Your database name
- `SUPABASE_URL`: Your Supabase project URL
- Other Supabase specific variables

## Testing the Connection

To test your database connection:

```bash
pnpm db:test-connection
```

This will verify that your application can successfully connect to the Supabase database.

## Database Migrations

To run database migrations:

```bash
pnpm db:migrate
```

This will apply all pending migrations to your Supabase database.

## Vercel Deployment

When deploying to Vercel:

1. Add all the Supabase environment variables to your Vercel project settings
2. Ensure the build command includes the database migration step (already configured in package.json)

## Common Tasks

### Viewing Database in Supabase Dashboard

1. Go to [https://app.supabase.com/projects](https://app.supabase.com/projects)
2. Select your project
3. Navigate to the "Table Editor" to view and edit data
4. Use the "SQL Editor" to run custom queries

### Creating a New Migration

1. Make changes to your schema in `lib/db/schema.ts`
2. Generate a migration:
   ```bash
   pnpm db:generate
   ```
3. Review the generated migration in `lib/db/migrations`
4. Apply the migration:
   ```bash
   pnpm db:migrate
   ```

### Connecting to Database Studio

To use Drizzle Studio to view and modify your database:

```bash
pnpm db:studio
```

This opens a local web interface for managing your database.

## Troubleshooting

### SSL Connection Issues

If you encounter SSL connection issues, ensure that:
- The `ssl: true` option is set in your database connection configuration
- Your Supabase database allows connections from your IP address

### Connection Pooling

For production use, connection pooling is configured with:
- Maximum of 10 connections
- 20-second idle timeout
- 10-second connection timeout

Adjust these settings in `lib/db/queries.ts` if needed for your workload.

### Health Check

Visit `/api/health` on your deployed application to verify database connectivity.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Vercel Deployment Documentation](https://vercel.com/docs) 
