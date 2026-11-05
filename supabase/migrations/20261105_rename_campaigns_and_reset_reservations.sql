-- Renomeia as campanhas e limpa todo o histórico de compras/reservas.
-- Execute este arquivo uma única vez no Supabase SQL Editor.
begin;

update public.campaigns
set
  title = 'Panetone',
  slug = 'panetone',
  prize_description = 'Panetone laCreme Premium ao Leite — 750 g'
where slug = 'masculina';

update public.campaigns
set
  title = 'Torta',
  slug = 'torta',
  prize_description = '2 tortas: 1 de limão + 1 Banoffee'
where slug = 'feminina';

-- Remove dependências antes das reservas, preservando a estrutura das campanhas.
delete from public.audit_logs where entity_type = 'reservation';
delete from public.payment_records;
delete from public.number_holdings;
delete from public.reservation_numbers;
delete from public.reservations;
delete from public.participants
where not exists (
  select 1 from public.reservations r where r.participant_id = participants.id
);

commit;

notify pgrst, 'reload schema';
