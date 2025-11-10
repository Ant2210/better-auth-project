"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignUpTab } from "./_components/sign-up-tab";
import { SignInTab } from "./_components/sign-in-tab";
import { Separator } from "@/components/ui/separator";
import { SocialAuthButtons } from "./_components/social-auth-buttons";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { EmailVerificationTab } from "./_components/email-verification";
import { ForgotPasswordTab } from "./_components/forgot-password";

type Tab = "signin" | "signup" | "email-verification" | "forgot-password";

const LoginPage = () => {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [selectedTab, setSelectedTab] = useState<Tab>("signin");
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && session) {
			router.push("/");
		}
	}, [session, isPending, router]);

	if (isPending) {
		return (
			<div className="flex items-center justify-center mt-12 gap-2">
				<Loader2 className="animate-spin" />
				Loading...
			</div>
		);
	}

	if (session) {
		return null;
	}

	const openEmailVerificationTab = (email: string) => {
		setEmail(email);
		setSelectedTab("email-verification");
	};

	return (
		<Tabs
			value={selectedTab}
			onValueChange={(t) => setSelectedTab(t as Tab)}
			className="mx-auto w-full my-6 px-4">
			{(selectedTab === "signin" || selectedTab === "signup") && (
				<TabsList>
					<TabsTrigger value={"signin"}>Sign In</TabsTrigger>
					<TabsTrigger value="signup">Sign Up</TabsTrigger>
				</TabsList>
			)}
			<TabsContent value="signin">
				<Card>
					<CardHeader className="text-2xl font-bold">
						<CardTitle>Sign In</CardTitle>
					</CardHeader>
					<CardContent>
						<SignInTab
							openEmailVerificationTab={openEmailVerificationTab}
							openForgotPassword={() => setSelectedTab("forgot-password")}
						/>
					</CardContent>
					<div className="relative mx-6">
						<Separator />
						<span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-card px-2 text-sm text-muted-foreground">
							Or sign in with
						</span>
					</div>
					<CardFooter className="grid grid-cols-2 gap-3">
						<SocialAuthButtons />
					</CardFooter>
				</Card>
			</TabsContent>

			<TabsContent value="signup">
				<Card>
					<CardHeader className="text-2xl font-bold">
						<CardTitle>Sign Up</CardTitle>
					</CardHeader>
					<CardContent>
						<SignUpTab openEmailVerificationTab={openEmailVerificationTab} />
					</CardContent>
					<div className="relative mx-6">
						<Separator />
						<span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-card px-2 text-sm text-muted-foreground">
							Or sign up with
						</span>
					</div>
					<CardFooter className="grid grid-cols-2 gap-3">
						<SocialAuthButtons />
					</CardFooter>
				</Card>
			</TabsContent>

			<TabsContent value="email-verification">
				<Card>
					<CardHeader className="text-2xl font-bold">
						<CardTitle>Verify your email</CardTitle>
					</CardHeader>
					<CardContent>
						<EmailVerificationTab email={email} />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="forgot-password">
				<Card>
					<CardHeader className="text-2xl font-bold">
						<CardTitle>Forgot Password</CardTitle>
					</CardHeader>
					<CardContent>
						<ForgotPasswordTab openSignInTab={() => setSelectedTab("signin")} />
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
};

export default LoginPage;
