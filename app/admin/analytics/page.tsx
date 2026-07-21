import {
  BarChart3,
  Clock,
  Eye,
  Globe2,
  Laptop,
  MapPin,
  MousePointerClick,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsSummary } from "@/lib/site-analytics";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const summary = await getAnalyticsSummary(30);
  const maxDailyViews = Math.max(...summary.daily.map((day) => day.views), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500">
            Country, page, device, and referrer trends from first-party tracking.
          </p>
        </div>
        <div className="rounded-md border bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
          <span className="font-medium text-slate-950">
            {summary.storageMode === "blob" ? "Vercel Blob" : "Local JSON"}
          </span>
          <span className="mx-2 text-slate-300">/</span>
          {summary.updatedAt ? formatDateTime(summary.updatedAt) : "No visits yet"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Today"
          value={formatNumber(summary.todayViews)}
          detail={`${formatNumber(summary.todayVisitors)} visitors`}
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard
          title="Last 7 Days"
          value={formatNumber(summary.last7Views)}
          detail={`${formatNumber(summary.last7Visitors)} visitors`}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <MetricCard
          title="Last 30 Days"
          value={formatNumber(summary.last30Views)}
          detail={`${formatNumber(summary.last30Visitors)} visitors`}
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          title="All Time"
          value={formatNumber(summary.totalViews)}
          detail={`${formatNumber(summary.totalVisitors)} visitors`}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Traffic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-72 items-end gap-2 border-b border-slate-200 px-1">
            {summary.daily.map((day) => (
              <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-7 rounded-t bg-slate-950"
                  style={{ height: `${Math.max((day.views / maxDailyViews) * 220, day.views ? 8 : 0)}px` }}
                  title={`${day.date}: ${day.views} views`}
                />
                <span className="hidden text-[10px] text-slate-400 sm:block">
                  {formatShortDate(day.date)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <RankingCard
          title="Top Countries"
          icon={<Globe2 className="h-5 w-5" />}
          rows={summary.topCountries}
          columns={[
            { key: "label", label: "Country" },
            { key: "visitors", label: "Visitors", align: "right" },
            { key: "views", label: "Views", align: "right" },
          ]}
        />
        <RankingCard
          title="Top Pages"
          icon={<MousePointerClick className="h-5 w-5" />}
          rows={summary.topPages}
          columns={[
            { key: "label", label: "Page" },
            { key: "visitors", label: "Entrances", align: "right" },
            { key: "views", label: "Views", align: "right" },
          ]}
        />
        <RankingCard
          title="Traffic Sources"
          icon={<BarChart3 className="h-5 w-5" />}
          rows={summary.topReferrers}
          columns={[
            { key: "label", label: "Source" },
            { key: "views", label: "Views", align: "right" },
          ]}
        />
        <RankingCard
          title="Top Cities"
          icon={<MapPin className="h-5 w-5" />}
          rows={summary.topCities}
          columns={[
            { key: "label", label: "City" },
            { key: "views", label: "Views", align: "right" },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <RankingCard
          title="Devices"
          icon={<Laptop className="h-5 w-5" />}
          rows={summary.devices}
          columns={[
            { key: "label", label: "Device" },
            { key: "views", label: "Views", align: "right" },
          ]}
        />
        <RankingCard
          title="Browsers"
          icon={<Laptop className="h-5 w-5" />}
          rows={summary.browsers}
          columns={[
            { key: "label", label: "Browser" },
            { key: "views", label: "Views", align: "right" },
          ]}
        />
        <RankingCard
          title="Operating Systems"
          icon={<Laptop className="h-5 w-5" />}
          rows={summary.operatingSystems}
          columns={[
            { key: "label", label: "System" },
            { key: "views", label: "Views", align: "right" },
          ]}
        />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          {icon}
        </div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

function RankingCard({
  title,
  icon,
  rows,
  columns,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Array<Record<string, string | number>>;
  columns: Array<{ key: string; label: string; align?: "right" }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-slate-500">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-3 py-2 font-medium ${column.align === "right" ? "text-right" : "text-left"}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row) => (
                  <tr key={String(row.key)}>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-3 py-3 ${column.align === "right" ? "text-right font-medium" : "max-w-0 truncate"}`}
                      >
                        {typeof row[column.key] === "number"
                          ? formatNumber(row[column.key] as number)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
            No tracking data yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}
