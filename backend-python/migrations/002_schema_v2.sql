-- Shree Anna Marketplace - Database Schema v2
-- Supports both real Supabase auth users and developer bypass accounts
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CLEANUP: Drop existing tables to ensure schema compatibility
-- WARNING: This deletes all data in these tables.
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.lab_reports CASCADE;
DROP TABLE IF EXISTS public.qa_requests CASCADE;
DROP TABLE IF EXISTS public.fpo_members CASCADE;
DROP TABLE IF EXISTS public.fpos CASCADE;
DROP TABLE IF EXISTS public.advisories CASCADE;
DROP TABLE IF EXISTS public.trace_events CASCADE;
DROP TABLE IF EXISTS public.batches CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.schemes CASCADE;
DROP TABLE IF EXISTS public.escrow_transactions CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.fpo_profiles CASCADE;
DROP TABLE IF EXISTS public.processor_profiles CASCADE;
DROP TABLE IF EXISTS public.buyer_profiles CASCADE;
DROP TABLE IF EXISTS public.farmer_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Users Table (Supports both Supabase Auth users and Developer accounts)
-- ID can be:
--   - Supabase UUID (e.g., 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') for real users
--   - Developer token (e.g., 'dev-farmer-9876543210') for developer accounts
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    name TEXT,
    roles TEXT[] DEFAULT '{farmer}', -- Array of roles: 'farmer', 'buyer', 'fpo', 'processor', 'ksc'
    language TEXT DEFAULT 'en',
    district TEXT,
    onboarded BOOLEAN DEFAULT FALSE,
    is_kyc_verified BOOLEAN DEFAULT FALSE,
    kyc_verified_at TIMESTAMPTZ,
    push_token TEXT,
    -- KSC Verification Fields (for farmers)
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by TEXT REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    -- KSC-specific fields (for KSC users)
    ksc_center_name TEXT,
    ksc_center_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farmer Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    village TEXT,
    district TEXT,
    state TEXT,
    land_holding_acres NUMERIC,
    primary_crops TEXT[],
    bank_account TEXT,
    ifsc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Buyer Profiles
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    district TEXT,
    state TEXT,
    address TEXT,
    buyer_type TEXT, -- 'retailer', 'wholesaler', 'exporter'
    company_name TEXT,
    gst_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. Processor Profiles
CREATE TABLE IF NOT EXISTS public.processor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    district TEXT,
    state TEXT,
    city TEXT,
    unit_type TEXT,
    fssai_license TEXT,
    products TEXT[],
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. FPO Profiles
CREATE TABLE IF NOT EXISTS public.fpo_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    organization_name TEXT,
    registration_no TEXT,
    address TEXT,
    district TEXT,
    state TEXT,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 6. Listings (Marketplace Items)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL, -- 'farmer', 'processor', 'fpo'
    
    -- Basic Crop Info
    crop_type TEXT NOT NULL DEFAULT 'millets', -- 'millets' or 'pulses'
    crop TEXT NOT NULL, -- specific crop name (e.g., 'finger_millet', 'toor_dal')
    variety TEXT,
    description TEXT,
    qty_kg NUMERIC NOT NULL,
    min_price_per_qtl NUMERIC NOT NULL,
    photos TEXT[], -- Array of image URLs
    status TEXT DEFAULT 'active', -- 'active', 'sold', 'inactive'
    
    -- Harvest Info
    harvest_date TEXT, -- 'today', 'week', 'fortnight', 'other'
    
    -- Crop Inputs (What inputs farmer used to grow)
    crop_inputs TEXT, -- 'natural', 'mixed', 'chemical'
    is_organic BOOLEAN DEFAULT FALSE, -- Derived from crop_inputs if 'natural'
    
    -- Hidden Grade Parameters (Farmer-friendly questions)
    cleanliness TEXT, -- 'machine-cleaned', 'hand-cleaned', 'uncleaned'
    uniformity TEXT, -- 'uniform', 'mixed'
    drying_status TEXT, -- 'dried', 'moist'
    damaged_grains TEXT, -- 'yes', 'no'
    
    -- Calculated Grade (Auto-computed from hidden parameters)
    quality_grade TEXT, -- 'premium', 'standard', 'economy' - calculated automatically
    moisture_level TEXT, -- 'dry', 'medium', 'moist' - derived from drying_status
    grade_score INTEGER, -- Numeric score 0-100 for internal use
    
    -- Location
    district TEXT,
    state TEXT,
    
    -- Fields for processed products
    product_type TEXT,
    source_batch_id TEXT,
    processing_date TIMESTAMPTZ,
    shelf_life_days INTEGER,
    packaging_type TEXT,
    packaging_size_grams NUMERIC,
    
    -- Voice note for buyers
    voice_note_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to automatically calculate quality grade from hidden parameters
CREATE OR REPLACE FUNCTION calculate_listing_grade()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Cleanliness scoring (max 30 points)
    IF NEW.cleanliness = 'machine-cleaned' THEN
        score := score + 30;
    ELSIF NEW.cleanliness = 'hand-cleaned' THEN
        score := score + 20;
    ELSIF NEW.cleanliness = 'uncleaned' THEN
        score := score + 5;
    END IF;
    
    -- Uniformity scoring (max 25 points)
    IF NEW.uniformity = 'uniform' THEN
        score := score + 25;
    ELSIF NEW.uniformity = 'mixed' THEN
        score := score + 10;
    END IF;
    
    -- Drying status scoring (max 25 points)
    IF NEW.drying_status = 'dried' THEN
        score := score + 25;
        NEW.moisture_level := 'dry';
    ELSIF NEW.drying_status = 'moist' THEN
        score := score + 10;
        NEW.moisture_level := 'moist';
    ELSE
        NEW.moisture_level := 'medium';
    END IF;
    
    -- Damaged grains scoring (max 20 points)
    IF NEW.damaged_grains = 'no' THEN
        score := score + 20;
    ELSIF NEW.damaged_grains = 'yes' THEN
        score := score + 5;
    END IF;
    
    -- Store the numeric score
    NEW.grade_score := score;
    
    -- Calculate quality grade based on score
    IF score >= 80 THEN
        NEW.quality_grade := 'premium';
    ELSIF score >= 50 THEN
        NEW.quality_grade := 'standard';
    ELSE
        NEW.quality_grade := 'economy';
    END IF;
    
    -- Auto-set is_organic based on crop_inputs
    IF NEW.crop_inputs = 'natural' THEN
        NEW.is_organic := TRUE;
    ELSE
        NEW.is_organic := FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate grade on insert or update
DROP TRIGGER IF EXISTS trigger_calculate_listing_grade ON public.listings;
CREATE TRIGGER trigger_calculate_listing_grade
    BEFORE INSERT OR UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION calculate_listing_grade();

-- 7. Offers (Negotiations)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    price_per_qtl NUMERIC NOT NULL,
    qty_kg NUMERIC NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'countered'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID REFERENCES public.offers(id), -- Nullable for Buy Now
    listing_id UUID REFERENCES public.listings(id),
    farmer_id TEXT REFERENCES public.users(id),
    buyer_id TEXT REFERENCES public.users(id),
    quantity_kg NUMERIC NOT NULL,
    price_per_qtl NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending_pickup', -- 'pending_pickup', 'in_transit', 'delivered', 'completed'
    pickup_date TIMESTAMPTZ,
    pickup_address TEXT,
    delivery_address TEXT,
    vehicle_number TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    cert_type TEXT NOT NULL,
    cert_number TEXT,
    issuer TEXT,
    issue_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    file_url TEXT NOT NULL,
    file_type TEXT,
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id),
    user_id TEXT REFERENCES public.users(id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    payment_method TEXT,
    utr_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Escrow Transactions
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) UNIQUE,
    status TEXT DEFAULT 'pending', -- 'pending', 'held', 'released', 'refunded', 'disputed'
    amount NUMERIC NOT NULL,
    notes TEXT,
    dispute_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    dispute_filed_at TIMESTAMPTZ
);

