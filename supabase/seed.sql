INSERT INTO companies (id, name, initials, logo_url, brand_color, created_at) VALUES
('00000000-0000-4000-8000-000000000001', 'Aakarsh Group', 'AG', '/aakarsh-group-logo.png', '#0D1B3E', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  initials = EXCLUDED.initials,
  logo_url = EXCLUDED.logo_url,
  brand_color = EXCLUDED.brand_color;

INSERT INTO app_users (id, name, username, password, role, is_active, created_at, updated_at) VALUES
('00000000-0000-4000-8000-000000000701', 'Axay', 'admin@axay', 'axaykhokhar', 'admin', true, NOW(), NOW()),
('00000000-0000-4000-8000-000000000702', 'Axay2', 'gideonx10', 'jaimataji', 'admin', true, NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO builders (
  id, company_id, full_name, company_name, legal_name, brand_tagline, brand_color,
  logo_url, website, established_year, phone, email, office_address, notes, created_at
) VALUES
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'Rohan Mehta', 'Urban Vista Developers', 'Urban Vista Developers Pvt Ltd', 'Premium living, planned precisely', '#0D1B3E', '', 'https://urbanvista.example', 2014, '+91 98765 43210', 'rohan@urbanvista.example', 'Sector 62, Noida', 'Flagship partner for premium towers.', NOW() - INTERVAL '25 days'),
('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Neha Arora', 'Skyline Habitat', 'Skyline Habitat LLP', 'Homes with stronger returns', '#C9A84C', '', 'https://skyline.example', 2011, '+91 98765 11122', 'neha@skyline.example', 'Golf Course Road, Gurugram', '', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  company_name = EXCLUDED.company_name,
  legal_name = EXCLUDED.legal_name,
  brand_tagline = EXCLUDED.brand_tagline,
  brand_color = EXCLUDED.brand_color,
  website = EXCLUDED.website,
  established_year = EXCLUDED.established_year,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  office_address = EXCLUDED.office_address,
  notes = EXCLUDED.notes;

INSERT INTO brokers (id, company_id, full_name, agency_firm, phone, email, commission_rate, notes, created_at) VALUES
('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', 'Aman Kapoor', 'Kapoor Realty', '+91 98111 22334', 'aman@kapoorrealty.example', 2.00, 'Strong HNI referral network.', NOW() - INTERVAL '18 days'),
('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', 'Ria Sethi', 'PrimeNest Brokers', '+91 98222 33445', 'ria@primenest.example', 1.75, '', NOW() - INTERVAL '16 days')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  agency_firm = EXCLUDED.agency_firm,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  commission_rate = EXCLUDED.commission_rate,
  notes = EXCLUDED.notes;

INSERT INTO projects (
  id, company_id, builder_id, name, location, description, price_from, price_to,
  status, amenities, total_units, created_at, updated_at
) VALUES
('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', 'Emerald Heights', 'Sector 150, Noida', 'Low-density residential towers near the expressway with clubhouse and sports amenities.', 12500000, 26500000, 'Active', ARRAY['Clubhouse', 'Pool', 'Gym', 'Kids Play Area', 'Jogging Track'], 8, NOW() - INTERVAL '14 days', NOW() - INTERVAL '2 days'),
('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000102', 'Aurum Square', 'Dwarka Expressway, Gurugram', 'Upcoming mixed-use development with high-street retail and premium residences.', 9500000, 18000000, 'Upcoming', ARRAY['Retail Arcade', 'Co-working Lounge', 'Security', 'EV Charging'], 6, NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'),
('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', 'Celeste Villas', 'Sohna Road, Gurugram', 'Boutique villa enclave with landscaped courts and private terraces.', 32000000, 56000000, 'Completed', ARRAY['Private Garden', 'Terrace', 'Clubhouse', 'Concierge'], 5, NOW() - INTERVAL '45 days', NOW() - INTERVAL '12 days')
ON CONFLICT (id) DO UPDATE SET
  builder_id = EXCLUDED.builder_id,
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  price_from = EXCLUDED.price_from,
  price_to = EXCLUDED.price_to,
  status = EXCLUDED.status,
  amenities = EXCLUDED.amenities,
  total_units = EXCLUDED.total_units,
  updated_at = EXCLUDED.updated_at;

INSERT INTO leads (
  id, company_id, full_name, phone, email, lead_source, broker_id, budget,
  interested_project_id, status, notes, photo_url, latitude, longitude,
  location_address, created_at, updated_at
) VALUES
('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000001', 'Priya Malhotra', '+91 99100 11223', 'priya@example.com', 'Walk-in', NULL, 16000000, '00000000-0000-4000-8000-000000000301', 'Converted', 'Interested in lower floor inventory.', '', 28.4595, 77.0266, 'Gurugram, Haryana', NOW(), NOW()),
('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000001', 'Karan Bhatia', '+91 99888 77665', 'karan@example.com', 'Broker', '00000000-0000-4000-8000-000000000201', 25000000, '00000000-0000-4000-8000-000000000301', 'Site Visit', 'Site visit planned for weekend.', '', 28.6139, 77.209, 'New Delhi', NOW() - INTERVAL '1 day', NOW()),
('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000001', 'Sana Khan', '+91 98711 22233', 'sana@example.com', 'Online', NULL, 11000000, '00000000-0000-4000-8000-000000000302', 'New', 'Asked for payment plan.', '', 28.5355, 77.391, 'Noida, Uttar Pradesh', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  lead_source = EXCLUDED.lead_source,
  broker_id = EXCLUDED.broker_id,
  budget = EXCLUDED.budget,
  interested_project_id = EXCLUDED.interested_project_id,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  location_address = EXCLUDED.location_address,
  updated_at = EXCLUDED.updated_at;

INSERT INTO units (id, project_id, unit_number, floor, area_sqft, price, status, buyer_lead_id, notes, created_at, updated_at) VALUES
('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000301', 'A-101', 1, 1450, 12500000, 'Sold', '00000000-0000-4000-8000-000000000401', '', NOW() - INTERVAL '13 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000301', 'A-102', 1, 1450, 12700000, 'Available', NULL, '', NOW() - INTERVAL '13 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000301', 'A-201', 2, 1680, 15100000, 'Reserved', NULL, '', NOW() - INTERVAL '13 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000301', 'A-202', 2, 1680, 15300000, 'Available', NULL, '', NOW() - INTERVAL '13 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000301', 'B-301', 3, 2200, 23500000, 'Sold', NULL, '', NOW() - INTERVAL '13 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000301', 'B-302', 3, 2260, 25000000, 'Available', NULL, '', NOW() - INTERVAL '13 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000301', 'P-401', 4, 2550, 26500000, 'Available', NULL, '', NOW() - INTERVAL '13 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000301', 'P-402', 4, 2550, 26500000, 'Reserved', NULL, '', NOW() - INTERVAL '13 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000302', 'R-101', 1, 1180, 9500000, 'Available', NULL, '', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000510', '00000000-0000-4000-8000-000000000302', 'R-102', 1, 1220, 9900000, 'Available', NULL, '', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000511', '00000000-0000-4000-8000-000000000302', 'R-201', 2, 1650, 14500000, 'Reserved', NULL, '', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000512', '00000000-0000-4000-8000-000000000302', 'R-202', 2, 1850, 18000000, 'Available', NULL, '', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),
('00000000-0000-4000-8000-000000000513', '00000000-0000-4000-8000-000000000303', 'Villa 1', 0, 3200, 32000000, 'Sold', NULL, '', NOW() - INTERVAL '38 days', NOW() - INTERVAL '12 days'),
('00000000-0000-4000-8000-000000000514', '00000000-0000-4000-8000-000000000303', 'Villa 2', 0, 3600, 39000000, 'Sold', NULL, '', NOW() - INTERVAL '38 days', NOW() - INTERVAL '12 days'),
('00000000-0000-4000-8000-000000000515', '00000000-0000-4000-8000-000000000303', 'Villa 3', 0, 4100, 56000000, 'Available', NULL, '', NOW() - INTERVAL '38 days', NOW() - INTERVAL '12 days')
ON CONFLICT (id) DO UPDATE SET
  unit_number = EXCLUDED.unit_number,
  floor = EXCLUDED.floor,
  area_sqft = EXCLUDED.area_sqft,
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  buyer_lead_id = EXCLUDED.buyer_lead_id,
  notes = EXCLUDED.notes,
  updated_at = EXCLUDED.updated_at;
