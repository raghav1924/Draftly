-- Draftly seed data
-- Prerequisite: create auth users in Supabase Dashboard (Authentication > Users)
--
-- User 1: owner@test.com / Password123
-- User 2: editor@test.com / Password123
--
-- Profiles are auto-created via the on_auth_user_created trigger.
-- Run the updates below after creating both users.

update public.profiles
set name = 'Document Owner'
where email = 'owner@test.com';

update public.profiles
set name = 'Shared Editor'
where email = 'editor@test.com';
