
-- Atualizar seu usuário para superadmin
UPDATE public.profiles 
SET role = 'superadmin' 
WHERE email = 'brunomsk9@gmail.com';

-- Verificar se o usuário existe na tabela profiles
-- Se não existir, criar o perfil
INSERT INTO public.profiles (id, name, email, role)
SELECT 
  auth.users.id,
  COALESCE(auth.users.raw_user_meta_data->>'name', auth.users.email),
  auth.users.email,
  'superadmin'
FROM auth.users 
WHERE auth.users.email = 'brunomsk9@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.email = auth.users.email
);
