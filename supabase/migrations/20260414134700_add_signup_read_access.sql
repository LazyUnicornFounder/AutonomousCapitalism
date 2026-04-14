-- Allow reading subscribers for signup dashboard
create or replace function get_all_subscribers()
returns table (email text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select email, coalesce(subscribed_at, created_at) as created_at
  from subscribers
  order by created_at desc;
$$;

-- Grant execute to anon so we can call via RPC
grant execute on function get_all_subscribers() to anon;
grant execute on function get_all_subscribers() to authenticated;
