-- Permite que visitantes criem uma reserva pela página pública.
-- A assinatura é resolvida automaticamente para aceitar o tipo usado pela
-- função já instalada (por exemplo, integer[] ou bigint[]).
do $$
declare
  reservation_function regprocedure;
begin
  select p.oid::regprocedure
    into reservation_function
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'sim_create_reservation'
  limit 1;

  if reservation_function is null then
    raise exception 'Função public.sim_create_reservation não foi encontrada.';
  end if;

  execute format('grant execute on function %s to anon, authenticated', reservation_function);
end $$;
