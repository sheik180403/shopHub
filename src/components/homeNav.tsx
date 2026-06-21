import Link from "next/link";
import { cookies } from "next/headers";
import {
  Bell,
  ChevronDown,
  Gamepad2,
  Heart,
  HomeIcon,
  Laptop,
  Menu,
  PackageCheck,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Tags,
  Tv,
  UserRound,
  Utensils,
  Zap,
} from "lucide-react";

const categories = [
  { name: "Mobiles", icon: Smartphone, color: "bg-sky-100 text-sky-700" },
  { name: "Fashion", icon: Shirt, color: "bg-rose-100 text-rose-700" },
  { name: "Electronics", icon: Laptop, color: "bg-indigo-100 text-indigo-700" },
  { name: "Home", icon: HomeIcon, color: "bg-emerald-100 text-emerald-700" },
  { name: "Appliances", icon: Tv, color: "bg-orange-100 text-orange-700" },
  { name: "Beauty", icon: Sparkles, color: "bg-fuchsia-100 text-fuchsia-700" },
  { name: "Toys", icon: Gamepad2, color: "bg-amber-100 text-amber-700" },
  { name: "Grocery", icon: Utensils, color: "bg-lime-100 text-lime-700" },
];

const deals = [
  {
    title: "NoiseFit Active",
    price: "From Rs. 1,299",
    tag: "Smart wearables",
    icon: Zap,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Premium Sneakers",
    price: "Min. 60% off",
    tag: "Fashion deals",
    icon: Shirt,
    color: "bg-rose-50 text-rose-700",
  },
  {
    title: "Kitchen Essentials",
    price: "Under Rs. 999",
    tag: "Home picks",
    icon: PackageCheck,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Gaming Gear",
    price: "Up to 70% off",
    tag: "Accessories",
    icon: Gamepad2,
    color: "bg-violet-50 text-violet-700",
  },
];

