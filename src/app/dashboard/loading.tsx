import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}
