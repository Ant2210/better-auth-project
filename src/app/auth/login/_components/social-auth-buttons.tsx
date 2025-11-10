"use client";

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import {
	SUPPORTED_OAUTH_PROVIDERS,
	SUPPORTED_OAUTH_PROVIDERS_DETAILS,
} from "@/lib/auth/o-auth-provider";

export const SocialAuthButtons = () => {
	return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
		const Icon = SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].Icon;

		return (
			<BetterAuthActionButton
				key={provider}
				variant="outline"
				action={() => {
					return authClient.signIn.social({
						provider,
						callbackURL: "/",
					});
				}}>
				<Icon />
				{SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].name}
			</BetterAuthActionButton>
		);
	});
};