export default async function HomeNav() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get("Secure-userID")?.value);

  return (
    <main className="min-h-screen bg-[#f1f3f6] text-gray-900">
      <header className="sticky top-0 z-20 bg-[#2874f0] text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex size-10 items-center justify-center rounded-md hover:bg-white/10 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="flex min-w-fit items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white text-[#2874f0]">
              <ShoppingBag className="size-5" strokeWidth={2.5} />
            </span>
            <span className="leading-none">
              <span className="block text-xl font-bold tracking-tight">
                ShopHub
              </span>
              <span className="text-xs italic text-yellow-300">
                Explore Plus
              </span>
            </span>
          </Link>

          <form className="hidden h-10 flex-1 items-center rounded-sm bg-white text-gray-700 shadow-sm md:flex">
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search for products, brands and more"
              className="h-full flex-1 rounded-sm px-4 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-full w-12 items-center justify-center text-[#2874f0]"
            >
              <Search className="size-5" />
            </button>
          </form>

          <nav className="ml-auto hidden items-center gap-2 text-sm font-semibold lg:flex">
            {isLoggedIn ? (
              <Link
                href="/account"
                className="flex h-9 items-center gap-2 rounded-sm bg-white px-5 text-[#2874f0]"
              >
                <UserRound className="size-4" />
                Account
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex h-9 items-center gap-2 rounded-sm bg-white px-5 text-[#2874f0]"
                >
                  <UserRound className="size-4" />
                  Login
                </Link>
              </>
            )}
            <button
              type="button"
              className="flex h-9 items-center gap-1 rounded-sm px-3 hover:bg-white/10"
            >
              More
              <ChevronDown className="size-4" />
            </button>
            <Link
              href="/cart"
              className="flex h-9 items-center gap-2 rounded-sm px-3 hover:bg-white/10"
            >
              <ShoppingCart className="size-4" />
              Cart
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:hidden">
            {isLoggedIn ? (
              <Link
                href="/account"
                aria-label="Account"
                className="inline-flex size-10 items-center justify-center rounded-md hover:bg-white/10"
              >
                <UserRound className="size-5" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                aria-label="Login"
                className="inline-flex size-10 items-center justify-center rounded-md hover:bg-white/10"
              >
                <UserRound className="size-5" />
              </Link>
            )}
            <Link
              href="/cart"
              aria-label="Cart"
              className="inline-flex size-10 items-center justify-center rounded-md hover:bg-white/10"
            >
              <ShoppingCart className="size-5" />
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 pb-3 md:hidden">
          <form className="mx-auto flex h-10 max-w-7xl items-center rounded-sm bg-white text-gray-700 shadow-sm">
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search for products, brands and more"
              className="h-full flex-1 rounded-sm px-4 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-full w-12 items-center justify-center text-[#2874f0]"
            >
              <Search className="size-5" />
            </button>
          </form>
        </div>
      </header>

      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-4 gap-3 px-4 py-4 sm:grid-cols-5 md:grid-cols-8">
          {categories.map(({ name, icon: Icon, color }) => (
            <button
              key={name}
              type="button"
              className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-md text-center text-xs font-semibold text-gray-800 hover:text-[#2874f0]"
            >
              <span
                className={`flex size-11 items-center justify-center rounded-full ${color}`}
              >
                <Icon className="size-5" />
              </span>
              {name}
            </button>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="relative overflow-hidden rounded-md bg-[#ffe500] px-6 py-8 sm:px-10">
            <div className="relative z-10 max-w-xl">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#2874f0]">
                Big Saving Days
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
                Deals that feel almost unfair
              </h1>
              <p className="mt-3 max-w-lg text-sm font-medium text-gray-700 sm:text-base">
                Mobiles, fashion, appliances and daily essentials packed into
                one fast shopping experience.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/auth/login"
                  className="inline-flex h-11 items-center justify-center rounded-sm bg-[#2874f0] px-5 text-sm font-bold text-white"
                >
                  Start Shopping
                </Link>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-sm border border-gray-900/15 bg-white px-5 text-sm font-bold text-gray-900"
                >
                  View Offers
                </button>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-72 items-end justify-center sm:flex">
              <div className="grid grid-cols-2 gap-3 pb-8">
                <span className="flex size-24 rotate-[-8deg] items-center justify-center rounded-md bg-white/90 text-[#2874f0] shadow-md">
                  <Smartphone className="size-10" />
                </span>
                <span className="mt-8 flex size-24 rotate-[8deg] items-center justify-center rounded-md bg-white/90 text-rose-600 shadow-md">
                  <Heart className="size-10" />
                </span>
                <span className="flex size-24 rotate-[6deg] items-center justify-center rounded-md bg-white/90 text-emerald-600 shadow-md">
                  <Store className="size-10" />
                </span>
                <span className="mt-8 flex size-24 rotate-[-6deg] items-center justify-center rounded-md bg-white/90 text-amber-600 shadow-md">
                  <Tags className="size-10" />
                </span>
              </div>
            </div>
          </div>

          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-md bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <PackageCheck className="size-5" />
                </span>
                <div>
                  <h2 className="font-bold">Free delivery</h2>
                  <p className="text-sm text-gray-500">On selected orders</p>
                </div>
              </div>
            </div>
            <div className="rounded-md bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <Bell className="size-5" />
                </span>
                <div>
                  <h2 className="font-bold">Flash alerts</h2>
                  <p className="text-sm text-gray-500">
                    Fresh offers every day
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-md bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Best Deals Today</h2>
              <p className="text-sm text-gray-500">
                Handpicked for fast checkout
              </p>
            </div>
            <button
              type="button"
              className="h-9 rounded-sm bg-[#2874f0] px-4 text-sm font-bold text-white"
            >
              View All
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map(({ title, price, tag, icon: Icon, color }) => (
              <article
                key={title}
                className="rounded-md border border-gray-100 p-4 transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-4 flex aspect-[4/3] items-center justify-center rounded-md ${color}`}
                >
                  <Icon className="size-14" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {price}
                </p>
                <p className="mt-1 text-xs text-gray-500">{tag}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
