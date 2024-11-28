import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}