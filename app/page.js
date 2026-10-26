import { db } from "../lib/db";

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

export default async function Home() {
  const [categories] = await db.query(
    "SELECT id, name FROM categories ORDER BY name"
  );
  const [products] = await db.query(`
    SELECT p.id, p.name, p.price, p.old_price, p.rating, p.sold,
           p.free_shipping, p.image_url, c.name AS category
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ORDER BY p.sold DESC
  `);

  return (
    <>
      <div className="aviso">Free shipping on orders over €30</div>

      <header className="topo">
        <a className="logo" href="/">Buy</a>
        <form className="busca">
          <input placeholder="Search products, brands and categories" />
          <button type="button">Search</button>
        </form>
        <nav className="conta">
          <a href="#">Sign in</a>
          <a href="#" className="carrinho">Cart<span>0</span></a>
        </nav>
      </header>

      <nav className="categorias">
        <a href="#" className="ativa">All</a>
        {categories.map((c) => (
          <a href="#" key={c.id}>{c.name}</a>
        ))}
      </nav>

      <main className="conteudo">
        <section className="banner">
          <small>This week only</small>
          <h2>Up to 40% off our best sellers</h2>
          <p>Electronics, fashion and home with fast shipping and free returns.</p>
          <a href="#deals">Shop deals</a>
        </section>

        <h2 className="titulo-secao" id="deals">Best sellers</h2>
        <div className="grade">
          {products.map((p) => (
            <article className="cartao" key={p.id}>
              <div className="foto">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} />
                ) : (
                  <span>{p.name.charAt(0)}</span>
                )}
                {discount(p) > 0 && <b className="selo">-{discount(p)}%</b>}
              </div>
              <div className="info">
                <h3>{p.name}</h3>
                <p className="estrelas">
                  <span>{stars(p.rating)}</span> {Number(p.rating).toFixed(1)}
                  {" · "}{p.sold.toLocaleString("en-US")} sold
                </p>
                <p className="precos">
                  <strong>{euro(p.price)}</strong>
                  {p.old_price && <s>{euro(p.old_price)}</s>}
                </p>
                {p.free_shipping ? <small className="envio">Free shipping</small> : null}
                <button className="comprar">Add to cart</button>
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