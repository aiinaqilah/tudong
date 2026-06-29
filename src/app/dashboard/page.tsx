import { redirect } from "next/navigation";
import { getCurrentSession } from "@/actions/auth";

export default async function DashboardPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/api/login");

  const role = (user as { role?: string }).role ?? "user";

  if (role === "admin") redirect("/dashboard/admin");
  if (role === "seller") redirect("/dashboard/seller");
  redirect("/dashboard/user");
}