-- 12. Schemes
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_hi TEXT,
    description TEXT,
    description_hi TEXT,
    eligibility TEXT[],
    benefits TEXT[],
    crops TEXT[],
    states TEXT[],
    application_url TEXT,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'info',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Batches (Traceability)
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code TEXT UNIQUE NOT NULL,
    created_by_id TEXT REFERENCES public.users(id),
    source_lots TEXT[],
    total_weight NUMERIC,
    crop TEXT,
    grade TEXT,
    status TEXT DEFAULT 'CREATED',
    processing_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Trace Events
CREATE TABLE IF NOT EXISTS public.trace_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_type TEXT,
    verified BOOLEAN DEFAULT TRUE
);

-- 16. Advisories
CREATE TABLE IF NOT EXISTS public.advisories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    message_hi TEXT,
    message_type TEXT NOT NULL, -- 'sms', 'voice', 'push'
    target_region TEXT,
    target_crop TEXT,
    sent_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. FPOs (Public Registry)
CREATE TABLE IF NOT EXISTS public.fpos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id TEXT REFERENCES public.users(id),
    name TEXT NOT NULL,
    registration_number TEXT,
    address TEXT,
    district TEXT,
    state TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    member_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. FPO Members
CREATE TABLE IF NOT EXISTS public.fpo_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fpo_id UUID REFERENCES public.fpos(id) ON DELETE CASCADE,
    farmer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fpo_id, farmer_id)
);

