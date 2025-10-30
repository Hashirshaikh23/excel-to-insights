-- Set a specific email as admin (EDIT the email below)
-- Run after the user with this email has signed up once.
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
