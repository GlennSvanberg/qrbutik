import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/tack/$transactionId")({
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
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Betalningen hittades inte
          </h1>
          <p className="text-sm text-slate-600">
            Vi kunde inte hitta information om den här betalningen.
          </p>
          <Link
            to="/"
            className="mx-auto w-fit rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
            trackaton-on-click="thankyou-back-home"
          >
            Till startsidan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
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

        <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-50 py-6 text-center">
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
                      <span className="font-bold text-indigo-600">
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
                <span className="text-xl font-black text-indigo-700">
                  {transaction.amount} kr
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-500">
            När personalen har verifierat betalningen får du dina varor.
          </p>
          <Link
            to="/"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            trackaton-on-click="thankyou-back-home"
          >
            ← Till startsidan
          </Link>
        </div>
      </div>
    </main>
  );
}
