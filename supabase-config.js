// Supabase Configuration
const SUPABASE_URL = 'https://losrlriekibjbfnindyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvc3Jscmlla2liamJmbmluZHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTIzNDQsImV4cCI6MjA4MzEyODM0NH0.neapLD03HruxdE7a8qIosRNEM2Qrp2Ayj8arWQuUo0g';

// Initialize Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Schema (Create these tables in Supabase)

/*
-- Users (handled by Supabase Auth)
-- Additional user metadata can be stored in a profiles table

-- Mods Table
CREATE TABLE mods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(100)[] DEFAULT '{}',
    cpu_arch VARCHAR(50),
    owner VARCHAR(100),
    contact_link VARCHAR(255),
    download_url VARCHAR(500),
    version VARCHAR(50),
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    approved BOOLEAN DEFAULT false,
    guide_markdown TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    user_id UUID REFERENCES auth.users(id)
);

-- Comments Table
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mod_id UUID REFERENCES mods(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Favorites Table
CREATE TABLE favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mod_id UUID REFERENCES mods(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(mod_id, user_id)
);

-- Ratings Table
CREATE TABLE ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mod_id UUID REFERENCES mods(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(mod_id, user_id)
);

-- Messages Table (Contact Form)
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS Policies
ALTER TABLE mods ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view approved mods" ON mods FOR SELECT USING (approved = true);
CREATE POLICY "Public can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public can view ratings" ON ratings FOR SELECT USING (true);

-- Authenticated user policies
CREATE POLICY "Users can create mods" ON mods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own mods" ON mods FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create comments" ON comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can manage their own favorites" ON favorites FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own ratings" ON ratings FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Messages policy (public insert)
CREATE POLICY "Anyone can insert messages" ON messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin can view messages" ON messages FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'is_admin' = 'true')
);
*/