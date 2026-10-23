create policy "Enable insert for authenticated users only"
on "storage"."buckets"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "storage"."buckets"
as permissive
for select
to public
using (true);


create policy "Give users authenticated access to folder 1ige2ga_0"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'profiles'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder 1ige2ga_1"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'profiles'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder 1ige2ga_2"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'profiles'::text) AND (auth.role() = 'authenticated'::text)));


create policy "allow all 1ige2ga_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'profiles'::text));



