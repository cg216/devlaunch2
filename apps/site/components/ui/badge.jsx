import { cn } from "@/lib/cn";
export function Badge({ className, variant="default", ...props }) {
  const styles = {
    default: "bg-slate-900 text-white",
    green:   "bg-emerald-600 text-white",
    amber:   "bg-amber-500 text-white",
    gray:    "bg-slate-200 text-slate-700"
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[variant], className)} {...props} />;
}
