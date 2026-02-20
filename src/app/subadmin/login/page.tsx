import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import SubAdminLoginForm from "./SubAdminLoginForm";

export default function SubAdminLoginPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("subadmin_token")?.value;
  if (token && verifyToken(token)) {
    redirect("/subadmin/dashboard");
  }
  return <SubAdminLoginForm />;
}
