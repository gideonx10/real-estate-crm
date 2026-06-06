import { formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NA";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatPrice(value) {
  const amount = Number(value || 0);
  if (!amount) return "Not set";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 ? 1 : 0)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 ? 1 : 0)}L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return "Not set";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  if (isToday(parsed)) return "Today";
  if (isYesterday(parsed)) return "Yesterday";
  return `${formatDistanceToNowStrict(parsed)} ago`;
}

export function makeId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function projectMetrics(project, units = []) {
  const projectUnits = units.filter((unit) => unit.project_id === project.id);
  const total = project.total_units || projectUnits.length || 0;
  const available = projectUnits.filter((unit) => unit.status === "Available").length;
  const sold = projectUnits.filter((unit) => unit.status === "Sold").length;
  const reserved = projectUnits.filter((unit) => unit.status === "Reserved").length;
  const percentSold = total ? Math.round((sold / total) * 100) : 0;

  return {
    total,
    available,
    sold,
    reserved,
    percentSold,
  };
}

export const statusTone = {
  Active: "bg-success/10 text-success border-success/20",
  Upcoming: "bg-info/10 text-info border-info/20",
  Completed: "bg-zinc-100 text-zinc-700 border-zinc-200",
  Available: "bg-success/10 text-success border-success/20",
  Sold: "bg-info/10 text-info border-info/20",
  Reserved: "bg-warning/10 text-warning border-warning/20",
  New: "bg-info/10 text-info border-info/20",
  Contacted: "bg-gold/10 text-gold border-gold/20",
  "Site Visit": "bg-warning/10 text-warning border-warning/20",
  Converted: "bg-success/10 text-success border-success/20",
  Lost: "bg-red-50 text-red-600 border-red-100",
};

export const statusBorder = {
  New: "border-l-info",
  Contacted: "border-l-gold",
  "Site Visit": "border-l-warning",
  Converted: "border-l-success",
  Lost: "border-l-red-500",
};

export const statusButtonTone = {
  New: {
    active: "border-blue-500 bg-blue-500 text-white",
    idle: "border-blue-100 bg-blue-50 text-blue-600",
    avatar: "bg-blue-50 text-blue-600",
  },
  Contacted: {
    active: "border-amber-500 bg-amber-500 text-white",
    idle: "border-amber-100 bg-amber-50 text-amber-600",
    avatar: "bg-amber-50 text-amber-600",
  },
  "Site Visit": {
    active: "border-violet-500 bg-violet-500 text-white",
    idle: "border-violet-100 bg-violet-50 text-violet-600",
    avatar: "bg-violet-50 text-violet-600",
  },
  Converted: {
    active: "border-success bg-success text-white",
    idle: "border-green-100 bg-green-50 text-success",
    avatar: "bg-green-50 text-success",
  },
  Lost: {
    active: "border-red-500 bg-red-500 text-white",
    idle: "border-red-100 bg-red-50 text-red-600",
    avatar: "bg-red-50 text-red-600",
  },
};

export const sourceTone = {
  "Walk-in": "bg-navy/10 text-navy",
  Broker: "bg-gold/10 text-gold",
  Online: "bg-info/10 text-info",
  Referral: "bg-success/10 text-success",
  Other: "bg-zinc-100 text-zinc-600",
};
