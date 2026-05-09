import { Link, useNavigate } from "react-router";
import { AuthForm } from "../components/auth/AuthForm";
import { Card } from "../components/ui/Card";
import { useAuth } from "../features/auth/useAuth";

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md p-6">
        <AuthForm
          title="Create account"
          submitLabel="Register"
          onSubmit={async (email, password) => {
            await signUp(email, password);
            navigate("/dashboard", { replace: true });
          }}
        />
        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered? <Link className="font-medium text-slate-950 underline" to="/login">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
