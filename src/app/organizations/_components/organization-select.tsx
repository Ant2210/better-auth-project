"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

export const OrganizationSelect = () => {
	const { data: activeOrganization } = authClient.useActiveOrganization();
	const { data: organizations } = authClient.useListOrganizations();

	if (!organizations || !organizations.length) {
		return null;
	}

	const setActiveOrganization = (organizationId: string) => {
		authClient.organization.setActive(
			{ organizationId },
			{
				onError: (error) => {
					toast.error(error.error.message || "Failed to switch organization");
				},
				onSuccess: () => {
					toast.success("Successfully switched organization");
				},
			},
		);
	};

	return (
		<Select
			value={activeOrganization?.id ?? ""}
			onValueChange={setActiveOrganization}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder="Select an organization" />
			</SelectTrigger>
			<SelectContent>
				{organizations.map((org) => (
					<SelectItem key={org.id} value={org.id}>
						{org.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
