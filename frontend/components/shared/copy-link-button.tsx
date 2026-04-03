"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  const [label, setLabel] = useState("Copy link");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setLabel("Copied!");
      setTimeout(() => setLabel("Copy link"), 2000);
    } catch {
      setLabel("Copy link");
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      id="copy-share-link-btn"
      onClick={handleCopy}
    >
      {label}
    </Button>
  );
}
