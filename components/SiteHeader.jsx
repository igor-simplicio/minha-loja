import { getCurrentUser } from "../lib/auth";
import { getCartCount } from "../lib/cart";
import { logoutAction } from "../app/actions";

export default async function SiteHeader({ categories = [], activeCategory, query = "" }) {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.id) : 0;

  return (
    <>
      <header className="topo">
        <a className="logo notranslate" translate="no" href="/">Buy</a>
        <form className="busca" action="/" method="GET">
          {activeCategory && (
            <input type="hidden" name="category" value={activeCategory.id} />
          )}
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search products, brands and categories"
          />
          <button type="submit">Search</button>
        </form>
        <nav className="conta">
          {user ? (
            <>
              <span>Hi, {user.name.split(" ")[0]}</span>
              <form action={logoutAction}>
                <button type="submit" className="link-conta">Sign out</button>
              </form>
            </>
          ) : (
            <a href="/login">Sign in</a>
          )}
          <a href="/cart" className="carrinho">Cart<span>{cartCount}</span></a>
        </nav>
      </header>

      {categories.length > 0 && (
        <nav className="categorias">
          <a href="/" className={!activeCategory ? "ativa" : undefined}>All</a>
          {categories.map((c) => (
            <a
              href={`/?category=${c.id}`}
              key={c.id}
              className={activeCategory?.id === c.id ? "ativa" : undefined}
            >
              {c.name}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
