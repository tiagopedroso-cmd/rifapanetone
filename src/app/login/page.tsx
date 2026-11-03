
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      // Autentica o usuário no Supabase.
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error || !data.user) {
        setMessage("E-mail ou senha inválidos.");
        return;
      }

      // Verifica se o usuário está autorizado
      // a acessar o painel administrativo.
      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();

        setMessage(
          "Usuário sem acesso administrativo."
        );
        return;
      }

      // Redireciona para o painel administrativo.
      router.replace("/admin/reservas");
      router.refresh();
    } catch {
      setMessage(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-8"
      >
        <h1 className="text-2xl font-bold">
          Acesso Administrativo
        </h1>

        <p className="text-sm text-slate-400">
          Entre com suas credenciais para acessar
          o painel de gestão.
        </p>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            E-mail
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="seu@email.com"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium"
          >
            Senha
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Digite sua senha"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {message && (
          <p
            role="alert"
            className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
