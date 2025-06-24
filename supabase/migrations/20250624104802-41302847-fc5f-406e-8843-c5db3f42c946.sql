
-- Atualizar seu usuário para ter papel de superadmin
-- Substitua 'seu-email@exemplo.com' pelo seu email real
UPDATE public.profiles 
SET role = 'superadmin' 
WHERE email = 'brunomsk9@gmail.com';

-- Alternativa: se você souber seu user ID, pode usar:
-- UPDATE public.profiles 
-- SET role = 'superadmin' 
-- WHERE id = 'seu-user-id-aqui';
