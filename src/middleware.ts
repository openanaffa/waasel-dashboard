import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = ['/login', '/signup'].includes(req.nextUrl.pathname);
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');

  if (!user && isDashboard) return NextResponse.redirect(new URL('/login', req.url));
  if (user && isAuthPage)     return NextResponse.redirect(new URL('/dashboard', req.url));
  return res;
}

export const config = { matcher: ['/dashboard/:path*', '/login', '/signup'] };
