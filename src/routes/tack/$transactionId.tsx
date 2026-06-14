import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { isDemoShopName } from "~/lib/demo";

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
          <h1 className="text-2xl font-semibold text-brand-foreground">
            Betalningen hittades inte
          </h1>
          <p className="text-sm text-brand-muted">
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
            <h1 className="text-3xl font-bold text-brand-foreground">
              Tack för ditt köp!
            </h1>
            <p className="text-lg font-medium text-brand-muted">
              Visa denna skärm för personalen i {transaction.shopName}
            </p>
          </div>
        </div>

        <section className="relaxed-surface flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-4">
            <div className="relaxed-surface-soft flex flex-col items-center justify-center gap-1 bg-surface-muted/80 py-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-subtle">
                Referensnummer
              </p>
              <p className="text-2xl font-black tracking-tight text-brand-foreground">
                {transaction.reference}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
                Din beställning
              </h3>
              <div className="divide-y divide-brand-border">
                {transaction.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-3">
                    <div className="flex gap-3">
                      <span className="font-bold text-brand-muted">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-brand-muted">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-brand-foreground">
                      {item.price * item.quantity} kr
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-brand-border pt-4">
                <span className="text-lg font-bold text-brand-foreground">Totalt</span>
                <span className="text-xl font-black text-brand-muted">
                  {transaction.amount} kr
                </span>
              </div>
            </div>
          </div>
        </section>

        {isDemoShopName(transaction.shopName) ? (
          <section className="relaxed-surface border-brand-border bg-surface-muted/70 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
              QRButik-demo
            </p>
            <h2 className="mt-2 text-lg font-semibold text-brand-foreground">
              Digital kiosk för hela föreningen
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Det här flödet bygger på QRButik — kiosksystem för idrottsföreningar
              med Swish, export och flera kiosker under samma licens.
            </p>
            <Link
              to="/glenn"
              className="relaxed-primary-button mt-4 inline-flex h-12 cursor-pointer items-center justify-center px-6 text-sm font-semibold text-white"
              trackaton-on-click="demo-thankyou-cta"
            >
              Starta provperiod
            </Link>
          </section>
        ) : null}

        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-brand-muted">
            När personalen har verifierat betalningen får du dina varor.
          </p>
          <Link
            to="/"
            className="text-sm font-semibold text-brand-muted hover:text-brand-foreground"
            trackaton-on-click="thankyou-back-home"
          >
            ← Till startsidan
          </Link>
        </div>
      </div>
    </main>
  );
}
