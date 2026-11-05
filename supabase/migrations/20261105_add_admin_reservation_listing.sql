-- Lista dados pessoais de reservas somente para administradores autenticados.
create or replace function public.admin_list_reservations()
returns table(
  id uuid,
  campaign_id uuid,
  status text,
  total_cents integer,
  created_at timestamptz,
  expires_at timestamptz,
  full_name text,
  phone text,
  numbers smallint[]
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if auth.uid() is null or not exists (
    select 1 from public.admin_users where user_id = auth.uid()
  ) then
    raise exception 'Acesso administrativo necessario';
  end if;

  return query
  select
    r.id,
    r.campaign_id,
    r.status::text,
    r.total_cents,
    r.created_at,
    r.expires_at,
    p.full_name,
    p.phone,
    coalesce(array_agg(rn.number order by rn.number) filter (where rn.number is not null), array[]::smallint[])
  from public.reservations r
  left join public.participants p on p.id = r.participant_id
  left join public.reservation_numbers rn on rn.reservation_id = r.id
  group by r.id, p.full_name, p.phone
  order by r.created_at desc;
end
$function$;

grant execute on function public.admin_list_reservations() to authenticated;
notify pgrst, 'reload schema';
