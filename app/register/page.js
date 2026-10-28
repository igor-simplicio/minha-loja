import { registerAction } from "../actions";

const ERRORS = {
  missing: "Please fill in all fields.",
  email: "Enter a valid email address.",
  short: "Password must be at least 6 characters.",
  match: "Passwords do not match.",
  taken: "This email is already registered.",
};

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const error = ERRORS[params?.error] || null;

  return (
    <main className="auth">
      <form className="cartao-auth" action={registerAction}>
        <a className="logo logo-escura notranslate" translate="no" href="/">Buy</a>
        <h1>Create account</h1>
        {error && <p className="erro-auth">{error}</p>}
        <label>
          Name
          <input type="text" name="name" required autoFocus />
        </label>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" required minLength={6} />
        </label>
        <label>
          Confirm password
          <input type="password" name="confirm" required minLength={6} />
        </label>
        <button type="submit" className="botao-auth">Create account</button>
        <p className="rodape-auth">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </form>
    </main>
  );
}
