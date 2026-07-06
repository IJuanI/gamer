import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/actions";

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
