import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/drizzle/db";
import { nextCookies } from "better-auth/next-js";
import { sendPasswordResetEmail } from "../emails/send-password-reset-email";
import { sendVerificationEmail } from "../emails/send-verification-email";
import { createAuthMiddleware } from "better-auth/api";
import { sendWelcomeEmail } from "../emails/send-welcome-email";

export const auth = betterAuth({
	user: {
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async ({ user, url, newEmail }) => {
				await sendVerificationEmail({
					user: { ...user, email: newEmail },
					url,
				});
			},
		},
		additionalFields: {
			favouriteNumber: {
				type: "number",
				required: true,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail({ user, url });
		},
		resetPasswordTokenExpiresIn: 60 * 15, // 15 minutes
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail({ user, url });
		},
		expiresIn: 60 * 60 * 24, // 24 hours
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			mapProfileToUser: (profile) => {
				return {
					favouriteNumber: Number(profile.public_repos) || 0,
				};
			},
		},
		discord: {
			clientId: process.env.DISCORD_CLIENT_ID!,
			clientSecret: process.env.DISCORD_CLIENT_SECRET!,
			mapProfileToUser: () => {
				return {
					favouriteNumber: 0,
				};
			},
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60, // 1 minute
		},
	},
	plugins: [nextCookies()],
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path.startsWith("/sign-up")) {
				const user = ctx.context.newSession?.user ?? {
					name: ctx.body.name,
					email: ctx.body.email,
				};
				if (user !== null) {
					await sendWelcomeEmail({
						email: user.email,
						name: user.name,
					});
				}
			}
		}),
	},
});