-- 19. QA Requests
CREATE TABLE IF NOT EXISTS public.qa_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id),
    requested_by_user_id TEXT REFERENCES public.users(id),
    inspector_id TEXT REFERENCES public.users(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'
    notes TEXT,
    scheduled_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Lab Reports
CREATE TABLE IF NOT EXISTS public.lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qa_request_id UUID REFERENCES public.qa_requests(id) ON DELETE CASCADE,
    grade TEXT,
    moisture_percent NUMERIC,
    foreign_matter_percent NUMERIC,
    broken_grains_percent NUMERIC,
    weight_per_unit NUMERIC,
    overall_quality_score NUMERIC,
    remarks TEXT,
    certified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Cart Items
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    qty_kg NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- 22. Requirements (Processor Buying Requirements for Farmers to see)
CREATE TABLE IF NOT EXISTS public.requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processor_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    crop TEXT NOT NULL, -- 'finger', 'foxtail', 'pearl', etc.
    qty_kg NUMERIC NOT NULL,
    target_price_per_qtl NUMERIC NOT NULL,
    quality_grade TEXT, -- 'Premium', 'Standard', 'Economy'
    is_organic BOOLEAN DEFAULT FALSE,
    notes TEXT,
    required_by TIMESTAMPTZ,
    status TEXT DEFAULT 'active', -- 'active', 'fulfilled', 'cancelled'
    district TEXT,
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trace_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Development (allows both real and developer users)
-- These policies allow all authenticated operations - tighten for production!

-- Users: Allow all operations for development
CREATE POLICY "Users: Allow all for development" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Farmer Profiles: Allow all
CREATE POLICY "Farmer Profiles: Allow all for development" ON public.farmer_profiles FOR ALL USING (true) WITH CHECK (true);

-- Buyer Profiles: Allow all
CREATE POLICY "Buyer Profiles: Allow all for development" ON public.buyer_profiles FOR ALL USING (true) WITH CHECK (true);

-- Processor Profiles: Allow all
CREATE POLICY "Processor Profiles: Allow all for development" ON public.processor_profiles FOR ALL USING (true) WITH CHECK (true);

-- FPO Profiles: Allow all
CREATE POLICY "FPO Profiles: Allow all for development" ON public.fpo_profiles FOR ALL USING (true) WITH CHECK (true);

-- Listings: Public read, Owner write
CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Listings: Allow insert for development" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Listings: Allow update for development" ON public.listings FOR UPDATE USING (true);
CREATE POLICY "Listings: Allow delete for development" ON public.listings FOR DELETE USING (true);

-- Offers: Allow all for development
CREATE POLICY "Offers: Allow all for development" ON public.offers FOR ALL USING (true) WITH CHECK (true);

-- Orders: Allow all for development
CREATE POLICY "Orders: Allow all for development" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Certificates: Allow all for development
CREATE POLICY "Certificates: Allow all for development" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

-- Payments: Allow all for development
CREATE POLICY "Payments: Allow all for development" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- Escrow: Allow all for development
CREATE POLICY "Escrow: Allow all for development" ON public.escrow_transactions FOR ALL USING (true) WITH CHECK (true);

-- Schemes: Public read
CREATE POLICY "Schemes are viewable by everyone" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Schemes: Allow insert for development" ON public.schemes FOR INSERT WITH CHECK (true);

-- Notifications: Allow all for development
CREATE POLICY "Notifications: Allow all for development" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Batches: Allow all for development
CREATE POLICY "Batches: Allow all for development" ON public.batches FOR ALL USING (true) WITH CHECK (true);

-- Trace Events: Allow all for development
CREATE POLICY "Trace Events: Allow all for development" ON public.trace_events FOR ALL USING (true) WITH CHECK (true);

-- Advisories: Allow all for development
CREATE POLICY "Advisories: Allow all for development" ON public.advisories FOR ALL USING (true) WITH CHECK (true);

-- FPOs: Allow all for development
CREATE POLICY "FPOs: Allow all for development" ON public.fpos FOR ALL USING (true) WITH CHECK (true);

-- FPO Members: Allow all for development
CREATE POLICY "FPO Members: Allow all for development" ON public.fpo_members FOR ALL USING (true) WITH CHECK (true);

-- QA Requests: Allow all for development
CREATE POLICY "QA Requests: Allow all for development" ON public.qa_requests FOR ALL USING (true) WITH CHECK (true);

-- Lab Reports: Allow all for development
CREATE POLICY "Lab Reports: Allow all for development" ON public.lab_reports FOR ALL USING (true) WITH CHECK (true);

-- Cart Items: Allow all for development
CREATE POLICY "Cart Items: Allow all for development" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);

