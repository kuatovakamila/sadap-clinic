-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  specialization TEXT, -- связь с врачами (например "Педиатр")
  equipment JSONB DEFAULT '[]'::jsonb, -- массив объектов с оборудованием [{title, description, image_url}]
  is_published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_published ON services(is_published);

-- Example data
INSERT INTO services (title, slug, description, specialization, image_url, equipment, is_published) VALUES
('Педиатрия', 'pediatriya', 'Комплексная медицинская помощь детям от рождения до 18 лет. Наши педиатры проводят профилактические осмотры, диагностику и лечение детских заболеваний.', 'Педиатр', '/services/pediatrics.png', 
'[
  {
    "title": "УЗИ аппарат последнего поколения",
    "description": "Современное ультразвуковое оборудование для точной диагностики",
    "image_url": "/equipment/uzi.jpg"
  },
  {
    "title": "Педиатрический стол",
    "description": "Специализированное оборудование для комфортного осмотра детей",
    "image_url": "/equipment/table.jpg"
  }
]'::jsonb, 
true),

('Гинекология', 'ginekologiya', 'Полный спектр гинекологических услуг: профилактические осмотры, диагностика и лечение заболеваний женской репродуктивной системы.', 'Гинеколог', '/services/gynecology.png',
'[
  {
    "title": "Кольпоскоп",
    "description": "Современный кольпоскоп для точной диагностики",
    "image_url": "/equipment/colposcope.jpg"
  }
]'::jsonb,
true),

('Терапия', 'terapiya', 'Диагностика, лечение и профилактика заболеваний внутренних органов. Комплексный подход к здоровью взрослых пациентов.', 'Терапевт', '/services/therapy.png',
'[]'::jsonb,
true);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published services
CREATE POLICY "Public services are viewable by everyone"
ON services FOR SELECT
USING (is_published = true);

-- Policy: Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage services"
ON services FOR ALL
USING (auth.role() = 'authenticated');
