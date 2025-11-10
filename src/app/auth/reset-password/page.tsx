"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: "Password requires a minimum of 8 characters" }),
		confirmPassword: z
			.string()
			.min(1, { message: "Please confirm your password" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const error = searchParams.get("error");
	const router = useRouter();

	const form = useForm<ResetPasswordForm>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const { isSubmitting } = form.formState;

	const handleResetPassword = async (data: ResetPasswordForm) => {
		if (token === null) return;
		await authClient.resetPassword(
			{
				newPassword: data.password,
				token: token,
			},
			{
				onError: (ctx) => {
					toast.error(ctx.error.message || "Failed to reset password");
				},
				onSuccess: () => {
					toast.success("Password reset successful", {
						description: "Redirecting to login",
					});
					setTimeout(() => {
						router.push("/auth/login");
					}, 1000);
				},
			},
		);
	};

	if (token === null || error !== null) {
		return (
			<Card className="w-full max-w-md my-6 mx-auto">
				<CardHeader>
					<CardTitle>Invalid Reset Link</CardTitle>
					<CardDescription>
						The password reset link is invalid or has expired.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button className="w-full" asChild>
						<Link href="/auth/login">Back to Login</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md my-6 mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl">Reset Your Password</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						className="space-y-4"
						onSubmit={form.handleSubmit(handleResetPassword)}>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<PasswordInput {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<PasswordInput {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" disabled={isSubmitting} className="w-full">
							<LoadingSwap isLoading={isSubmitting}>Reset Password</LoadingSwap>
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};

export default ResetPasswordPage;
