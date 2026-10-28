import { notFound } from "next/navigation";
import { db } from "../../../lib/db";
import SiteHeader from "../../../components/SiteHeader";
import ProductZoomImage from "../../../components/ProductZoomImage";
import { addToCartAction } from "../../actions";

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

export default async function ProductPage({ params }) {
  const { id } = await params;
  const productId = Number(id);

  const [rows] = await db.query(
    `SELECT p.id, p.name, p.description, p.price, p.old_price, p.rating, p.sold,
            p.free_shipping, p.image_url, p.stock, c.id AS category_id, c.name AS category
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.id = ?`,
    [productId]
  );
  const product = rows[0];
  if (!product) notFound();

  const [categories] = await db.query(
    "SELECT id, name FROM categories ORDER BY name"
  );

  return (
    <>
      <div className="aviso">Free shipping on orders over €30</div>
      <SiteHeader categories={categories} />

      <main className="conteudo">
        <nav className="trilha">
          <a href="/">Home</a> / <a href={`/?category=${product.category_id}`}>{product.category}</a>
        </nav>

        <div className="produto-detalhe">
          <ProductZoomImage
            src={product.image_url}
            alt={product.name}
            badge={discount(product)}
          />

          <div className="info-produto">
            <h1>{product.name}</h1>
            <p className="estrelas">
              <span>{stars(product.rating)}</span> {Number(product.rating).toFixed(1)}
              {" · "}{product.sold.toLocaleString("en-US")} sold
            </p>
            <p className="precos precos-grandes">
              <strong>{euro(product.price)}</strong>
              {product.old_price && <s>{euro(product.old_price)}</s>}
            </p>
            {product.free_shipping ? <small className="envio">Free shipping</small> : null}

            <p className="biografia">{product.description}</p>

            <form action={addToCartAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="redirectTo" value={`/product/${product.id}`} />
              <button type="submit" className="comprar comprar-grande">Add to cart</button>
            </form>
          </div>
        </div>
      </main>

      <footer className="rodape">
        © 2026 Buy. Study project, no real sales.
      </footer>
    </>
  );
}
