import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";

const ANALYTICS_PATH = "analytics/site-analytics.json";
const LOCAL_ANALYTICS_PATH = path.join(process.cwd(), "data", "site-analytics.json");
const STORE_VERSION = 1;
const RETENTION_DAYS = 90;

export interface PageViewInput {
  path: string;
  referrer: string;
  sessionId: string;
  language: string;
  title: string;
}

interface CountEntry {
  label: string;
  count: number;
}

interface SessionEntry {
  country: string;
  firstPath: string;
  firstSeenAt: string;
}

interface AnalyticsDay {
  views: number;
  uniqueSessions: number;
  countries: Record<string, CountEntry>;
  countryVisitors: Record<string, CountEntry>;
  regions: Record<string, CountEntry>;
  cities: Record<string, CountEntry>;
  pages: Record<string, CountEntry>;
  entryPages: Record<string, CountEntry>;
  referrers: Record<string, CountEntry>;
  devices: Record<string, CountEntry>;
  browsers: Record<string, CountEntry>;
  operatingSystems: Record<string, CountEntry>;
  languages: Record<string, CountEntry>;
  hours: Record<string, number>;
  sessions: Record<string, SessionEntry>;
}

interface AnalyticsStore {
  version: number;
  totalViews: number;
  firstTrackedAt: string | null;
  updatedAt: string | null;
  days: Record<string, AnalyticsDay>;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalVisitors: number;
  todayViews: number;
  todayVisitors: number;
  last7Views: number;
  last7Visitors: number;
  last30Views: number;
  last30Visitors: number;
  updatedAt: string | null;
  storageMode: "blob" | "local";
  daily: Array<{ date: string; views: number; visitors: number }>;
  topCountries: Array<{ key: string; label: string; views: number; visitors: number }>;
  topPages: Array<{ key: string; label: string; views: number; visitors: number }>;
  topReferrers: Array<{ key: string; label: string; views: number }>;
  topCities: Array<{ key: string; label: string; views: number }>;
  devices: Array<{ key: string; label: string; views: number }>;
  browsers: Array<{ key: string; label: string; views: number }>;
  operatingSystems: Array<{ key: string; label: string; views: number }>;
}

interface StoredAnalytics {
  store: AnalyticsStore;
  etag: string | null;
}

export function shouldTrackUserAgent(userAgent: string) {
  if (!userAgent) return true;

  return !/(bot|crawler|spider|crawling|facebookexternalhit|preview|slurp|bingpreview|lighthouse|pagespeed|vercel-screenshot)/i.test(
    userAgent
  );
}

export function shouldTrackPath(pathname: string) {
  return (
    pathname.startsWith("/") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/sign-in") &&
    !pathname.startsWith("/sign-up")
  );
}

