import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto min-h-[50vh] flex items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}
