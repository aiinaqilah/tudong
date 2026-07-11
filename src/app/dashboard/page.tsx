import { redirect } from "next/navigation";
import { getCurrentSession } from "@/actions/auth";

export default async function DashboardPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/api/login");

  const role = (user as { role?: string }).role ?? "customer";

  if (role === "admin") redirect("/dashboard/admin");
  if (role === "seller") redirect("/dashboard/seller");
  redirect("/dashboard/customer");
}
