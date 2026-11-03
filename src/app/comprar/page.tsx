
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string;
  slug: string;
  title: string;
  audience: string;
  prize_description: string | null;
  draw_at: string | null;
  price_single_cents: number;
  price_multi_cents: number;
  reservation_minutes: number;
};

export default function ComprarPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCampaigns() {
      const { data, error } = await supabase.rpc(
        "public_campaigns"
      );

      if (error) {
        setError("Não foi possível carregar as campanhas.");
      } else {
        setCampaigns(data ?? []);
      }

      setLoading(false);
    }

    void loadCampaigns();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold">
          Escolha sua campanha
        </h1>

        <p className="mb-8 text-slate-400">
          Selecione uma campanha para participar.
        </p>

        {loading && <p>Carregando campanhas...</p>}

        {error && (
          <p className="text-red-400">{error}</p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="mb-3 text-xl font-bold">
                {campaign.title}
              </h2>

              <p className="text-slate-300">
                1 número:{" "}
                {(campaign.price_single_cents / 100)
                  .toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
              </p>

              <p className="mt-2 text-slate-300">
                2 ou mais:{" "}
                {(campaign.price_multi_cents / 100)
                  .toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}{" "}
                por número
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Prazo para pagamento:{" "}
                {campaign.reservation_minutes} minutos
              </p>

              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-lg bg-blue-600 p-3 font-semibold opacity-60"
              >
                Selecionar números — em breve
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
