import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-grow min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-lg mb-6">This page doesn&apos;t exist or has been moved.</p>
      <Link
        href="/"
        className="text-blue-500 text-lg hover:underline"
      >
        Return to home
      </Link>
    </div>
  );
}
