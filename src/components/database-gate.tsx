import {
  AlertTriangle,
  Database,
  Loader2,
  RefreshCw,
  Terminal,
} from "lucide-react"
import type { ReactNode } from "react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/use-app"

export function DatabaseGate({ children }: { children: ReactNode }) {
  const { status, error, refresh } = useApp()

  if (status === "ready") return <>{children}</>

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden bg-background p-5 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-0 size-[22rem] rounded-full bg-sky-500/10 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
          {status === "loading" ? (
            <div className="text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Database className="size-7" />
              </span>
              <h1 className="mt-4 text-lg font-extrabold tracking-tight">
                Menghubungkan ke database
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                SiapTKA sedang memuat soal, riwayat ujian, dan rekap nilai dari
                PostgreSQL.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                Memuat data...
              </div>
            </div>
          ) : (
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-500">
                <AlertTriangle className="size-7" />
              </span>
              <h1 className="mt-4 text-center text-lg font-extrabold tracking-tight">
                Database belum tersambung
              </h1>
              <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
                {error ??
                  "Server API tidak dapat dihubungi. Pastikan PostgreSQL dan backend sudah berjalan."}
              </p>

              <div className="mt-5 rounded-xl border border-border/70 bg-muted/40 p-3.5">
                <p className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wide text-muted-foreground uppercase">
                  <Terminal className="size-3.5" />
                  Cara menjalankan
                </p>
                <ol className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-foreground">
                  <li>
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px]">
                      npm run db:start
                    </code>{" "}
                    — nyalakan PostgreSQL lokal
                  </li>
                  <li>
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px]">
                      npm run db:setup
                    </code>{" "}
                    — siapkan tabel & data awal
                  </li>
                  <li>
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px]">
                      npm run dev:all
                    </code>{" "}
                    — jalankan web + API
                  </li>
                </ol>
                <p className="mt-2.5 text-[10px] leading-relaxed text-muted-foreground">
                  Memakai database lain? Atur{" "}
                  <code className="font-mono">DATABASE_URL</code> di file{" "}
                  <code className="font-mono">.env</code>.
                </p>
              </div>

              <Button className="mt-5 w-full" onClick={refresh}>
                <RefreshCw className="size-4" />
                Coba sambungkan lagi
              </Button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          Data disimpan di PostgreSQL · SiapTKA
        </p>
      </div>
    </div>
  )
}
