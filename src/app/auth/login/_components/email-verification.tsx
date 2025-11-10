import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useRef, useState } from "react";

export const EmailVerificationTab = ({ email }: { email: string }) => {
	const [timeToNextResend, setTimeToNextResend] = useState(30);
	const interval = useRef<NodeJS.Timeout>(undefined);

	const startEmailVerificationCountdown = (time = 30) => {
		setTimeToNextResend(time);

		interval.current = setInterval(() => {
			setTimeToNextResend((t) => {
				const newT = t - 1;

				if (newT <= 0) {
					clearInterval(interval.current);
					return 0;
				}
				return newT;
			});
		}, 1000);
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		startEmailVerificationCountdown();
	}, []);

	return (
		<div className="space-y-4 flex flex-col gap-y-2">
			<p className="text-sm text-muted-foreground">
				A verification email has been sent to <strong>{email}</strong> please
				check your inbox and follow the instructions verify your email address.
			</p>
			<p className="text-sm text-muted-foreground">
				Don&apos;t forget to check your spam folder
			</p>

			<BetterAuthActionButton
				variant="outline"
				className="w-full"
				successMessage="Verification email sent"
				disabled={timeToNextResend > 0}
				action={() => {
					startEmailVerificationCountdown(30);
					return authClient.sendVerificationEmail({
						email,
						callbackURL: "/",
					});
				}}>
				{timeToNextResend > 0 ? (
					<>
						Resend Email{" "}
						<span className="inline-block w-6 text-center">
							({timeToNextResend})
						</span>
					</>
				) : (
					"Resend Email"
				)}
			</BetterAuthActionButton>
		</div>
	);
};
