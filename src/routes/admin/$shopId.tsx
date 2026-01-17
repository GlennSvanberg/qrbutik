import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "../../lib/authClient";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/admin/$shopId")({
  component: AdminShopDashboard,
});

function AdminShopDashboard() {
  const { data: session, isPending, error } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (isPending) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Laddar adminpanelen...
          </h1>
          <p className="text-sm text-slate-600">Kontrollerar din session.</p>
        </div>
      </main>
    );
  }

  if (!session?.user.email) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              QRButik.se
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Logga in till adminpanelen
            </h1>
            <p className="text-sm text-slate-600">
              Vi skickar en magic link till din e-postadress.
            </p>
          </header>

          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setStatusMessage(null);
              const trimmedEmail = email.trim();
              if (!trimmedEmail) {
                setStatusMessage("Fyll i en e-postadress.");
                return;
              }
              setStatusMessage("Skickar inloggningslänk...");
              await authClient.signIn.magicLink(
                { email: trimmedEmail, callbackURL: "/admin" },
                {
                  onSuccess: () =>
                    setStatusMessage("Magic link skickad. Kolla inkorgen."),
                  onError: (ctx) =>
                    setStatusMessage(ctx.error.message || "Något gick fel."),
                },
              );
            }}
          >
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              E-post
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
              />
            </label>
            <button
              type="submit"
              className="h-12 cursor-pointer rounded-xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Skicka magic link
            </button>
          </form>

          {statusMessage ? (
            <p className="text-sm text-slate-600">{statusMessage}</p>
          ) : null}
          {error ? (
            <p className="text-sm text-rose-600">{error.message}</p>
          ) : null}
        </div>
      </main>
    );
  }

  return <AdminShopContent email={session.user.email} />;
}

function AdminShopContent({ email }: { email: string }) {
  const { shopId } = Route.useParams();
  const shopIdParam = shopId as Id<"shops">;
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  );
  const { data: transactions } = useSuspenseQuery(
    convexQuery(api.transactions.listByShop, { shopId: shopIdParam }),
  );
  const verifyTransaction = useMutation(api.transactions.verify);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.status === "verified") {
          acc.verifiedCount += 1;
          acc.verifiedAmount += transaction.amount;
        } else {
          acc.pendingCount += 1;
          acc.pendingAmount += transaction.amount;
        }
        return acc;
      },
      {
        pendingCount: 0,
        verifiedCount: 0,
        pendingAmount: 0,
        verifiedAmount: 0,
      },
    );
  }, [transactions]);

  if (!shop) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Butiken hittades inte
          </h1>
          <p className="text-sm text-slate-600">
            Kontrollera länken eller gå tillbaka till adminpanelen.
          </p>
          <Link
            to="/admin"
            className="mx-auto w-fit cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Till adminpanelen
          </Link>
        </div>
      </main>
    );
  }

  if (shop.ownerEmail !== email) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Du har inte behörighet
          </h1>
          <p className="text-sm text-slate-600">
            Den här butiken är inte kopplad till din e-postadress.
          </p>
          <Link
            to="/admin"
            className="mx-auto w-fit cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Till adminpanelen
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {shop.name}
          </h1>
          <p className="text-sm text-slate-600">Adminpanel för butiken</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/admin"
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Till adminpanelen
            </Link>
            <Link
              to="/admin/$shopId/qr"
              params={{ shopId: shop._id }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              QR + PDF
            </Link>
            <Link
              to="/redigera/$shopId"
              params={{ shopId: shop._id }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Redigera butik
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Väntar på verifiering
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {totals.pendingAmount} kr
            </p>
            <p className="text-sm text-slate-500">
              {totals.pendingCount} betalningar
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Verifierade
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {totals.verifiedAmount} kr
            </p>
            <p className="text-sm text-slate-500">
              {totals.verifiedCount} betalningar
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Senaste transaktioner
            </h2>
            <span className="text-xs text-slate-500">
              Realtid från kassan
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Inga transaktioner ännu.
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {transaction.reference}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(transaction.createdAt).toLocaleTimeString(
                          "sv-SE",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-slate-900">
                        {transaction.amount} kr
                      </span>
                      {transaction.status === "verified" ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Verifierad
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            setError(null);
                            setStatusMessage(null);
                            try {
                              await verifyTransaction({
                                transactionId: transaction._id,
                              });
                              setStatusMessage("Betalning verifierad.");
                            } catch (verifyError) {
                              if (verifyError instanceof Error) {
                                setError(verifyError.message);
                              } else {
                                setError("Något gick fel. Försök igen.");
                              }
                            }
                          }}
                          className="cursor-pointer rounded-xl bg-indigo-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                        >
                          Verifiera
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-slate-200 text-sm text-slate-600">
                    {transaction.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-2">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>{item.price * item.quantity} kr</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {statusMessage ? (
          <p className="text-sm text-slate-600">{statusMessage}</p>
        ) : null}
      </div>
    </main>
  );
}
