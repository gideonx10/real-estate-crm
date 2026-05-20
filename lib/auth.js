import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "CRM Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const configuredEmail = process.env.CRM_ADMIN_EMAIL;
        const configuredPassword = process.env.CRM_ADMIN_PASSWORD;

        if (!configuredEmail || !configuredPassword) {
          return null;
        }

        if (credentials?.email === configuredEmail && credentials?.password === configuredPassword) {
          return {
            id: "crm-admin",
            name: "CRM Admin",
            email: configuredEmail,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};
