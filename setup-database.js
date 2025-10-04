#!/usr/bin/env node

// Simple setup script for Supabase database
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

console.log('🚀 Property Task Manager - Database Setup');
console.log('==========================================\n');

// Check for environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set the following in your .env file:');
  console.error('REACT_APP_SUPABASE_URL=your_supabase_url');
  console.error('REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase connection configured');
console.log('📋 Next steps:');
console.log('');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the contents of database/schema.sql');
console.log('4. Run the SQL to create tables');
console.log('5. Copy and paste the contents of database/seed-data.sql');
console.log('6. Run the SQL to populate with sample data');
console.log('');
console.log('📁 Files to use:');
console.log('   - database/schema.sql (creates tables)');
console.log('   - database/seed-data.sql (adds sample data)');
console.log('   - database/README.md (detailed instructions)');
console.log('');
console.log('🎉 After setup, your database will have:');
console.log('   - 3 sample users (Admin, Manager, Regular)');
console.log('   - 2 properties with projects');
console.log('   - 5 tasks across projects');
console.log('   - Funding details for cash flow forecast');
console.log('   - Complete configuration data');
console.log('');

// Test connection
try {
  const { data, error } = await supabase.from('users').select('count');
  if (error && error.code === 'PGRST116') {
    console.log('⚠️  Database tables not found - please run the schema.sql first');
  } else if (error) {
    console.log('⚠️  Connection test failed:', error.message);
  } else {
    console.log('✅ Database connection successful');
    console.log(`📊 Found ${data.length} users in database`);
  }
} catch (err) {
  console.log('⚠️  Could not test database connection');
}

console.log('\n📖 For detailed instructions, see database/README.md');

