/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { TOKEN_KEY } from "@/lib/token";
import { Api, ApiError, INTERNAL_API_URL } from "@/lib/api";
import type { NextAuthOptions } from "next-auth";
import { Account } from "@/modules/account/account.type";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "@/modules/auth/auth.service";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        cpf: {
          label: "Cpf",
          type: "text",
          placeholder: "your_email@email.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "********",
        },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        const api = new Api(INTERNAL_API_URL);
        const authService = new AuthService(api);

        try {
          const { accessToken } = await authService.login({
            ...credentials,
          });

          api.setAccessToken(accessToken);

          const cookie = await cookies();
          cookie.set(TOKEN_KEY, accessToken);

          return {} as any; // Dont need the account state stored in NextAuth
        } catch (error: unknown) {
          if (error instanceof ApiError) {
            throw error;
          }

          throw new Error("An unexpected error occurred. ( client/src/app/api/auth/options.ts )");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = token.user as Account;
      return session;
    },
  },
};
