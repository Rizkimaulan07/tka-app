import { X } from "lucide-react"
import {
  createContext,
  useContext,
  useEffect,
  type ComponentProps,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DialogContextValue {
  onClose: () => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Dialog({ open, onClose, children }: DialogProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <DialogContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
        <button
          type="button"
          aria-label="Tutup dialog"
          className="animate-fade-in absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-[2px]"
          onClick={onClose}
        />
        <div className="relative z-10 flex w-full justify-center sm:max-w-2xl">
          {children}
        </div>
      </div>
    </DialogContext.Provider>,
    document.body,
  )
}

export function DialogContent({
  className,
  children,
  hideClose = false,
  ...props
}: ComponentProps<"div"> & { hideClose?: boolean }) {
  const context = useContext(DialogContext)

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "animate-pop-in relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-border/70 bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6",
        className,
      )}
      {...props}
    >
      {!hideClose && (
        <button
          type="button"
          onClick={context?.onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 z-10 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
      {children}
    </div>
  )
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mb-5 flex flex-col gap-1.5 pr-8", className)}
      {...props}
    />
  )
}

export function DialogTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-lg font-bold tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  )
}
