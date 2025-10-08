import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";
export function Button({ asChild, className, variant="default", size="md", ...props }) {
  const Comp = asChild ? Slot : "button";
  const base   = "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50 disabled:pointer-events-none";
  const sizes  = { sm: "h-9 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-11 px-5 text-base" };
  const styles = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border bg-white hover:bg-slate-50",
    ghost:   "hover:bg-slate-100"
  };
  return <Comp className={cn(base, sizes[size], styles[variant], className)} {...props} />;
}
