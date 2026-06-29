import { redirect } from "next/navigation";

export default function PrivatePage() {
  redirect("/dashboard");
}
