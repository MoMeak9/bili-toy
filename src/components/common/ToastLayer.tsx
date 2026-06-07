import * as Toast from "@radix-ui/react-toast";

interface ToastLayerProps {
  open: boolean;
  message: string;
  variant?: "info" | "error";
  onOpenChange: (open: boolean) => void;
}

export function ToastLayer({
  open,
  message,
  variant = "info",
  onOpenChange,
}: ToastLayerProps) {
  return (
    <Toast.Provider duration={4200} swipeDirection="right">
      <Toast.Root
        className={`rounded-2xl px-4 py-3 text-sm text-white shadow-lg ${
          variant === "error" ? "bg-rose-500" : "bg-slate-900"
        }`}
        onOpenChange={onOpenChange}
        open={open}
      >
        <Toast.Description>{message}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 outline-none" />
    </Toast.Provider>
  );
}
