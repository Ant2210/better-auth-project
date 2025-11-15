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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import QRCode from "react-qr-code";

const twoFactorAuthSchema = z.object({
	password: z.string().min(1, { message: "Password is required" }),
});

type TwoFactorAuthForm = z.infer<typeof twoFactorAuthSchema>;
type TwoFactorData = {
	totpURI: string;
	backupCodes: string[];
};

export const TwoFactorAuth = ({ isEnabled }: { isEnabled: boolean }) => {
	const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
		null,
	);
	const router = useRouter();
	const form = useForm<TwoFactorAuthForm>({
		resolver: zodResolver(twoFactorAuthSchema),
		defaultValues: {
			password: "",
		},
	});

	const { isSubmitting } = form.formState;

	const handleDisableTwoFactorAuth = async (data: TwoFactorAuthForm) => {
		await authClient.twoFactor.disable(
			{
				password: data.password,
			},
			{
				onError: (error) => {
					toast.error(error.error.message || "Failed to disable 2FA");
				},
				onSuccess: () => {
					form.reset();
					router.refresh();
				},
			},
		);
	};

	const handleEnableTwoFactorAuth = async (data: TwoFactorAuthForm) => {
		const result = await authClient.twoFactor.enable({
			password: data.password,
		});

		if (result.error) {
			toast.error(result.error.message || "Failed to enable 2FA");
		} else {
			setTwoFactorData(result.data);
			form.reset();
		}
	};

	if (twoFactorData !== null) {
		return (
			<QRCodeVerify
				{...twoFactorData}
				onDone={() => {
					setTwoFactorData(null);
				}}
			/>
		);
	}

	return (
		<Form {...form}>
			<form
				className="space-y-4"
				onSubmit={form.handleSubmit(
					isEnabled ? handleDisableTwoFactorAuth : handleEnableTwoFactorAuth,
				)}>
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

				<Button
					variant={isEnabled ? "destructive" : "default"}
					type="submit"
					disabled={isSubmitting}
					className="w-full">
					<LoadingSwap isLoading={isSubmitting}>
						{isEnabled ? "Disable 2FA" : "Enable 2FA"}
					</LoadingSwap>
				</Button>
			</form>
		</Form>
	);
};

const qrSchema = z.object({
	token: z.string().length(6),
});

type QrForm = z.infer<typeof qrSchema>;

const QRCodeVerify = ({
	totpURI,
	backupCodes,
	onDone,
}: TwoFactorData & { onDone: () => void }) => {
	const [successfullyEnabled, setSuccessfullyEnabled] = useState(false);
	const router = useRouter();
	const form = useForm<QrForm>({
		resolver: zodResolver(qrSchema),
		defaultValues: {
			token: "",
		},
	});

	const { isSubmitting } = form.formState;

	const handleQrCode = async (data: QrForm) => {
		await authClient.twoFactor.verifyTotp(
			{
				code: data.token,
			},
			{
				onError: (error) => {
					toast.error(error.error.message || "Failed to verify code");
				},
				onSuccess: () => {
					setSuccessfullyEnabled(true);
					form.reset();
					router.refresh();
				},
			},
		);
	};

	if (successfullyEnabled) {
		return (
			<>
				<p className="text-sm text-muted-foreground mb-4">
					Save these backup codes in a safe place. You can use them to access
					your account. They will{" "}
					<span className="font-bold underline">NOT</span> be displayed again.
				</p>
				<div className="grid grid-cols-2 gap-2 mb-4">
					{backupCodes.map((code, index) => (
						<div key={index} className="font-mono text-small">
							{code}
						</div>
					))}
				</div>
				<Button variant="outline" onClick={onDone}>
					Done
				</Button>
			</>
		);
	}

	return (
		<div className="space-y-4">
			<p>
				Scan this QR code with your authenticator app and enter the code below:
			</p>

			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(handleQrCode)}>
					<FormField
						control={form.control}
						name="token"
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
						<LoadingSwap isLoading={isSubmitting}>Submit Code</LoadingSwap>
					</Button>
				</form>
			</Form>
			<div className="p-3 bg-white w-fit rounded-lg mx-auto">
				<QRCode size={256} value={totpURI} />
			</div>
		</div>
	);
};
