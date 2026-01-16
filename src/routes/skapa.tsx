import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import { authClient } from "../lib/authClient";

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const Route = createFileRoute("/skapa")({
  component: CreateShopWizard,
});

type DraftProduct = {
  id: string;
  name: string;
  price: string;
};

function CreateShopWizard() {
  const navigate = useNavigate();
  const createShopWithProducts = useMutation(api.shops.createShopWithProducts);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formState, setFormState] = useState({
    name: "",
    ownerEmail: "",
    swishNumber: "",
    slug: "",
  });
  const [products, setProducts] = useState<Array<DraftProduct>>([
    { id: crypto.randomUUID(), name: "", price: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [createdShop, setCreatedShop] = useState<{
    shopId: string;
    slug: string;
  } | null>(null);

  const slugCheck = useQuery(api.shops.checkSlug, {
    slug: formState.slug || formState.name,
  });

  const parsedProducts = useMemo(() => {
    return products.map((product) => {
      const normalizedPrice = product.price.replace(",", ".");
      return {
        name: product.name.trim(),
        price: Number.parseFloat(normalizedPrice),
      };
    });
  }, [products]);

  const canContinueStep1 =
    formState.name.trim() !== "" &&
    formState.swishNumber.trim() !== "" &&
    formState.ownerEmail.trim() !== "" &&
    formState.slug.trim() !== "" &&
    slugCheck?.isAvailable === true;

  const canSubmitStep2 = parsedProducts.length > 0 && parsedProducts.every(
    (product) => product.name && Number.isFinite(product.price) && product.price > 0,
  );

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Skapa din butik
          </h1>
          <p className="text-sm text-slate-600">
            Två enkla steg: butiksinfo och produkter.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
            <span>
              Steg {step} av 2
            </span>
            {step !== 3 ? (
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="cursor-pointer text-slate-500 hover:text-slate-700"
              >
                Till startsidan
              </button>
            ) : null}
          </div>

          {step === 1 ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setError(null);
                if (!canContinueStep1) {
                  setError("Fyll i alla obligatoriska fält.");
                  return;
                }
                setStep(2);
              }}
            >
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Butiksnamn
                <input
                  required
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  onBlur={() => {
                    if (!formState.slug && formState.name) {
                      setFormState((prev) => ({
                        ...prev,
                        slug: slugify(formState.name),
                      }));
                    }
                  }}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Swish-nummer
                <input
                  required
                  inputMode="numeric"
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                  value={formState.swishNumber}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      swishNumber: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                E-post för admin
                <input
                  required
                  type="email"
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                  value={formState.ownerEmail}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      ownerEmail: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Butikens webbadress (slug)
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 select-none">
                    qrbutik.se/s/
                  </span>
                  <input
                    required
                    placeholder="t.ex. kiosken-ovanaker"
                    className={`h-12 w-full rounded-xl border pl-[108px] pr-4 text-base text-slate-900 outline-none focus:border-indigo-500 transition-colors ${
                      formState.slug || formState.name
                        ? slugCheck === undefined
                          ? "border-slate-200 bg-slate-50"
                          : slugCheck.isAvailable
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-rose-200 bg-rose-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                    value={formState.slug}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        slug: slugify(event.target.value),
                      }))
                    }
                  />
                </div>
                {(formState.slug || formState.name) && slugCheck && (
                  <p
                    className={`text-xs ${
                      slugCheck.isAvailable ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {slugCheck.isAvailable
                      ? "Adressen är tillgänglig!"
                      : `${slugCheck.slug} är redan upptagen, välj något annat.`}
                  </p>
                )}
              </label>
              <button
                type="submit"
                className="mt-2 h-12 cursor-pointer rounded-xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                Fortsätt till produkter
              </button>
              <button
                type="button"
                disabled={!formState.ownerEmail.trim()}
                onClick={async () => {
                  const email = formState.ownerEmail.trim();
                  if (!email) {
                    setAuthStatus("Fyll i en e-postadress först.");
                    return;
                  }
                  setAuthStatus("Skickar inloggningslänk...");
                  await authClient.signIn.magicLink(
                    { email },
                    {
                      onSuccess: () =>
                        setAuthStatus("Magic link skickad. Kolla inkorgen."),
                      onError: (ctx) =>
                        setAuthStatus(ctx.error.message || "Något gick fel."),
                    },
                  );
                }}
                className="h-12 cursor-pointer rounded-xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Skicka inloggningslänk
              </button>
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              {authStatus ? (
                <p className="text-sm text-slate-600">{authStatus}</p>
              ) : null}
            </form>
          ) : null}

          {step === 2 ? (
            <form
              className="flex flex-col gap-6"
              onSubmit={async (event) => {
                event.preventDefault();
                setError(null);
                if (!canSubmitStep2) {
                  setError(
                    "Lägg till minst en produkt med namn och pris större än 0.",
                  );
                  return;
                }
                setIsSubmitting(true);
                try {
                  const result = await createShopWithProducts({
                    name: formState.name.trim(),
                    ownerEmail: formState.ownerEmail.trim(),
                    swishNumber: formState.swishNumber.trim(),
                    slug: formState.slug.trim() || undefined,
                    products: parsedProducts,
                  });
                  setCreatedShop(result);
                  setStep(3);
                } catch (submitError) {
                  if (submitError instanceof Error) {
                    setError(submitError.message);
                  } else {
                    setError("Något gick fel. Försök igen.");
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Produkter
                </h2>
                <p className="text-xs text-slate-500">
                  Namn + pris, en rad per produkt.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1.4fr_0.6fr_auto]"
                  >
                    <label className="flex flex-col gap-2 text-sm text-slate-700">
                      Produktnamn
                      <input
                        required
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                        value={product.name}
                        onChange={(event) =>
                          setProducts((prev) =>
                            prev.map((item) =>
                              item.id === product.id
                                ? { ...item, name: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-slate-700">
                      Pris (SEK)
                      <input
                        required
                        inputMode="decimal"
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                        value={product.price}
                        onChange={(event) =>
                          setProducts((prev) =>
                            prev.map((item) =>
                              item.id === product.id
                                ? { ...item, price: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() =>
                          setProducts((prev) =>
                            prev.filter((item) => item.id !== product.id),
                          )
                        }
                        className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setProducts((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), name: "", price: "" },
                  ])
                }
                className="h-12 cursor-pointer rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-6 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100"
              >
                Lägg till en ny rad
              </button>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:border-slate-300"
                >
                  Tillbaka
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 cursor-pointer rounded-xl bg-indigo-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {isSubmitting ? "Skapar butik..." : "Skapa butik"}
                </button>
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            </form>
          ) : null}

          {step === 3 && createdShop ? (
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-2xl font-semibold text-slate-900">
                Butiken är skapad!
              </h2>
              <p className="text-sm text-slate-600">
                Lägg gärna till fler produkter eller dela butiken direkt.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/s/$shopSlug"
                  params={{ shopSlug: createdShop.slug }}
                  className="cursor-pointer rounded-xl bg-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                >
                  Öppna butiken
                </Link>
                <Link
                  to="/redigera/$shopId"
                  params={{ shopId: createdShop.shopId }}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
                >
                  Redigera butik
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
