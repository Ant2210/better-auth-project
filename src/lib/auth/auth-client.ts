import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import {
	twoFactorClient,
	inferAdditionalFields,
	adminClient,
	organizationClient,
} from "better-auth/client/plugins";
import { ac, admin, user } from "@/components/auth/permissions";

export const authClient = createAuthClient({
	plugins: [
		twoFactorClient(),
		inferAdditionalFields<typeof auth>(),
		adminClient({
			ac,
			roles: {
				admin,
				user,
			},
		}),
		organizationClient(),
	],
});
