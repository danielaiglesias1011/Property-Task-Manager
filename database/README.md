# Database Migration Guide

This guide will help you set up your Supabase database with the Property Task Manager schema and seed data.

## Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project created
2. **Environment Variables**: Ensure your `.env` file has the correct Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Step 1: Create Database Schema

1. Go to your Supabase dashboard
2. Navigate to the **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Click **Run** to create all tables and relationships

## Step 2: Add Seed Data

### Option A: Using SQL (Recommended)

1. In the Supabase SQL Editor
2. Copy and paste the contents of `seed-data.sql`
3. Click **Run** to populate the database with sample data

### Option B: Using JavaScript Migration Script

1. Install dependencies:
   ```bash
   npm install dotenv
   ```

2. Run the migration script:
   ```bash
   node database/migrate-to-supabase.js
   ```

## Step 3: Verify Data

1. Go to the **Table Editor** in your Supabase dashboard
2. Check that all tables have been created:
   - `users`
   - `properties`
   - `projects`
   - `tasks`
   - `funding_details`
   - `project_categories`
   - `priorities`
   - `statuses`
   - `approval_groups`
   - `attachment_types`
   - `attachments`
   - `comments`
   - `approval_history`

3. Verify that sample data has been inserted

## Database Schema Overview

### Core Tables

- **users**: User accounts with roles and permissions
- **properties**: Properties managed by the system
- **projects**: Projects associated with properties
- **tasks**: Tasks within projects
- **funding_details**: Financial details for projects

### Configuration Tables

- **project_categories**: Categories for organizing projects
- **priorities**: Priority levels for projects and tasks
- **statuses**: Status types for projects and tasks
- **approval_groups**: Groups for approval workflows
- **attachment_types**: Types of attachments

### Relationship Tables

- **attachments**: File attachments for projects/tasks
- **comments**: Comments on tasks
- **approval_history**: History of approval actions

## Sample Data Included

The migration includes:

- **3 Users**: Admin, Manager, and Regular user
- **2 Properties**: Corporate Headquarters and Regional Distribution Center
- **2 Projects**: HVAC System Upgrade and Parking Lot Resurfacing
- **5 Tasks**: Various tasks across the projects
- **3 Funding Details**: Payment information for projects
- **Default Categories, Priorities, and Statuses**: Complete configuration data

## Next Steps

After running the migration:

1. Update your React app to use Supabase instead of local state
2. Implement authentication with Supabase Auth
3. Add real-time subscriptions for live updates
4. Set up Row Level Security (RLS) policies

## Troubleshooting

### Common Issues

1. **Permission Errors**: Make sure your Supabase key has the correct permissions
2. **Duplicate Data**: If you run the migration multiple times, you may get duplicate key errors
3. **Missing Tables**: Ensure the schema was created successfully before running seed data

### Clearing Data

If you need to start over:

```sql
-- WARNING: This will delete all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Then re-run the schema and seed data scripts.

