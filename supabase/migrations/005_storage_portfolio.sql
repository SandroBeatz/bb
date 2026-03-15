-- Create portfolio storage bucket with public read access
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

-- Allow anyone to read portfolio photos (public bucket)
create policy "portfolio_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'portfolio');

-- Allow service role full access (server-side uploads and deletes)
create policy "portfolio_service_role_all"
  on storage.objects for all
  to service_role
  using (bucket_id = 'portfolio')
  with check (bucket_id = 'portfolio');
