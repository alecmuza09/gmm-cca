-- Create GMM users table
CREATE TABLE IF NOT EXISTS public.gmm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo users
INSERT INTO public.gmm_users (email, name, role, password_hash) VALUES
  ('asesor@consolida.mx', 'Asesor Demo', 'ASESOR', 'password'),
  ('marlene@consolida.mx', 'Marlene Operaciones', 'OPERACIONES', 'password'),
  ('doctora@consolida.mx', 'Doctora Médico', 'MEDICO', 'password'),
  ('admin@consolida.mx', 'Admin Sistema', 'ADMIN', 'password')
ON CONFLICT (email) DO NOTHING;
