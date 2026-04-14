import { useState } from "react";
import ShortenForm from "./components/ShortenForm";
import ResultCard from "./components/ResultCard";
import RecentLinks from "./components/RecentLinks";
import StatsView from "./components/StatsView";

interface ShortenedLink {
  id: string;
  code: string;
  url: string;
  shortUrl: string;
  createdAt: string;
}

export default function App() {
  const [result, setResult] = useState<ShortenedLink | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleShortened(link: ShortenedLink) {
    setResult(link);
    setRefreshKey((k) => k + 1);
  }

  if (selectedCode) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button
            onClick={() => setSelectedCode(null)}
            className="text-pulse-400 hover:text-pulse-300 mb-6 flex items-center gap-1 transition-colors"
          >
            <span>←</span> Back
          </button>
          <StatsView code={selectedCode} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pulse-400 to-pulse-600 bg-clip-text text-transparent">
            ⚡ Link Pulse
          </h1>
          <p className="text-gray-400 mt-2">
            Shorten links. Track clicks. Dead simple.
          </p>
        </header>

        <ShortenForm onShortened={handleShortened} />

        {result && (
          <div className="mt-6">
            <ResultCard link={result} />
          </div>
        )}

        <div className="mt-12">
          <RecentLinks
            refreshKey={refreshKey}
            onSelect={(code) => setSelectedCode(code)}
          />
        </div>
      </div>
    </div>
  );
}
