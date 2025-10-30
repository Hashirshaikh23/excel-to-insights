import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookieArray: { name: string; value: string }[]) {
          try {
            cookieArray.forEach(({ name, value, ...options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Silently fail in non-server contexts
            // Avoid noisy warnings when used in Server Components
          }
        },
      },
    },
  );
}

// Use this in Server Components (e.g., page.tsx) to avoid write attempts to cookies
export async function getSupabaseServerReadOnly() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // No-op to prevent "Cookies can only be modified..." errors in non-route contexts
        setAll() {},
      },
    },
  );
}
