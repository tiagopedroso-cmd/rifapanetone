-- Atualiza a data do sorteio das campanhas públicas para 01/12/2026.
-- Execute também este SQL no Supabase SQL Editor.

update public.campaigns
set draw_at = timestamptz '2026-12-01 00:00:00-03'
where slug in ('panetone', 'torta');

notify pgrst, 'reload schema';
