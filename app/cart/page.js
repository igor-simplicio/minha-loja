import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import { getCartItems } from "../../lib/cart";
import SiteHeader from "../../components/SiteHeader";
import { updateCartAction, removeFromCartAction } from "../actions";

export const dynamic = "force-dynamic";

const euro = (v) => "€" + Number(v).toFixed(2);

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");

  const items = await getCartItems(user.id);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <>
      <div className="aviso">Free shipping on orders over €30</div>
      <SiteHeader />

      <main className="conteudo">
        <h2 className="titulo-secao">Your cart</h2>

        {items.length === 0 ? (
          <p className="sem-resultados">
            Your cart is empty. <a href="/">Go shopping</a>
          </p>
        ) : (
          <div className="carrinho-layout">
            <ul className="lista-carrinho">
              {items.map((item) => (
                <li key={item.product_id} className="item-carrinho">
                  <div className="foto-mini">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <span>{item.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <h3>{item.name}</h3>
                    <p>{euro(item.price)}</p>
                  </div>
                  <form action={updateCartAction} className="qtd-form">
                    <input type="hidden" name="productId" value={item.product_id} />
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      defaultValue={item.quantity}
                    />
                    <button type="submit">Update</button>
                  </form>
                  <form action={removeFromCartAction}>
                    <input type="hidden" name="productId" value={item.product_id} />
                    <button type="submit" className="remover">Remove</button>
                  </form>
                  <strong className="subtotal">{euro(item.price * item.quantity)}</strong>
                </li>
              ))}
            </ul>

            <div className="resumo-carrinho">
              <p>Total</p>
              <strong>{euro(total)}</strong>
              <button className="botao-auth" disabled>Checkout (demo)</button>
            </div>
          </div>
        )}
      </main>

      <footer className="rodape">
        © 2026 Buy. Study project, no real sales.
      </footer>
    </>
  );
}
