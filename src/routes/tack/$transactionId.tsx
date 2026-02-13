import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/tack/$transactionId")({
  head: () => ({
    meta: [
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  headers: () => ({
    "X-Robots-Tag": "noindex, nofollow",
  }),
  component: ThankYouView,
});

function ThankYouView() {
  const { transactionId } = Route.useParams();
  const { data: transaction } = useSuspenseQuery(
    convexQuery(api.transactions.get, {
      transactionId: transactionId as unknown as Id<"transactions">,
    }),
  );

  if (!transaction) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-2xl flex-col gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Betalningen hittades inte
          </h1>
          <p className="text-sm text-slate-600">
            Vi kunde inte hitta information om den här betalningen.
          </p>
          <Link
            to="/"
            className="relaxed-primary-button mx-auto w-fit px-5 py-3 text-sm font-semibold text-white"
            trackaton-on-click="thankyou-back-home"
          >
            Till startsidan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent px-4 py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relaxed-surface-soft flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Tack för ditt köp!
            </h1>
            <p className="text-lg font-medium text-slate-600">
              Visa denna skärm för personalen i {transaction.shopName}
            </p>
          </div>
        </div>

        <section className="relaxed-surface flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-4">
            <div className="relaxed-surface-soft flex flex-col items-center justify-center gap-1 bg-stone-50/80 py-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Referensnummer
              </p>
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {transaction.reference}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Din beställning
              </h3>
              <div className="divide-y divide-slate-100">
                {transaction.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-3">
                    <div className="flex gap-3">
                      <span className="font-bold text-stone-700">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-slate-700">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {item.price * item.quantity} kr
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-4">
                <span className="text-lg font-bold text-slate-900">Totalt</span>
                <span className="text-xl font-black text-stone-700">
                  {transaction.amount} kr
                </span>
              </div>
            </div>
          </div>
        </section>

        {transaction.shopName.toLowerCase().includes('glenn') ? (
          <section className="relaxed-surface border-stone-200 bg-stone-50/70 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              QRButik-demo
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              Skapa din egen Swish-kiosk
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Det har flodet ar byggt med QRButik. Skapa din egen butik pa 2
              minuter.
            </p>
            <Link
              to="/glenn"
              className="relaxed-primary-button mt-4 inline-flex h-12 items-center justify-center px-6 text-sm font-semibold text-white"
              trackaton-on-click="glenn-thankyou-cta"
            >
              Skapa din kiosk
            </Link>
          </section>
        ) : null}

        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-500">
            När personalen har verifierat betalningen får du dina varor.
          </p>
          <Link
            to="/"
            className="text-sm font-semibold text-stone-700 hover:text-stone-800"
            trackaton-on-click="thankyou-back-home"
          >
            ← Till startsidan
          </Link>
        </div>
      </div>
    </main>
  );
}
