import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/guards";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}

