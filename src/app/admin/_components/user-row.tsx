"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { authClient } from "@/lib/auth/auth-client";
import { UserWithRole } from "better-auth/plugins";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const UserRow = ({
	user,
	selfId,
}: {
	user: UserWithRole;
	selfId: string;
}) => {
	const [dialogOpen, setDialogOpen] = useState(false);
	const router = useRouter();
	const { refetch } = authClient.useSession();
	const isSelf = user.id === selfId;

	const handleImpersonateUser = (userId: string) => {
		authClient.admin.impersonateUser(
			{ userId },
			{
				onError: (error) => {
					toast.error(error.error.message || "Failed to impersonate user");
				},
				onSuccess: () => {
					refetch();
					router.push("/");
				},
			},
		);
	};

	const handleRevokeSessions = (userId: string) => {
		authClient.admin.revokeUserSessions(
			{ userId },
			{
				onError: (error) => {
					toast.error(error.error.message || "Failed to revoke user sessions");
				},
				onSuccess: () => {
					toast.success("User sessions revoked");
				},
			},
		);
	};

	const handleUnbanUser = (userId: string) => {
		authClient.admin.unbanUser(
			{ userId },
			{
				onError: (error) => {
					toast.error(error.error.message || "Failed to unban user");
				},
				onSuccess: () => {
					toast.success("User unbanned");
					router.refresh();
				},
			},
		);
	};

	const handleBanUser = (userId: string) => {
		authClient.admin.banUser(
			{ userId },
			{
				onError: (error) => {
					toast.error(error.error.message || "Failed to ban user");
				},
				onSuccess: () => {
					toast.success("User banned");
					router.refresh();
				},
			},
		);
	};

	const handleRemoveUser = (userId: string) => {
		authClient.admin.removeUser(
			{ userId },
			{
				onError: (error) => {
					toast.error(error.error.message || "Failed to remove user");
				},
				onSuccess: () => {
					toast.success("User removed");
					router.refresh();
				},
			},
		);
	};

	return (
		<>
			<TableRow key={user.id}>
				<TableCell>
					<div>
						<div className="font-medium">{user.name || "No name"}</div>
						<div className="text-sm text-muted-foreground">{user.email}</div>
						<div className="flex items-center gap-2 not-empty:mt-2">
							{user.banned && <Badge variant="destructive">Banned</Badge>}
							{!user.emailVerified && (
								<Badge variant="outline">Unverified</Badge>
							)}
							{isSelf && <Badge>You</Badge>}
						</div>
					</div>
				</TableCell>
				<TableCell>
					<Badge
						variant={user.role === "admin" ? "default" : "secondary"}
						className="capitalize">
						{user.role}
					</Badge>
				</TableCell>
				<TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
				<TableCell>
					{!isSelf && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="rounded-full">
									<MoreHorizontal className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									onClick={() => handleImpersonateUser(user.id)}>
									Impersonate
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleRevokeSessions(user.id)}>
									Revoke Sessions
								</DropdownMenuItem>
								{user.banned ? (
									<DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
										Unban User
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem onClick={() => handleBanUser(user.id)}>
										Ban User
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={() => setDialogOpen(true)}>
									Delete User
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</TableCell>
			</TableRow>
			<AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this user? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => handleRemoveUser(user.id)}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
