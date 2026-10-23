-- イベント・バンドの画像を置く events バケット。STORAGE_PATH が公開 URL を組み立てるので public にする
insert into storage.buckets (id, name, public)
values ('events', 'events', true)
on conflict (id) do nothing;

-- 書き込めるのは管理者だけ。アプリのサーバーが isAdmin を確かめたうえで、
-- app_role = 'admin' のクレームを付けた JWT を発行する（src/utils/supabase.ts）
create policy "Admins can upload event images"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (
  bucket_id = 'events'
  and auth.jwt() ->> 'app_role' = 'admin'
);

create policy "Admins can update event images"
on "storage"."objects"
as permissive
for update
to authenticated
using (
  bucket_id = 'events'
  and auth.jwt() ->> 'app_role' = 'admin'
)
with check (
  bucket_id = 'events'
  and auth.jwt() ->> 'app_role' = 'admin'
);

create policy "Admins can delete event images"
on "storage"."objects"
as permissive
for delete
to authenticated
using (
  bucket_id = 'events'
  and auth.jwt() ->> 'app_role' = 'admin'
);

-- 削除や upsert では対象の行を select できる必要がある。public バケットの読み取りは誰でもよい
create policy "Anyone can read event images"
on "storage"."objects"
as permissive
for select
to public
using (bucket_id = 'events');
