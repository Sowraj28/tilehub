import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token && verifyToken(token)) {
    redirect("/admin/dashboard");
  }
  return <AdminLoginForm />;
}
