-- Creating demo users for authentication
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt") VALUES
  ('user_asesor', 'asesor@consolida.mx', 'Carlos Mendoza', 'ASESOR', NOW(), NOW()),
  ('user_marlene', 'marlene@consolida.mx', 'Marlene García', 'OPERACIONES', NOW(), NOW()),
  ('user_doctora', 'doctora@consolida.mx', 'Dra. Patricia López', 'MEDICO', NOW(), NOW()),
  ('user_admin', 'admin@consolida.mx', 'Administrador Sistema', 'ADMIN', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  "updatedAt" = NOW();
