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

const totpSchema = z.object({
	code: z.string().min(6, { message: "Code should be 6 characters long" }),
});

type TotpForm = z.infer<typeof totpSchema>;

export const TotpForm = () => {
	const router = useRouter();
	const form = useForm<TotpForm>({
		resolver: zodResolver(totpSchema),
		defaultValues: {
			code: "",
		},
	});

	const { isSubmitting } = form.formState;

	const handleTotpVerification = async (data: TotpForm) => {
		await authClient.twoFactor.verifyTotp(data, {
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
				onSubmit={form.handleSubmit(handleTotpVerification)}>
				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Code</FormLabel>
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
