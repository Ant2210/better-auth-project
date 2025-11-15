"use client";

import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const backupCodeSchema = z.object({
	code: z.string().min(1, { message: "Code is required" }),
});

type BackupCodeForm = z.infer<typeof backupCodeSchema>;

export const BackupCodeTab = () => {
	const router = useRouter();
	const form = useForm<BackupCodeForm>({
		resolver: zodResolver(backupCodeSchema),
		defaultValues: {
			code: "",
		},
	});

	const { isSubmitting } = form.formState;

	const handleBackupCodeVerification = async (data: BackupCodeForm) => {
		await authClient.twoFactor.verifyBackupCode(data, {
			onError: (error) => {
				toast.error(error.error.message || "Failed to verify code");
			},
			onSuccess: () => {
				router.push("/");
			},
		});
	};

	return (
		<Form {...form}>
			<form
				className="space-y-4"
				onSubmit={form.handleSubmit(handleBackupCodeVerification)}>
				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Backup Code</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isSubmitting} className="w-full">
					<LoadingSwap isLoading={isSubmitting}>Verify</LoadingSwap>
				</Button>
			</form>
		</Form>
	);
};
