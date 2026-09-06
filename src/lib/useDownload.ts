import { useState } from "react";

// Fetched rather than linked so a missing binding (plain `vite dev`) surfaces a
// readable message instead of navigating the user to a 404.
export function useDownload() {
  const [error, setError] = useState<string | null>(null);

  const download = async (id: string, filename: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/download?id=${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error(`Download failed (${response.status}). Run \`wrangler pages dev\` for the R2 binding.`);

      const url = URL.createObjectURL(await response.blob());
      const link = Object.assign(document.createElement("a"), { href: url, download: `${filename}.png` });
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Download failed.");
    }
  };

  return { download, error };
}
