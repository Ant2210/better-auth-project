"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const createOrganizationSchema = z.object({
	name: z.string().min(1, { message: "Organization name is required" }),
});

type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>;

export const CreateOrganizationButton = () => {
	const [dialogOpen, setDialogOpen] = useState(false);
	const form = useForm<CreateOrganizationForm>({
		resolver: zodResolver(createOrganizationSchema),
		defaultValues: {
			name: "",
		},
	});

	const { isSubmitting } = form.formState;

	const handleCreateOrganization = async (data: CreateOrganizationForm) => {
		const slug = data.name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-");

		const res = await authClient.organization.create({
			name: data.name,
			slug,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to create organization");
		} else {
			form.reset();
			setDialogOpen(false);
			const activeRes = await authClient.organization.setActive({
				organizationId: res.data.id,
			});

			if (activeRes.error) {
				toast.error(
					activeRes.error.message ||
						"Organization created, but failed to set new organization to your active organization, please contact support",
				);
			} else {
				toast.success("Successfully created a new organization");
			}
		}
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button>Create Organization</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Organization</DialogTitle>
					<DialogDescription>
						Create a new organization to collaborate with your team.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						className="space-y-4"
						onSubmit={form.handleSubmit(handleCreateOrganization)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="flex! flex-col! gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setDialogOpen(false)}
								disabled={isSubmitting}
								className="w-full">
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting} className="w-full">
								<LoadingSwap isLoading={isSubmitting}>Create</LoadingSwap>
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
