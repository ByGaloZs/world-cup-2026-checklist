import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../ui/Button";

type ProfileShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  shareUrl?: string;
  loading?: boolean;
  error?: string | null;
};

export function ProfileShareModal({
  isOpen,
  onClose,
  userEmail,
  shareUrl,
  loading = false,
  error = null,
}: ProfileShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) {
    return null;
  }

  async function handleCopyLink() {
    if (!shareUrl) return;

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Your share QR</h2>
            {userEmail ? <p className="mt-1 break-all text-sm text-slate-600">{userEmail}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close profile share modal"
          >
            ×
          </button>
        </div>

        <div className="mt-5">
          {loading ? <p className="text-sm text-slate-600">Generating share link...</p> : null}
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          {shareUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center rounded-2xl bg-slate-50 p-5">
                <QRCodeSVG value={shareUrl} size={220} level="M" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="profile-share-url">
                  Share URL
                </label>
                <input
                  id="profile-share-url"
                  readOnly
                  value={shareUrl}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="button" onClick={handleCopyLink} className="w-full sm:w-auto">
                  Copy link
                </Button>
                {copied ? <span className="text-sm font-medium text-emerald-700">Copied</span> : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
