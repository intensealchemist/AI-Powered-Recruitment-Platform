"use client";

import { useState } from "react";
import { Download, LoaderCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PdfDownloadButton({ profileId }: { profileId: string }) {
  const [error, setError]     = useState(false);
  const [pending, setPending] = useState(false);

  const handleDownload = async () => {
    setPending(true);
    setError(false);

    try {
      const response = await fetch(`/api/pdf/${profileId}`);
      if (!response.ok) throw new Error("PDF generation failed.");

      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "candidate-profile.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        onClick={handleDownload}
        type="button"
        variant="secondary"
        size="sm"
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle className="size-3.5 animate-spin" />
        ) : error ? (
          <RotateCcw className="size-3.5 text-rose-400" />
        ) : (
          <Download className="size-3.5" />
        )}
        {error ? "Retry PDF" : "Download PDF"}
      </Button>
      {error && (
        <p className="text-[11px] text-rose-400">
          PDF generation failed — retry to regenerate.
        </p>
      )}
    </div>
  );
}
