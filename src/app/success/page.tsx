import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold">Thanks!</h1>
        <p className="text-gray-600">Your RSVP has been received. Check your email for a confirmation.</p>
        <Link href="/" className="inline-block text-blue-600 text-sm hover:underline">
          Submit another
        </Link>
      </div>
    </main>
  );
}
