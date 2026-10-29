import { db } from "../lib/db";
import SiteHeader from "../components/SiteHeader";
import { addToCartAction } from "./actions";

export const dynamic = "force-dynamic";

const euro = (v) => "€" + Number(v).toFixed(2);

function discount(p) {
  if (!p.old_price) return 0;
  return Math.round((1 - p.price / p.old_price) * 100);
}

function stars(n) {
  const full = Math.round(Number(n));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const categoryId = params?.category ? Number(params.category) : null;
  const query = params?.q?.trim() || "";

  const [categories] = await db.query(
    "SELECT id, name FROM categories ORDER BY name"
  );

  const activeCategory = categories.find((c) => c.id === categoryId);

  const conditions = [];
  const values = [];
  if (activeCategory) {
    conditions.push("p.category_id = ?");
    values.push(activeCategory.id);
  }
  if (query) {
    conditions.push("(p.name LIKE ? OR c.name LIKE ?)");
    values.push(`%${query}%`, `%${query}%`);
  }

  const [products] = await db.query(
    `
    SELECT p.id, p.name, p.price, p.old_price, p.rating, p.sold,
           p.free_shipping, p.image_url, p.stock, c.name AS category
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
    ORDER BY p.sold DESC
  `,
    values
  );

  const currentPath =
    "/" +
    (() => {
      const qs = new URLSearchParams();
      if (activeCategory) qs.set("category", activeCategory.id);
      if (query) qs.set("q", query);
      const s = qs.toString();
      return s ? `?${s}` : "";
    })();

  return (
    <>
      <div className="aviso">Free shipping on orders over €30</div>

      <SiteHeader categories={categories} activeCategory={activeCategory} query={query} />

      <main className="conteudo">
        <section className="banner">
          <small>This week only</small>
          <h2>Up to 40% off our best sellers</h2>
          <p>Electronics, fashion and home with fast shipping and free returns.</p>
          <a href="#deals">Shop deals</a>
        </section>

        <h2 className="titulo-secao" id="deals">
          {query
            ? `Results for "${query}"`
            : activeCategory
            ? activeCategory.name
            : "Best sellers"}
        </h2>
        {products.length === 0 && (
          <p className="sem-resultados">No products found.</p>
        )}
        <div className="grade">
          {products.map((p) => (
            <article className="cartao" key={p.id}>
              <a href={`/product/${p.id}`} className="foto">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} />
                ) : (
                  <span>{p.name.charAt(0)}</span>
                )}
                {discount(p) > 0 && <b className="selo">-{discount(p)}%</b>}
              </a>
              <div className="info">
                <h3><a href={`/product/${p.id}`}>{p.name}</a></h3>
                <p className="estrelas">
                  <span>{stars(p.rating)}</span> {Number(p.rating).toFixed(1)}
                  {" · "}{p.sold.toLocaleString("en-US")} sold
                </p>
                <p className="precos">
                  <strong>{euro(p.price)}</strong>
                  {p.old_price && <s>{euro(p.old_price)}</s>}
                </p>
                {p.free_shipping ? <small className="envio">Free shipping</small> : null}
                {p.stock <= 0 && <small className="esgotado">Out of stock</small>}
                <form action={addToCartAction}>
                  <input type="hidden" name="productId" value={p.id} />
                  <input type="hidden" name="redirectTo" value={currentPath} />
                  <button type="submit" className="comprar" disabled={p.stock <= 0}>
                    {p.stock > 0 ? "Add to cart" : "Out of stock"}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="rodape">
        © 2026 Buy. Study project, no real sales.
      </footer>
    </>
  );
}