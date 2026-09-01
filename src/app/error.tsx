"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center bg-black text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
