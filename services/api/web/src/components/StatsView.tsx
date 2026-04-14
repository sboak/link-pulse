import { useEffect, useState } from "react";

interface Stats {
  code: string;
  url: string;
  createdAt: string;
  totalClicks: number;
  clicksByDay: { date: string; count: number }[];
}

interface Props {
  code: string;
}

export default function StatsView({ code }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stats/${code}`)
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-12">Loading stats…</div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-red-400 py-12">
        Failed to load stats
      </div>
    );
  }

  const maxCount = Math.max(...stats.clicksByDay.map((d) => d.count), 1);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-1">
        <span className="text-pulse-400 font-mono">/{stats.code}</span>
      </h2>
      <p className="text-gray-500 text-sm truncate mb-8">{stats.url}</p>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <p className="text-gray-400 text-sm uppercase tracking-wide">
          Total Clicks
        </p>
        <p className="text-4xl font-bold text-gray-100 mt-1">
          {stats.totalClicks.toLocaleString()}
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <p className="text-gray-400 text-sm uppercase tracking-wide mb-4">
          Last 7 Days
        </p>
        <div className="flex items-end gap-2 h-40">
          {stats.clicksByDay.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center flex-1 justify-end">
                <span className="text-xs text-gray-400 mb-1">
                  {day.count > 0 ? day.count : ""}
                </span>
                <div
                  className="w-full bg-pulse-600 rounded-t transition-all"
                  style={{
                    height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 4 : 1)}%`,
                    minHeight: day.count > 0 ? "4px" : "1px",
                    opacity: day.count > 0 ? 1 : 0.2,
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 mt-2">
                {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-gray-600 text-xs mt-4">
        Created{" "}
        {new Date(stats.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
