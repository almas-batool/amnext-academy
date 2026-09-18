// ─────────────────────────────────────────────────────────────
//  src/lib/auth.ts
//  NextAuth.js configuration: providers, JWT callbacks, RBAC.
// ─────────────────────────────────────────────────────────────

import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // ── Google OAuth ─────────────────────────────────────────
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── Email / Password ──────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("No account found with this email");
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) throw new Error("Incorrect password");

        //if (!user.emailVerified) {
          //throw new Error(
            //"Please verify your email before logging in"
          //);
        //}

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          image: user.image,
          role:  user.role,
        };
      },
    }),
  ],

  callbacks: {
    // ── Persist role in JWT ───────────────────────────────────
    async jwt({ token, user, account }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as any).role ?? "STUDENT";
      }

      // Google OAuth – upsert user in DB
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name, image: user.image },
          create: {
            email:         user.email,
            name:          user.name,
            image:         user.image,
            emailVerified: true,
            role:          "STUDENT",
            profile:       { create: { xp: 0, level: 1, streak: 0 } },
          },
        });
        token.id   = dbUser.id;
        token.role = dbUser.role;
      }

      return token;
    },

    // ── Expose id + role on session ───────────────────────────
    async session({ session, token }) {
      if (token) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

/** Server-side helper to get the current session. */
export const getAuthSession = () => getServerSession(authOptions);

/** Throws if the user is not logged in or doesn't have the required role. */
export async function requireAuth(
  roles?: string[]
): Promise<NonNullable<Awaited<ReturnType<typeof getAuthSession>>>["user"]> {
  const session = await getAuthSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (roles && !roles.includes(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session.user;
}

