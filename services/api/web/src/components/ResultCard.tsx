import { useState } from "react";

interface Props {
  link: {
    code: string;
    url: string;
    shortUrl: string;
  };
}

export default function ResultCard({ link }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-pulse-400 font-mono text-lg truncate">
          {link.shortUrl}
        </p>
        <p className="text-gray-500 text-sm truncate mt-1">{link.url}</p>
      </div>
      <button
        onClick={copyToClipboard}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors shrink-0"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
