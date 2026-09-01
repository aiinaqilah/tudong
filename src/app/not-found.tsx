import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-7xl font-serif text-muted-foreground mb-4">404</p>
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        Page not found
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center bg-black text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
