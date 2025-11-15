import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/drizzle/db";
import { nextCookies } from "better-auth/next-js";
import { sendPasswordResetEmail } from "../emails/send-password-reset-email";
import { sendVerificationEmail } from "../emails/send-verification-email";
import { createAuthMiddleware } from "better-auth/api";
import { sendWelcomeEmail } from "../emails/send-welcome-email";
import { sendDeleteAccountVerificationEmail } from "../emails/send-delete-account-verification-email";
import { admin as adminPlugin, twoFactor } from "better-auth/plugins";
import { organization } from "better-auth/plugins/organization";
import { ac, admin, user } from "@/components/auth/permissions";
import { sendOrganizationInviteEmail } from "../emails/send-organization-invite-email";
import { desc, eq } from "drizzle-orm";
import { member } from "@/drizzle/schema";

export const auth = betterAuth({
	appName: "Better Auth",
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
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url }) => {
				await sendDeleteAccountVerificationEmail({ user, url });
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
	plugins: [
		nextCookies(),
		twoFactor({
			issuer: "Better Auth",
		}),
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
			},
		}),
		organization({
			sendInvitationEmail: async ({
				email,
				organization,
				inviter,
				invitation,
			}) => {
				await sendOrganizationInviteEmail({
					invitation,
					inviter: inviter.user,
					organization,
					email,
				});
			},
		}),
	],
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
	databaseHooks: {
		session: {
			create: {
				before: async (userSession) => {
					const membership = await db.query.member.findFirst({
						where: eq(member.userId, userSession.userId),
						orderBy: desc(member.createdAt),
						columns: { organizationId: true },
					});

					return {
						data: {
							...userSession,
							activeOrganizationId: membership?.organizationId,
						},
					};
				},
			},
		},
	},
});
