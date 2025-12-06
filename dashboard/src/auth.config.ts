import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

// Notice: We cannot import 'db' (Prisma) here if we want this to be Edge compatible.
// But for Credentials provider with database check, we usually need it.
// However, middleware mainly checks for session token presence.
// For the actual authorize logic, it runs on Node if using 'auth.ts'.
// But middleware imports this config.

// To make it truly edge compatible, we should separate the provider configuration if it relies on Node APIs.
// But 'bcryptjs' and 'zod' are fine. 'db' is NOT fine on Edge.

// STRATEGY: 
// 1. Define the config without the adapter here.
// 2. The authorize function uses 'db'. This function is only called on login (POST), which is not middleware.
// Middleware only verifies the session.

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        }
    },
    providers: [], // Providers are added in auth.ts to avoid Edge issues if they need Node modules
} satisfies NextAuthConfig
