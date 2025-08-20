-- Create tables for emissions system
CREATE TABLE IF NOT EXISTS emisiones (
  id SERIAL PRIMARY KEY,
  folio VARCHAR(50) UNIQUE NOT NULL,
  tipo_emision VARCHAR(50) NOT NULL,
  estado VARCHAR(50) DEFAULT 'BORRADOR',
  persona VARCHAR(20) NOT NULL,
  requiere_factura BOOLEAN DEFAULT false,
  monto_usd DECIMAL(12,2),
  cliente_nombre VARCHAR(255),
  solicitante JSONB,
  moral_info JSONB,
  declaraciones JSONB,
  supuestos_meta JSONB,
  ocr_findings JSONB,
  escalado_a VARCHAR(20),
  responsable_id INTEGER REFERENCES gmm_users(id),
  created_by_id INTEGER REFERENCES gmm_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documentos (
  id SERIAL PRIMARY KEY,
  emision_id INTEGER REFERENCES emisiones(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  ocr_status VARCHAR(20) DEFAULT 'PENDING',
  ocr_data JSONB,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faltantes (
  id SERIAL PRIMARY KEY,
  emision_id INTEGER REFERENCES emisiones(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Insert sample emissions for testing
INSERT INTO emisiones (folio, tipo_emision, estado, persona, requiere_factura, monto_usd, cliente_nombre, solicitante, created_at) VALUES
('GMM-2024001', 'NUEVO_NEGOCIO', 'FALTANTES', 'FISICA', true, 15000.00, 'Juan Pérez García', '{"nombre": "Juan", "apellidos": "Pérez García", "rfc": "PEGJ850101ABC"}', NOW() - INTERVAL '2 days'),
('GMM-2024002', 'ELIMINACION_PERIODOS', 'EN_REVISION_OCR', 'MORAL', false, 25000.00, 'Empresa Demo SA', '{"razonSocial": "Empresa Demo SA", "rfc": "EDE123456789"}', NOW() - INTERVAL '1 day'),
('GMM-2024003', 'CONVERSION_INDIVIDUAL', 'ALTA_VIABLE', 'FISICA', false, 8500.00, 'María López Sánchez', '{"nombre": "María", "apellidos": "López Sánchez", "rfc": "LOSM900215XYZ"}', NOW()),
('GMM-2024004', 'CONEXION_GNP', 'ESCALADO_OPERACIONES', 'FISICA', true, 12000.00, 'Carlos Rodríguez Martín', '{"nombre": "Carlos", "apellidos": "Rodríguez Martín", "rfc": "ROMC750330DEF"}', NOW());

-- Insert sample faltantes
INSERT INTO faltantes (emision_id, code, message) VALUES
(1, 'F_SIN_CONSTANCIA', 'Requiere constancia fiscal para facturar.'),
(1, 'F_SIN_ID_OFICIAL', 'Persona Física con monto > USD 7,500 requiere ID oficial.'),
(4, 'F_DOC_ILEGIBLE', 'Documento ilegible; re-sube en alta resolución.');
