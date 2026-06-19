import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex size-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <ShoppingBag className="size-5" strokeWidth={2.4} />
              <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-blue-600" />
            </span>

            <h1 className="text-2xl font-bold tracking-tight">
              Shop<span className="text-primary">Hub</span>
            </h1>
          </Link>

          <div className="hidden md:flex gap-6 text-sm text-muted-foreground">
            <Link href="/help">Help Center</Link>
            <Link href="/rules">Marketplace Rules</Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        {children}
      </main>

      {/* Footer */}
      {/* <footer className="border-t bg-card">
        <div className="container mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2026 ShopHub. All rights reserved.
          </p>
        </div>
      </footer> */}
    </div>
  );
}
