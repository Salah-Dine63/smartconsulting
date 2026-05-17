import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// IMPORTANT: Provide NEXTAUTH_SECRET in your .env file
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID || "",
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
            tenantId: process.env.AZURE_AD_TENANT_ID || "common",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "you@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("[AUTH DEBUG] authorize called with email:", credentials?.email)
                if (!credentials?.email || !credentials?.password) {
                    console.log("[AUTH DEBUG] Missing email or password in credentials")
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email.toLowerCase().trim() }
                })

                console.log("[AUTH DEBUG] User found in database:", user ? { id: user.id, email: user.email, role: user.role, hasPassword: !!user.password } : "NOT FOUND")

                if (!user || !user.password) {
                    console.log("[AUTH DEBUG] User not found or has no password")
                    return null
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
                console.log("[AUTH DEBUG] Password validation result:", isPasswordValid)
                if (!isPasswordValid) {
                    console.log("[AUTH DEBUG] Password mismatch")
                    return null
                }

                console.log("[AUTH DEBUG] Authorization successful for user:", user.email)
                return { id: user.id, email: user.email, name: user.name, role: user.role }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role || "USER"
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role || "USER";
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development"
}
