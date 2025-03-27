import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      
      // Check for auth-specific paths using more precise checks
      const isOnLogin = pathname === '/login';
      const isOnRegister = pathname === '/register';
      const isOnAuthPage = isOnLogin || isOnRegister;
      
      // Root page and specific chat routes
      const isOnRootPage = pathname === '/';
      const isOnChatRoute = pathname.match(/^\/[a-zA-Z0-9-]+$/) !== null;

      // If user is logged in and trying to access auth pages, redirect to home
      if (isLoggedIn && isOnAuthPage) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // Always allow access to auth pages (login/register) for non-logged in users
      if (isOnAuthPage) {
        return true;
      }

      // Protected routes check
      if (isOnRootPage || isOnChatRoute) {
        return isLoggedIn;
      }

      // All other routes should be accessible
      return true;
    },
  },
} satisfies NextAuthConfig;
