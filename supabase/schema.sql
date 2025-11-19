-- Create catalogs table
CREATE TABLE IF NOT EXISTS catalogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_name TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for catalogs
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalogs', 'catalogs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to catalog files
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'catalogs');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'catalogs' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'catalogs' AND
  auth.role() = 'authenticated'
);

-- Enable Row Level Security
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Catalogs policies
CREATE POLICY "Public can view catalogs" ON catalogs
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert catalogs" ON catalogs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update catalogs" ON catalogs
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete catalogs" ON catalogs
FOR DELETE USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Anyone can insert orders" ON orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view orders" ON orders
FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_catalogs_created_at ON catalogs(created_at DESC);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_email ON orders(email);

