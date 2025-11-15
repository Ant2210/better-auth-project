"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { BetterAuthActionButton } from "./better-auth-action-button";
import { UserX } from "lucide-react";

export const ImpersonationIndicator = () => {
	const router = useRouter();
	const { data: session, refetch } = authClient.useSession();

	if (!session?.session.impersonatedBy) return null;

	return (
		<div className="fixed bottom-4 left-4 z-50">
			<BetterAuthActionButton
				variant="destructive"
				size="sm"
				action={() =>
					authClient.admin.stopImpersonating(undefined, {
						onSuccess: () => {
							router.push("/admin");
							refetch();
						},
					})
				}>
				<UserX className="size-4" />
			</BetterAuthActionButton>
		</div>
	);
};
