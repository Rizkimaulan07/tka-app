import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  input: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat("id-ID", options).format(new Date(input))
}

export function formatDateTime(input: string | number | Date) {
  return formatDate(input, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelative(input: string | number | Date) {
  const date = new Date(input)
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)

  if (days <= 0) return "Hari ini"
  if (days === 1) return "Kemarin"
  if (days < 7) return `${days} hari lalu`
  return formatDate(date)
}

export function formatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const pad = (value: number) => String(value).padStart(2, "0")

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.max(1, Math.round(totalSeconds / 60))
  if (minutes < 60) return `${minutes} menit`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours} jam ${rest} menit` : `${hours} jam`
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}

export function todayLabel() {
  return formatDate(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function downloadCSV(
  filename: string,
  rows: Array<Array<string | number>>,
) {
  const escapeCell = (cell: string | number) => {
    const value = String(cell)
    return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
  }

  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n")
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
