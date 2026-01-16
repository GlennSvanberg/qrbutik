import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/s/$shopSlug")({
  component: ShopView,
});

function ShopView() {
  const { shopSlug } = Route.useParams();
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopBySlug, { slug: shopSlug }),
  );

  if (!shop) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Butiken hittades inte
          </h1>
          <p className="text-sm text-slate-600">
            Kontrollera länken eller skapa en ny butik.
          </p>
          <Link
            to="/"
            className="mx-auto w-fit rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Till startsidan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {shop.name}
          </h1>
          <p className="text-sm text-slate-600">
            Välj dina varor och fortsätt till Swish.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-500">
              Produkter kommer i nästa fas. Här visas butiken just nu som en
              bekräftelse på att länken fungerar.
            </p>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Ingen varukorg ännu.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
