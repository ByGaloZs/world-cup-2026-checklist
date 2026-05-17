import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../features/auth/useAuth";
import { useShareCode } from "../../features/sharing/useShareCode";
import { ProfileShareModal } from "../profile/ProfileShareModal";
import { Button } from "../ui/Button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { shareUrl, loading: shareCodeLoading, error: shareCodeError } = useShareCode(user?.id);

  async function handleSignOut() {
    setError(null);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to log out.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Panini</p>
            <h1 className="text-xl font-bold text-slate-950">World Cup 2026 Checklist</h1>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {user?.email ? (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="break-all text-left text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-950 hover:underline sm:text-right"
              >
                {user.email}
              </button>
            ) : null}
            <Button variant="secondary" onClick={handleSignOut}>Log out</Button>
          </div>
        </div>
      </header>
      <ProfileShareModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={user?.email}
        shareUrl={shareUrl ?? undefined}
        loading={shareCodeLoading}
        error={shareCodeError}
      />
      {error ? <div className="mx-auto max-w-6xl px-4 pt-4 text-sm text-red-700">{error}</div> : null}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
