import {
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Flame,
  GraduationCap,
  History,
  LayoutDashboard,
  LibraryBig,
  Menu,
  Moon,
  Sun,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/use-app"
import { EXAMS } from "@/data/exams"
import { cn, todayLabel } from "@/lib/utils"
import type { Role } from "@/types"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: string
}

const studentNav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  {
    to: "/tryout",
    label: "Tryout & Latihan",
    icon: ClipboardList,
    badge: String(EXAMS.length),
  },
  { to: "/hasil", label: "Hasil & Pembahasan", icon: History },
  { to: "/analisis", label: "Analisis Kemampuan", icon: BarChart3 },
]

const teacherNav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/bank-soal", label: "Bank Soal", icon: LibraryBig },
  { to: "/rekap", label: "Rekap Nilai", icon: Users },
]

const notifications = [
  {
    id: 1,
    title: "Tryout TKA 1 sedang dibuka",
    description: "Kerjakan sebelum pukul 21.00 hari ini.",
    icon: ClipboardList,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    title: "Skor simulasimu naik 8 poin",
    description: "Pertahankan ritme belajarmu. Kamu di jalur yang tepat!",
    icon: Flame,
    tone: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
  },
  {
    id: 3,
    title: "Pengingat: Tryout Bahasa Inggris",
    description: "Dibuka besok pukul 08.00. Siapkan dirimu.",
    icon: CalendarDays,
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
]

function SidebarContent({
  onRoleChange,
  showBeta = true,
}: {
  onRoleChange?: () => void
  showBeta?: boolean
}) {
  const { role, setRole, profile } = useApp()
  const navItems = role === "siswa" ? studentNav : teacherNav
  const navigate = useNavigate()

  const handleRoleChange = (nextRole: Role) => {
    if (nextRole === role) return
    setRole(nextRole)
    onRoleChange?.()
    navigate("/")
    toast.success(
      nextRole === "guru"
        ? "Beralih ke mode guru. Bank soal dan rekap nilai terbuka."
        : "Beralih ke mode siswa. Selamat belajar!",
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between px-1">
        <Logo />
        {showBeta && (
          <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
            Beta
          </span>
        )}
      </div>

      <nav className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-muted-foreground/70 uppercase">
            {role === "siswa" ? "Ruang belajar" : "Ruang guru"}
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        "size-[18px]",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground/80 group-hover:text-accent-foreground",
                      )}
                      strokeWidth={2}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="size-3.5 opacity-70" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {role === "siswa" ? (
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-300">
                <Flame className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">5 hari beruntun</p>
                <p className="text-[10px] text-muted-foreground">
                  Jaga momentum belajarmu!
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {["S", "S", "R", "K", "J", "S", "M"].map((day, index) => (
                <span
                  key={`${day}-${index}`}
                  className={cn(
                    "grid size-6 place-items-center rounded-md text-[9px] font-bold",
                    index < 5
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/70 text-muted-foreground",
                  )}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-sky-500/15 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-300">
                <BookOpenCheck className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">2 tryout aktif</p>
                <p className="text-[10px] text-muted-foreground">
                  96 siswa sedang mengerjakan
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/70">
              <div className="h-full w-[68%] rounded-full bg-sky-500" />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              68 dari 100 peserta selesai
            </p>
          </div>
        )}
      </nav>

      <div className="mt-5 rounded-2xl border border-border/80 bg-background/60 p-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-indigo-400 text-xs font-extrabold text-white shadow-sm">
            {profile.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">
              {profile.name}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {profile.roleLabel}
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-muted/70 p-1">
          <button
            type="button"
            onClick={() => handleRoleChange("siswa")}
            className={cn(
              "flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition-colors",
              role === "siswa"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <GraduationCap className="size-3" />
            Siswa
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("guru")}
            className={cn(
              "flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition-colors",
              role === "guru"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Users className="size-3" />
            Guru
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifikasi"
        onClick={() => setOpen((value) => !value)}
        className="relative"
      >
        <Bell className="size-[18px]" />
        {unread && (
          <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-rose-500 ring-2 ring-background" />
        )}
      </Button>
      {open && (
        <div className="animate-pop-in absolute top-12 right-0 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <p className="text-sm font-bold text-foreground">Notifikasi</p>
            <button
              type="button"
              onClick={() => setUnread(false)}
              className="text-[10px] font-semibold text-primary hover:underline"
            >
              Tandai dibaca
            </button>
          </div>
          <div className="divide-y divide-border/60">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                    notification.tone,
                  )}
                >
                  <notification.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/70 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setOpen(false)
                toast.info("Semua notifikasi sudah ditandai dibaca.")
              }}
            >
              Lihat semua notifikasi
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AppShell() {
  const { role, theme, toggleTheme, profile } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navItems = role === "siswa" ? studentNav : teacherNav

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileOpen])

  return (
    <div className="min-h-svh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-border/70 bg-sidebar/95 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 h-dvh lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="animate-fade-in absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="animate-slide-in relative flex h-full w-[286px] max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-sidebar px-4 py-5 shadow-2xl">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 z-10 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <SidebarContent
              showBeta={false}
              onRoleChange={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Buka menu"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="lg:hidden">
              <Logo compact />
            </div>
            <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground lg:flex">
              <CalendarDays className="size-4" />
              {todayLabel()}
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
              <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-semibold text-muted-foreground sm:flex">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Mode demo
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark"
                    ? "Aktifkan mode terang"
                    : "Aktifkan mode gelap"
                }
              >
                {theme === "dark" ? (
                  <Sun className="size-[18px]" />
                ) : (
                  <Moon className="size-[18px]" />
                )}
              </Button>
              <NotificationMenu />
              <div className="ml-0.5 flex items-center gap-2.5 border-l border-border/70 pl-2.5 sm:pl-3">
                <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-indigo-400 text-xs font-extrabold text-white shadow-sm">
                  {profile.initials}
                </span>
                <div className="hidden text-left sm:block">
                  <p className="max-w-32 truncate text-xs font-bold text-foreground">
                    {profile.name}
                  </p>
                  <p className="max-w-32 truncate text-[10px] text-muted-foreground">
                    {profile.roleLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1360px] px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div
          className={cn(
            "mx-auto grid h-16 max-w-md items-stretch px-1",
            role === "siswa" ? "grid-cols-5" : "grid-cols-4",
          )}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 text-[9px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid h-7 w-10 place-items-center rounded-lg transition-colors",
                      isActive && "bg-primary/10",
                    )}
                  >
                    <item.icon className="size-[18px]" />
                  </span>
                  <span>{item.label.split(" ")[0]}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[9px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="grid h-7 w-10 place-items-center rounded-lg">
              <Menu className="size-[18px]" />
            </span>
            <span>Menu</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
