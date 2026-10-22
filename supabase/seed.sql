-- STORAGE_PATH が /storage/v1/object/public/ の URL を組み立てるので public にする
insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do nothing;
