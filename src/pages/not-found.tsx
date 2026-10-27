import { Compass, Home, LayoutDashboard } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60svh] place-items-center py-10">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary">
          <Compass className="size-7" />
        </span>
        <p className="mt-5 text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tautan yang kamu buka mungkin sudah dipindahkan atau tidak pernah ada.
          Kembali ke dashboard untuk melanjutkan belajar.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link to="/">
              <Home className="size-4" />
              Ke dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/tryout">
              <LayoutDashboard className="size-4" />
              Lihat daftar tes
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
