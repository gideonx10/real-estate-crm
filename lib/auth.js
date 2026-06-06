import CredentialsProvider from "next-auth/providers/credentials";
import { getSupabaseServerClient } from "@/lib/supabase";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 15 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 15 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "CRM Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const supabase = getSupabaseServerClient();
        const username = String(credentials?.email || "").trim();
        const password = String(credentials?.password || "");

        if (!supabase || !username || !password) {
          return null;
        }

        const { data, error } = await supabase.rpc("authenticate_app_user", {
          input_username: username,
          input_password: password,
        });

        const user = Array.isArray(data) ? data[0] : data;

        if (error || !user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.username,
          role: user.role || "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
