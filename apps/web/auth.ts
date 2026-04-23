import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtecting = nextUrl.pathname.match(/^\/[^/]+$/) || nextUrl.pathname.match(/^\/[^/]+\/order$/);
      // Let dashboard use its own token check (middleware.ts will handle it first)
      if (nextUrl.pathname.startsWith('/dashboard')) return true;

      // If they are on a protected route (Menu or Checkout), require login
      if (isProtecting && !isLoggedIn) {
        return false; // Redirects to sign in page
      }
      return true;
    },
  },
})