-- Requirements: Enable RLS and allow all for development
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requirements: Allow all for development" ON public.requirements FOR ALL USING (true) WITH CHECK (true);

-- 23. Requirement Applications (Farmers applying to processor requirements)
CREATE TABLE IF NOT EXISTS public.requirement_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID REFERENCES public.requirements(id) ON DELETE CASCADE,
    farmer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    offered_price_per_qtl NUMERIC NOT NULL,
    offered_qty_kg NUMERIC NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requirement_id, farmer_id)
);

-- Requirement Applications: Enable RLS and allow all for development
ALTER TABLE public.requirement_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requirement Applications: Allow all for development" ON public.requirement_applications FOR ALL USING (true) WITH CHECK (true);

-- Seed Data for Schemes
INSERT INTO public.schemes (name, name_hi, description, description_hi, eligibility, benefits, crops, states, application_url)
VALUES 
('PM-KISAN', 'पीएम-किसान', 'Income support of Rs 6000 per year', 'प्रति वर्ष 6000 रुपये की आय सहायता', ARRAY['Small farmers', 'Marginal farmers'], ARRAY['Rs 6000/year'], ARRAY['All'], ARRAY['All'], 'https://pmkisan.gov.in'),
('Millet Mission', 'मिलेट मिशन', 'Support for millet cultivation', 'बाजरा की खेती के लिए सहायता', ARRAY['Millet farmers'], ARRAY['Seed subsidy', 'Training'], ARRAY['Millets'], ARRAY['Karnataka', 'Odisha'], 'https://nfsm.gov.in');

-- Developer accounts (Optional: Pre-seed developer accounts)
-- Uncomment the following to pre-create developer accounts:
/*
INSERT INTO public.users (id, phone, name, roles, language, district, onboarded) VALUES
('dev-farmer-9876543210', '+919876543210', 'Developer Farmer', '{farmer}', 'en', 'Bangalore Urban', true),
('dev-buyer-9876543211', '+919876543211', 'Developer Buyer', '{buyer}', 'en', 'Bangalore Urban', true),
('dev-processor-9876543212', '+919876543212', 'Developer Processor', '{processor}', 'en', 'Bangalore Urban', true),
('dev-fpo-9876543213', '+919876543213', 'Developer FPO', '{fpo}', 'en', 'Bangalore Urban', true),
('dev-ksc-9876543214', '+919876543214', 'Developer KSC', '{ksc}', 'en', 'Bangalore Urban', true);
*/

-- 24. Verification Logs (Audit trail for KSC farmer verification)
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    ksc_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('verified', 'rejected', 'assisted_registration')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Logs: Enable RLS and allow all for development
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verification Logs: Allow all for development" ON public.verification_logs FOR ALL USING (true) WITH CHECK (true);
