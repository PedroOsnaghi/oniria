import { useState } from "react";
import { signIn, signUp, signInWithGoogle } from "../services/authService";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      const user = await signUp(email, password);
      console.log("Sign up successful:", user);
    } catch (err) {
      console.error("Sign up error:", err);
    }
  }

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google login error:", err);
    }
  }

  async function handleLogin() {
    try {
      const user = await signIn(email, password);
      console.log("Login successful:", user);
    } catch (err) {
      console.error("Login error:", err);
    }
  }

  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleSignup}>Registrarse</button>
      <button onClick={handleLogin}>Iniciar sesión</button>
      <button onClick={handleGoogleLogin}>Iniciar sesión con Google</button>
    </div>
  );
}