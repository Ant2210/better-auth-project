// import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth/auth";
import { TabsContent } from "@radix-ui/react-tabs";
import { ArrowLeft, Key, LinkIcon, Shield, Trash2, User } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileUpdateForm } from "./_components/profile-update-form";

const ProfilePage = async () => {
	const session = await auth.api.getSession({ headers: await headers() });

	if (session === null) return redirect("/auth/login");

	return (
		<div className="max-w-4xl mx-auto my-6 px-4">
			<div className="mb-8">
				<Link href="/" className="inline-flex items-center mb-6">
					<ArrowLeft className="size-4 mr-2" />
					Back to Home
				</Link>
				<div className="flex items-center space-x-4">
					<div className="size-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
						{session.user.image ? (
							<Image
								width={64}
								height={64}
								src={session.user.image}
								alt="User Avatar"
								className="object-cover"
							/>
						) : (
							<User className="size-8 text-muted-foreground" />
						)}
					</div>
					<div className="flex-1">
						<div className="flex gap-1 justify-between items-start">
							<h1 className="text-3xl font-bold">
								{session.user.name || "User Profile"}
							</h1>
							{/* TODO: Add roles */}
							{/* <Badge>{session.user.role}</Badge>*/}
						</div>
						<p className="text-muted-foreground">{session.user.email}</p>
					</div>
				</div>
			</div>

			<Tabs>
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="profile">
						<User />
						<span className="max-sm:hidden">Profile</span>
					</TabsTrigger>
					<TabsTrigger value="security">
						<Shield />
						<span className="max-sm:hidden">Security</span>
					</TabsTrigger>
					<TabsTrigger value="sessions">
						<Key />
						<span className="max-sm:hidden">Sessions</span>
					</TabsTrigger>
					<TabsTrigger value="accounts">
						<LinkIcon />
						<span className="max-sm:hidden">Accounts</span>
					</TabsTrigger>
					<TabsTrigger value="danger">
						<Trash2 />
						<span className="max-sm:hidden">Danger</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile">
					<Card>
						<CardContent>
							<ProfileUpdateForm user={session.user} />
						</CardContent>
					</Card>
				</TabsContent>

				{/* TODO: PICK UP HERE AT 2:07 */}
				{/* <TabsContent value="security">
					<Card>
						<CardContent>
							<LoadingSuspense>
                <SecurityTab email={session.user.email} />
              </LoadingSuspense>
						</CardContent>
					</Card>
				</TabsContent> */}
			</Tabs>
		</div>
	);
};

export default ProfilePage;