export async function recordPageView(input: PageViewInput, headers: Headers) {
  const pathname = normalizePath(input.path);
  if (!shouldTrackPath(pathname)) return { tracked: false };

  const now = new Date();
  const dateKey = toDateKey(now);
  const hourKey = String(now.getUTCHours()).padStart(2, "0");
  const userAgent = headers.get("user-agent") ?? "";
  if (!shouldTrackUserAgent(userAgent)) return { tracked: false };

  const countryCode = cleanHeader(headers.get("x-vercel-ip-country"), "unknown").toUpperCase();
  const countryLabel = countryName(countryCode);
  const region = cleanHeader(headers.get("x-vercel-ip-country-region"), "Unknown region");
  const city = decodeHeaderValue(headers.get("x-vercel-ip-city")) || "Unknown city";
  const referrer = normalizeReferrer(input.referrer, headers);
  const device = detectDevice(userAgent);
  const browser = detectBrowser(userAgent);
  const operatingSystem = detectOperatingSystem(userAgent);
  const language = normalizeLanguage(input.language);
  const sessionKey = sessionHash(input.sessionId, dateKey);

  await updateStore((store) => {
    const day = getDay(store, dateKey);
    const isNewSession = sessionKey && !day.sessions[sessionKey];

    store.totalViews += 1;
    store.firstTrackedAt ??= now.toISOString();
    store.updatedAt = now.toISOString();
    day.views += 1;
    day.hours[hourKey] = (day.hours[hourKey] ?? 0) + 1;

    increment(day.countries, countryCode, countryLabel);
    increment(day.regions, `${countryCode}:${region}`, region);
    increment(day.cities, `${countryCode}:${city}`, city);
    increment(day.pages, pathname, pathname);
    increment(day.referrers, referrer.key, referrer.label);
    increment(day.devices, device, device);
    increment(day.browsers, browser, browser);
    increment(day.operatingSystems, operatingSystem, operatingSystem);
    increment(day.languages, language, language);

    if (isNewSession && sessionKey) {
      day.uniqueSessions += 1;
      day.sessions[sessionKey] = {
        country: countryCode,
        firstPath: pathname,
        firstSeenAt: now.toISOString(),
      };
      increment(day.countryVisitors, countryCode, countryLabel);
      increment(day.entryPages, pathname, pathname);
    }

    pruneOldDays(store, now);
  });

  return { tracked: true };
}

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const { store } = await readStoredAnalytics();
  const now = new Date();
  const dateKeys = getRecentDateKeys(days, now);
  const last7Keys = getRecentDateKeys(7, now);
  const todayKey = toDateKey(now);
  const allDays = Object.values(store.days);

  const selectedDays = dateKeys.map((date) => [date, store.days[date]] as const);
  const last7Days = last7Keys.map((date) => store.days[date]).filter(Boolean);
  const today = store.days[todayKey];

  const countryViews = mergeCounts(selectedDays.map(([, day]) => day?.countries));
  const countryVisitors = mergeCounts(selectedDays.map(([, day]) => day?.countryVisitors));
  const pageViews = mergeCounts(selectedDays.map(([, day]) => day?.pages));
  const pageVisitors = mergeCounts(selectedDays.map(([, day]) => day?.entryPages));

  return {
    totalViews: store.totalViews,
    totalVisitors: allDays.reduce((total, day) => total + day.uniqueSessions, 0),
    todayViews: today?.views ?? 0,
    todayVisitors: today?.uniqueSessions ?? 0,
    last7Views: last7Days.reduce((total, day) => total + day.views, 0),
    last7Visitors: last7Days.reduce((total, day) => total + day.uniqueSessions, 0),
    last30Views: selectedDays.reduce((total, [, day]) => total + (day?.views ?? 0), 0),
    last30Visitors: selectedDays.reduce((total, [, day]) => total + (day?.uniqueSessions ?? 0), 0),
    updatedAt: store.updatedAt,
    storageMode: shouldUseBlobStorage() ? "blob" : "local",
    daily: selectedDays.map(([date, day]) => ({
      date,
      views: day?.views ?? 0,
      visitors: day?.uniqueSessions ?? 0,
    })),
    topCountries: topCount(countryViews, 8).map((item) => ({
      ...item,
      views: item.count,
      visitors: countryVisitors[item.key]?.count ?? 0,
    })),
    topPages: topCount(pageViews, 8).map((item) => ({
      ...item,
      views: item.count,
      visitors: pageVisitors[item.key]?.count ?? 0,
    })),
    topReferrers: topCount(mergeCounts(selectedDays.map(([, day]) => day?.referrers)), 8).map(
      (item) => ({ ...item, views: item.count })
    ),
    topCities: topCount(mergeCounts(selectedDays.map(([, day]) => day?.cities)), 8).map((item) => ({
      ...item,
      views: item.count,
    })),
    devices: topCount(mergeCounts(selectedDays.map(([, day]) => day?.devices)), 5).map((item) => ({
      ...item,
      views: item.count,
    })),
    browsers: topCount(mergeCounts(selectedDays.map(([, day]) => day?.browsers)), 5).map((item) => ({
      ...item,
      views: item.count,
    })),
    operatingSystems: topCount(
      mergeCounts(selectedDays.map(([, day]) => day?.operatingSystems)),
      5
    ).map((item) => ({ ...item, views: item.count })),
  };
}

async function updateStore(mutator: (store: AnalyticsStore) => void | Promise<void>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const stored = await readStoredAnalytics();
    await mutator(stored.store);

    try {
      await saveAnalyticsStore(stored.store, stored.etag);
      return;
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError && attempt < 2) {
        continue;
      }
      throw error;
    }
  }
}

async function readStoredAnalytics(): Promise<StoredAnalytics> {
  const blobStore = await readBlobAnalytics();
  if (blobStore) return blobStore;

  const localStore = await readLocalAnalytics();
  return { store: localStore ?? createEmptyStore(), etag: null };
}

async function readBlobAnalytics(): Promise<StoredAnalytics | null> {
  if (!shouldUseBlobStorage()) return null;

  try {
    const result = await get(ANALYTICS_PATH, { access: "private" });
    if (!result || result.statusCode !== 200) return null;

    const text = await streamToText(result.stream);
    return {
      store: parseStore(text),
      etag: result.blob.etag,
    };
  } catch {
    return null;
  }
}

async function readLocalAnalytics() {
  try {
    const text = await readFile(LOCAL_ANALYTICS_PATH, "utf8");
    return parseStore(text);
  } catch {
    return null;
  }
}

async function saveAnalyticsStore(store: AnalyticsStore, etag: string | null) {
  const body = JSON.stringify(store, null, 2);

  if (shouldUseBlobStorage()) {
    await put(ANALYTICS_PATH, body, {
      access: "private",
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: "application/json",
      ...(etag ? { ifMatch: etag } : {}),
    });
    return;
  }

  await mkdir(path.dirname(LOCAL_ANALYTICS_PATH), { recursive: true });
  await writeFile(LOCAL_ANALYTICS_PATH, body, "utf8");
}

