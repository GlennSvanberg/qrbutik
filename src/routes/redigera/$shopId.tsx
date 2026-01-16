import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/redigera/$shopId")({
  component: EditShop,
});

type DraftProduct = {
  id: Id<"products">;
  name: string;
  price: string;
};

function EditShop() {
  const { shopId } = Route.useParams();
  const shopIdParam = shopId as Id<"shops">;
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  );
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.listByShop, { shopId: shopIdParam }),
  );
  const updateShop = useMutation(api.shops.updateShop);
  const addProduct = useMutation(api.products.addProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const [shopState, setShopState] = useState({
    name: "",
    ownerEmail: "",
    swishNumber: "",
  });
  const [productDrafts, setProductDrafts] = useState<Array<DraftProduct>>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shop) {
      return;
    }
    setShopState({
      name: shop.name,
      ownerEmail: shop.ownerEmail,
      swishNumber: shop.swishNumber,
    });
  }, [shop]);

  useEffect(() => {
    setProductDrafts(
      products.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price.toString(),
      })),
    );
  }, [products]);

  const canSaveShop =
    shopState.name.trim() &&
    shopState.ownerEmail.trim() &&
    shopState.swishNumber.trim();

  const parsedNewProduct = useMemo(() => {
    const normalizedPrice = newProduct.price.replace(",", ".");
    return {
      name: newProduct.name.trim(),
      price: Number.parseFloat(normalizedPrice),
    };
  }, [newProduct]);

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
            className="mx-auto w-fit cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Till startsidan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Redigera butik
          </h1>
          <p className="text-sm text-slate-600">
            {shop.name} · <span className="font-medium">/s/{shop.slug}</span>
          </p>
          <Link
            to="/s/$shopSlug"
            params={{ shopSlug: shop.slug }}
            className="mx-auto w-fit cursor-pointer text-sm font-semibold text-indigo-700 hover:text-indigo-600"
          >
            Öppna butiken
          </Link>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Butiksinfo
            </h2>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Butiksnamn
              <input
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                value={shopState.name}
                onChange={(event) =>
                  setShopState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Swish-nummer
              <input
                inputMode="numeric"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                value={shopState.swishNumber}
                onChange={(event) =>
                  setShopState((prev) => ({
                    ...prev,
                    swishNumber: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              E-post för admin
              <input
                type="email"
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                value={shopState.ownerEmail}
                onChange={(event) =>
                  setShopState((prev) => ({
                    ...prev,
                    ownerEmail: event.target.value,
                  }))
                }
              />
            </label>
            <button
              type="button"
              disabled={!canSaveShop}
              onClick={async () => {
                setError(null);
                setStatusMessage(null);
                try {
                  await updateShop({
                    shopId: shop._id,
                    name: shopState.name.trim(),
                    swishNumber: shopState.swishNumber.trim(),
                    ownerEmail: shopState.ownerEmail.trim(),
                  });
                  setStatusMessage("Butiksinfo uppdaterad.");
                } catch (updateError) {
                  if (updateError instanceof Error) {
                    setError(updateError.message);
                  } else {
                    setError("Något gick fel. Försök igen.");
                  }
                }
              }}
              className="h-12 cursor-pointer rounded-xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              Spara butiksinfo
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Produkter
              </h2>
              <p className="text-xs text-slate-500">
                Snabbt och enkelt: namn + pris.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {productDrafts.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1.4fr_0.6fr_auto_auto]"
                >
                  <label className="flex flex-col gap-2 text-sm text-slate-700">
                    Produktnamn
                    <input
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                      value={product.name}
                      onChange={(event) =>
                        setProductDrafts((prev) =>
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
                      inputMode="decimal"
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                      value={product.price}
                      onChange={(event) =>
                        setProductDrafts((prev) =>
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
                      onClick={async () => {
                        setError(null);
                        setStatusMessage(null);
                        const normalizedPrice = product.price.replace(",", ".");
                        const price = Number.parseFloat(normalizedPrice);
                        if (!product.name.trim() || !Number.isFinite(price)) {
                          setError("Ange ett namn och ett giltigt pris.");
                          return;
                        }
                        try {
                          await updateProduct({
                            productId: product.id,
                            name: product.name.trim(),
                            price,
                          });
                          setStatusMessage("Produkt uppdaterad.");
                        } catch (updateError) {
                          if (updateError instanceof Error) {
                            setError(updateError.message);
                          } else {
                            setError("Något gick fel. Försök igen.");
                          }
                        }
                      }}
                      className="h-11 cursor-pointer rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                    >
                      Spara
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={async () => {
                        setError(null);
                        setStatusMessage(null);
                        try {
                          await deleteProduct({ productId: product.id });
                          setProductDrafts((prev) =>
                            prev.filter((item) => item.id !== product.id),
                          );
                          setStatusMessage("Produkt borttagen.");
                        } catch (deleteError) {
                          if (deleteError instanceof Error) {
                            setError(deleteError.message);
                          } else {
                            setError("Något gick fel. Försök igen.");
                          }
                        }
                      }}
                      className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:border-slate-300"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1.4fr_0.6fr_auto]">
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Ny produkt
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Pris (SEK)
                <input
                  inputMode="decimal"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  value={newProduct.price}
                  onChange={(event) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      price: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    setStatusMessage(null);
                    if (
                      !parsedNewProduct.name ||
                      !Number.isFinite(parsedNewProduct.price) ||
                      parsedNewProduct.price <= 0
                    ) {
                      setError("Ange ett namn och ett giltigt pris.");
                      return;
                    }
                    try {
                      const productId = await addProduct({
                        shopId: shop._id,
                        name: parsedNewProduct.name,
                        price: parsedNewProduct.price,
                      });
                      setProductDrafts((prev) => [
                        ...prev,
                        {
                          id: productId,
                          name: parsedNewProduct.name,
                          price: parsedNewProduct.price.toString(),
                        },
                      ]);
                      setNewProduct({ name: "", price: "" });
                      setStatusMessage("Produkt tillagd.");
                    } catch (addError) {
                      if (addError instanceof Error) {
                        setError(addError.message);
                      } else {
                        setError("Något gick fel. Försök igen.");
                      }
                    }
                  }}
                  className="h-11 cursor-pointer rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                >
                  Lägg till
                </button>
              </div>
            </div>
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
