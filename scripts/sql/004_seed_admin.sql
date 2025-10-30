-- seed one admin (edit the email before running)
update public.profiles
set role = 'admin'
where id in (select id from auth.users where email = 'admin@example.com');
