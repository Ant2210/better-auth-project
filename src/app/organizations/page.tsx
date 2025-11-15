import { auth } from "@/lib/auth/auth";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OrganizationSelect } from "./_components/organization-select";
import { CreateOrganizationButton } from "./_components/create-organization-button";
import { OrganizationTabs } from "./_components/organization-tabs";

const OrganizationsPage = async () => {
	const session = auth.api.getSession({ headers: await headers() });
	if (!session) return redirect("/auth/login");

	return (
		<div className="container mx-auto my-6 px-4">
			<Link href="/" className="inline-flex items-center mb-6">
				<ArrowLeft className="size-4 mr-2" />
				Back to Home
			</Link>

			<div className="flex items-center mb-8 gap-2">
				<OrganizationSelect />
				<CreateOrganizationButton />
			</div>

			<OrganizationTabs />
		</div>
	);
};

export default OrganizationsPage;
