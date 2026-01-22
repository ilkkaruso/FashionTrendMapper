-- migrations/001_initial_schema.sql
-- Tables for Phase 1: Foundation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trends table
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  external_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table for many-to-many
CREATE TABLE trend_categories (
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (trend_id, category_id)
);

-- Trend sources (for tracking where data comes from)
CREATE TABLE trend_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Affiliate products
CREATE TABLE affiliate_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  affiliate_link TEXT NOT NULL,
  price_range TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trend history (daily snapshots)
CREATE TABLE trend_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  data_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trend_id, snapshot_date)
);

-- Trend history monthly aggregates
CREATE TABLE trend_history_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trend_id, year, month)
);

-- Admin configuration
CREATE TABLE admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_trends_created_at ON trends(created_at DESC);
CREATE INDEX idx_trend_categories_trend ON trend_categories(trend_id);
CREATE INDEX idx_trend_categories_category ON trend_categories(category_id);
CREATE INDEX idx_affiliate_products_trend ON affiliate_products(trend_id);
CREATE INDEX idx_trend_history_trend_date ON trend_history(trend_id, snapshot_date DESC);
CREATE INDEX idx_trend_history_monthly_trend ON trend_history_monthly(trend_id, year DESC, month DESC);

-- Row Level Security (RLS) policies
-- (Enable RLS in later phases when auth is added)
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_history_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Public read access for now (restrict in later phases)
CREATE POLICY "Allow public read on trends" ON trends FOR SELECT USING (true);
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on trend_categories" ON trend_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on affiliate_products" ON affiliate_products FOR SELECT USING (true);
