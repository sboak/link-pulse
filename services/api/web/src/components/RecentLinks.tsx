import { useEffect, useState } from "react";

interface LinkItem {
  id: string;
  code: string;
  url: string;
  totalClicks: number;
  createdAt: string;
}

interface Props {
  refreshKey: number;
  onSelect: (code: string) => void;
}

export default function RecentLinks({ refreshKey, onSelect }: Props) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/links?limit=20")
      .then((res) => res.json())
      .then((data) => setLinks(data.links || []))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">Loading links…</div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        No links yet. Shorten one above to get started.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-4">
        Recent Links
      </h2>
      <div className="space-y-2">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onSelect(link.code)}
            className="w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg p-3 transition-colors group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-pulse-400 font-mono text-sm truncate group-hover:text-pulse-300">
                  /{link.code}
                </p>
                <p className="text-gray-500 text-xs truncate mt-0.5">
                  {link.url}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-gray-300 font-medium">
                  {link.totalClicks}
                </p>
                <p className="text-gray-600 text-xs">clicks</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
