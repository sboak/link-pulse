import { useState, FormEvent } from "react";

interface Props {
  onShortened: (link: {
    id: string;
    code: string;
    url: string;
    shortUrl: string;
    createdAt: string;
  }) => void;
}

export default function ShortenForm({ onShortened }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      onShortened(data);
      setUrl("");
    } catch {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a long URL here…"
          required
          className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent transition-shadow"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-pulse-600 hover:bg-pulse-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          {loading ? "Shortening…" : "Shorten"}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  );
}
