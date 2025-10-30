-- Set a specific email as admin (EDIT the email below after that user has signed up at least once)
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
