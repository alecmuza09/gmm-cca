-- Seed script for GMM webapp demo data
-- Create demo users
INSERT INTO users (id, email, name, role) VALUES
  ('user_marlene', 'marlene@consolida.mx', 'Marlene García', 'OPERACIONES'),
  ('user_doctora', 'doctora@consolida.mx', 'Dra. Patricia López', 'MEDICO'),
  ('user_asesor', 'asesor@consolida.mx', 'Carlos Mendoza', 'ASESOR'),
  ('user_admin', 'admin@consolida.mx', 'Admin Sistema', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Create demo emissions
INSERT INTO emisiones (
  id, folio, tipo_emision, estado, persona, requiere_factura, monto_usd,
  solicitante, moral_info, declaraciones, supuestos_meta,
  escalado_a, responsable_id, created_by_id
) VALUES
  (
    'emision_1',
    'GMM-2025-001',
    'NUEVO_NEGOCIO',
    'FALTANTES',
    'FISICA',
    true,
    8500.00,
    '{"nombre": "Juan", "apellidos": "Pérez García", "fechaNac": "1985-03-15", "rfc": "PEGJ850315ABC", "email": "juan.perez@email.com", "telefono": "5551234567"}',
    null,
    '{"actividadesDeRiesgo": ["submarinismo"], "riesgoSelecto": false, "padecimientosDeclarados": "Ninguno"}',
    '{"requiereFactura": true}',
    null,
    'user_asesor',
    'user_asesor'
  ),
  (
    'emision_2',
    'GMM-2025-002',
    'ELIMINACION_PERIODOS',
    'ESCALADO_OPERACIONES',
    'MORAL',
    false,
    12000.00,
    '{"razonSocial": "Tecnología Avanzada SA", "rfc": "TAV850315XYZ", "representante": "María González"}',
    '{"razonSocial": "Tecnología Avanzada SA", "rfc": "TAV850315XYZ", "codigoCliente": "CLI001"}',
    '{"actividadesDeRiesgo": [], "riesgoSelecto": true}',
    '{"vieneDe": "GRUPAL", "fechaFinVigencia": "2024-12-15"}',
    'OPERACIONES',
    'user_marlene',
    'user_asesor'
  )
ON CONFLICT (folio) DO NOTHING;

-- Create demo faltantes
INSERT INTO faltantes (id, emision_id, code, message, resolved) VALUES
  ('faltante_1', 'emision_1', 'F_SIN_CONSTANCIA', 'Falta constancia fiscal para facturar', false),
  ('faltante_2', 'emision_1', 'F_ID_REPRESENTANTE', 'Falta ID del representante legal', false),
  ('faltante_3', 'emision_2', 'F_VIGENCIA_FUERA_DE_PLAZO', 'La vigencia anterior excede los 30 días', false)
ON CONFLICT DO NOTHING;
