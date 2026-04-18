"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getCurrentSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  return {
    user: session?.user || null,
    session: session?.session || null,
  };
}

export async function getUser() {
  const { user } = await getCurrentSession();
  return user;
}

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  });
}