import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user) {
          const [newUser] = await db.insert(users).values({
            email: credentials.email as string,
            password: credentials.password as string, 
            name: (credentials.email as string).split("@")[0],
          }).returning();
          return newUser;
        }

        if (user.password === credentials.password) {
          return user;
        }

        return null;
      },
    }),
  ],
});
