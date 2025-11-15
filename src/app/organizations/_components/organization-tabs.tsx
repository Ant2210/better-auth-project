"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth/auth-client";
import { MembersTab } from "./members-tab";
import { InvitesTab } from "./invites-tab";

export const OrganizationTabs = () => {
	const { data: activeOrganization } = authClient.useActiveOrganization();

	return (
		<div className="space-y-5">
			{activeOrganization && (
				<Tabs defaultValue="members" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="members">Members</TabsTrigger>
						<TabsTrigger value="invitations">Invitations</TabsTrigger>
						<TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
					</TabsList>
					<Card>
						<CardContent>
							<TabsContent value="members">
								<MembersTab />
							</TabsContent>

							<TabsContent value="invitations">
								<InvitesTab />
							</TabsContent>

							<TabsContent value="subscriptions">Subscriptions Tab</TabsContent>
						</CardContent>
					</Card>
				</Tabs>
			)}
		</div>
	);
};
