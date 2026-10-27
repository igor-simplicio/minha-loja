import { loginAction } from "../actions";

const ERRORS = {
  missing: "Please fill in email and password.",
  invalid: "Invalid email or password.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = ERRORS[params?.error] || null;
  const next = params?.next || "/";

  return (
    <main className="auth">
      <form className="cartao-auth" action={loginAction}>
        <a className="logo logo-escura" href="/">Buy</a>
        <h1>Sign in</h1>
        {error && <p className="erro-auth">{error}</p>}
        <label>
          Email
          <input type="email" name="email" required autoFocus />
        </label>
        <label>
          Password
          <input type="password" name="password" required />
        </label>
        <input type="hidden" name="next" value={next} />
        <button type="submit" className="botao-auth">Sign in</button>
        <p className="rodape-auth">
          No account yet? <a href="/register">Create one</a>
        </p>
      </form>
    </main>
  );
}
