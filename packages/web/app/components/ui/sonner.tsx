import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast border group-[.toaster]:bg-slate-1 dark:group-[.toaster]:bg-slatedark-1 group-[.toaster]:text-slate-12 dark:group-[.toaster]:text-slatedark-12 group-[.toaster]:border-slate-6 dark:group-[.toaster]:border-slatedark-6 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-slate-12 dark:group-[.toast]:bg-slatedark-12 group-[.toast]:text-slate-1 dark:group-[.toast]:text-slatedark-1",
          cancelButton:
            "group-[.toast]:bg-slate-3 dark:group-[.toast]:bg-slatedark-3 group-[.toast]:text-slate-11 dark:group-[.toast]:text-slatedark-11",
        },
      }}
      {...props}
    />
  );
}

export { toast, Toaster, type ToasterProps };
