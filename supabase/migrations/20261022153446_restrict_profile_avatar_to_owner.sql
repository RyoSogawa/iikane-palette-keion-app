-- profiles バケットへの書き込みを、自分の userId のフォルダだけに絞る。
-- auth.uid() は sub を uuid にキャストするが、User.id は cuid なのでエラーになる。sub を文字列のまま比べる。

drop policy "Give users authenticated access to folder 1ige2ga_0" on "storage"."objects";
drop policy "Give users authenticated access to folder 1ige2ga_1" on "storage"."objects";
drop policy "Give users authenticated access to folder 1ige2ga_2" on "storage"."objects";

create policy "Users can upload avatars to their own folder"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (
  bucket_id = 'profiles'
  and (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
);

-- with check も付けて、自分のファイルを他人のフォルダへ移すことも防ぐ
create policy "Users can update avatars in their own folder"
on "storage"."objects"
as permissive
for update
to authenticated
using (
  bucket_id = 'profiles'
  and (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
)
with check (
  bucket_id = 'profiles'
  and (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
);

create policy "Users can delete avatars in their own folder"
on "storage"."objects"
as permissive
for delete
to authenticated
using (
  bucket_id = 'profiles'
  and (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
);
