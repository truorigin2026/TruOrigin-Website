import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SetPasswordForm } from "@/components/brand/set-password-form";
import { requireBrandUser } from "@/lib/session";

export default async function BrandSetPasswordPage() {
  const user = await requireBrandUser();

  if (!user.mustChangePassword) {
    redirect("/brand/dashboard");
  }

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Set a new password to continue."
        description="You're signed in with a temporary password. Choose a new one — the rest of your workspace unlocks once it's set."
      />
      <Card className="max-w-md">
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </>
  );
}