function createEmptyStore(): AnalyticsStore {
  return {
    version: STORE_VERSION,
    totalViews: 0,
    firstTrackedAt: null,
    updatedAt: null,
    days: {},
  };
}

function parseStore(text: string): AnalyticsStore {
  const parsed = JSON.parse(text) as Partial<AnalyticsStore>;
  const store = createEmptyStore();

  store.version = STORE_VERSION;
  store.totalViews = typeof parsed.totalViews === "number" ? parsed.totalViews : 0;
  store.firstTrackedAt = parsed.firstTrackedAt ?? null;
  store.updatedAt = parsed.updatedAt ?? null;

  if (parsed.days && typeof parsed.days === "object") {
    for (const [date, day] of Object.entries(parsed.days)) {
      store.days[date] = normalizeDay(day as Partial<AnalyticsDay>);
    }
  }

  return store;
}

function normalizeDay(day: Partial<AnalyticsDay>): AnalyticsDay {
  return {
    views: day.views ?? 0,
    uniqueSessions: day.uniqueSessions ?? 0,
    countries: day.countries ?? {},
    countryVisitors: day.countryVisitors ?? {},
    regions: day.regions ?? {},
    cities: day.cities ?? {},
    pages: day.pages ?? {},
    entryPages: day.entryPages ?? {},
    referrers: day.referrers ?? {},
    devices: day.devices ?? {},
    browsers: day.browsers ?? {},
    operatingSystems: day.operatingSystems ?? {},
    languages: day.languages ?? {},
    hours: day.hours ?? {},
    sessions: day.sessions ?? {},
  };
}

function getDay(store: AnalyticsStore, dateKey: string) {
  store.days[dateKey] ??= normalizeDay({});
  return store.days[dateKey];
}

function increment(map: Record<string, CountEntry>, key: string, label: string) {
  map[key] ??= { label, count: 0 };
  map[key].count += 1;
}

function mergeCounts(maps: Array<Record<string, CountEntry> | undefined>) {
  const merged: Record<string, CountEntry> = {};

  for (const map of maps) {
    if (!map) continue;
    for (const [key, entry] of Object.entries(map)) {
      merged[key] ??= { label: entry.label, count: 0 };
      merged[key].count += entry.count;
    }
  }

  return merged;
}

function topCount(map: Record<string, CountEntry>, limit: number) {
  return Object.entries(map)
    .map(([key, entry]) => ({ key, label: entry.label, count: entry.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function getRecentDateKeys(days: number, now: Date) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - (days - index - 1));
    return toDateKey(date);
  });
}

function pruneOldDays(store: AnalyticsStore, now: Date) {
  const keep = new Set(getRecentDateKeys(RETENTION_DAYS, now));
  for (const date of Object.keys(store.days)) {
    if (!keep.has(date)) {
      delete store.days[date];
    }
  }
}

function normalizePath(pathname: string) {
  if (!pathname.startsWith("/")) return "/";
  const [pathOnly] = pathname.split("?");
  return pathOnly.slice(0, 180);
}

function normalizeReferrer(referrer: string, headers: Headers) {
  if (!referrer) return { key: "direct", label: "Direct" };

  try {
    const referrerUrl = new URL(referrer);
    const host = headers.get("host") ?? "";
    if (referrerUrl.host === host) return { key: "internal", label: "Internal" };
    return { key: referrerUrl.host.toLowerCase(), label: referrerUrl.host.toLowerCase() };
  } catch {
    return { key: "unknown", label: "Unknown" };
  }
}

function normalizeLanguage(language: string) {
  return language.split(",")[0]?.trim().slice(0, 24) || "Unknown";
}

function sessionHash(sessionId: string, dateKey: string) {
  if (!sessionId || sessionId.length < 12) return null;
  return createHash("sha256").update(`${dateKey}:${sessionId}`).digest("hex").slice(0, 32);
}

function cleanHeader(value: string | null, fallback: string) {
  return value?.trim().slice(0, 80) || fallback;
}

function decodeHeaderValue(value: string | null) {
  if (!value) return "";

  try {
    return decodeURIComponent(value).slice(0, 80);
  } catch {
    return value.slice(0, 80);
  }
}

function countryName(countryCode: string) {
  if (countryCode === "UNKNOWN") return "Unknown country";

  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

function detectDevice(userAgent: string) {
  if (/ipad|tablet/i.test(userAgent)) return "Tablet";
  if (/mobile|android|iphone|ipod/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function detectBrowser(userAgent: string) {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/chrome|crios/i.test(userAgent)) return "Chrome";
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  return "Other";
}

function detectOperatingSystem(userAgent: string) {
  if (/windows/i.test(userAgent)) return "Windows";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/mac os|macintosh/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Other";
}

function shouldUseBlobStorage() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  if (process.env.NODE_ENV === "development") return false;
  return Boolean(process.env.BLOB_STORE_ID);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function streamToText(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result + decoder.decode();
}
