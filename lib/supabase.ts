import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side browser client — uses createBrowserClient so the session is
// stored in cookies (readable by middleware) as well as localStorage.
// createBrowserClient is a singleton: all components share the same instance.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (uses service role, bypasses RLS)
// Only ever used in API routes — never exposed to browser
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : createClient(supabaseUrl, supabaseAnonKey);