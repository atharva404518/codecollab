import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Get the root directory of the project
const rootDir = path.resolve(__dirname, '../../');

// Check if .env file exists and log its path for debugging
const envPath = path.resolve(rootDir, '.env');
console.log(`Looking for .env file at: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);

// Load environment variables with explicit path
dotenv.config({ path: envPath });

// Log the environment variables (without values for security)
console.log('Environment variables loaded:');
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_URI exists:', !!process.env.SUPABASE_URI);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Use SUPABASE_URI as a fallback for SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_URI;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL/SUPABASE_URI environment variable');
  console.error('Current environment variables:', Object.keys(process.env).filter(key => 
    key.includes('SUPA') || key.includes('DATABASE')
  ));
  throw new Error('Missing SUPABASE_URL/SUPABASE_URI environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Create Supabase clients
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default supabaseAdmin; 
