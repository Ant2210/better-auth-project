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
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const signInSchema = z.object({
	email: z.email().min(1, { message: "Email is required" }),
	password: z.string().min(1, { message: "Password is required" }),
});

type SignInForm = z.infer<typeof signInSchema>;

export const SignInTab = ({
	openEmailVerificationTab,
	openForgotPassword,
}: {
	openEmailVerificationTab: (email: string) => void;
	openForgotPassword: () => void;
}) => {
	const router = useRouter();
	const form = useForm<SignInForm>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { isSubmitting } = form.formState;

	const handleSignIn = async (data: SignInForm) => {
		await authClient.signIn.email(
			{
				...data,
				callbackURL: "/",
			},
			{
				onSuccess: () => {
					router.push("/");
				},
				onError: (ctx) => {
					if (
						ctx.error.message === "Email not verified" ||
						ctx.error.code === "EMAIL_NOT_VERIFIED" ||
						ctx.error.status === 403
					) {
						toast.error(
							<div>
								Email not verified{" "}
								<Button
									variant="link"
									className="text-blue-800 p-0"
									onClick={() => {
										authClient.sendVerificationEmail({
											email: data.email,
											callbackURL: "/",
										});
										openEmailVerificationTab(data.email);
									}}>
									click here
								</Button>{" "}
								to verify
							</div>,
						);
					} else {
						toast.error(ctx.error.message || "Failed to sign in");
					}
				},
			},
		);
	};

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(handleSignIn)}>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<div className="flex justify-between items-center">
								<FormLabel>Password</FormLabel>
								<Button
									onClick={openForgotPassword}
									type="button"
									variant="link"
									size="sm"
									className="text-sm font-normal underline">
									Forgot password?
								</Button>
							</div>
							<FormControl>
								<PasswordInput {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isSubmitting} className="w-full">
					<LoadingSwap isLoading={isSubmitting}>Sign In</LoadingSwap>
				</Button>
			</form>
		</Form>
	);
};
