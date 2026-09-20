/**
 * Shared Supabase admin client (service_role key).
 *
 * The Express backend is a trusted server, so it connects with the
 * service_role key, which bypasses Row Level Security. This key must
 * NEVER be shipped to the frontend — it stays in backend/.env.
 *
 * dotenv is loaded here (in addition to server.js) because this module
 * is imported before any other code runs, so the .env values are always
 * available by the time the client is created.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    '[supabase] Missing configuration.\n' +
      '           Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env\n' +
      '           (copy backend/.env.example to get started).\n' +
      '           Create the tables first by running backend/supabase/schema.sql\n' +
      '           in the Supabase Dashboard → SQL Editor.'
  );
  process.exit(1);
}

export const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
