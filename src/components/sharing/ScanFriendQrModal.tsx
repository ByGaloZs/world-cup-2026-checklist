import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "../ui/Button";

type ScanFriendQrModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (decodedText: string) => void;
};

const scannerElementId = "friend-qr-scanner";

async function stopScanner(scanner: Html5Qrcode): Promise<void> {
  try {
    if (scanner.isScanning) {
      await scanner.stop();
    }
  } catch {
    // The scanner may already be stopped while the modal is closing.
  }

  try {
    scanner.clear();
  } catch {
    // Ignore cleanup errors so closing the modal never blocks the UI.
  }
}

export function ScanFriendQrModal({ isOpen, onClose, onScanSuccess }: ScanFriendQrModalProps) {
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasScannedRef = useRef(false);
  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let active = true;
    const scanner = new Html5Qrcode(scannerElementId, false);
    hasScannedRef.current = false;
    setScannedValue(null);
    setError(null);

    async function startScanner(): Promise<void> {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (hasScannedRef.current) return;

            hasScannedRef.current = true;
            setScannedValue(decodedText);
            onScanSuccessRef.current?.(decodedText);
            void stopScanner(scanner);
          },
          undefined,
        );

        if (!active) {
          await stopScanner(scanner);
        }
      } catch (caughtError) {
        if (!active) return;

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not start the camera. Check browser camera permissions and try again.",
        );
      }
    }

    void startScanner();

    return () => {
      active = false;
      void stopScanner(scanner);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Scan friend QR</h2>
            <p className="mt-1 text-sm text-slate-600">Point your camera at your friend's QR code.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close QR scanner modal"
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <div id={scannerElementId} className="min-h-[280px] w-full text-white" />
          </div>

          {scannedValue ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-semibold text-emerald-800">Scanned value</p>
              <p className="mt-1 break-all text-sm text-emerald-900">{scannedValue}</p>
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
