/**
 * Supabase Client for API Routes
 *
 * Creates a Supabase client for use in Next.js API routes
 * with proper cookie handling for authentication.
 */
import { cookies } from 'next/headers';

import { type CookieOptions, createServerClient } from '@supabase/ssr';

/**
 * Create a Supabase client for API routes
 * This function handles the cookie-based authentication properly
 */
export async function createAPIClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
