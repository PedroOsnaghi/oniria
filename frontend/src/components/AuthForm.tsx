import { useState } from "react";
import { signIn, signUp } from "../services/authService";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      const user = await signUp(email, password);
      console.log("Usuario registrado:", user);
    } catch (err) {
      console.error("Error en signup:", err);
    }
  }

  async function handleLogin() {
    try {
      const user = await signIn(email, password);
      console.log("Usuario logueado:", user);
    } catch (err) {
      console.error("Error en login:", err);
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
    </div>
  );
}