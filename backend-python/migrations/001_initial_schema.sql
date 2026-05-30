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

-- 1. Users Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT UNIQUE,
    name TEXT,
    roles TEXT[] DEFAULT '{farmer}', -- Array of roles: 'farmer', 'buyer', 'fpo', 'processor', 'admin'
    language TEXT DEFAULT 'en',
    district TEXT,
    onboarded BOOLEAN DEFAULT FALSE,
    is_kyc_verified BOOLEAN DEFAULT FALSE,
    kyc_verified_at TIMESTAMPTZ,
    push_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farmer Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL, -- 'farmer', 'processor', 'fpo'
    crop TEXT NOT NULL,
    variety TEXT,
    description TEXT,
    qty_kg NUMERIC NOT NULL,
    min_price_per_qtl NUMERIC NOT NULL,
    photos TEXT[], -- Array of image URLs
    status TEXT DEFAULT 'active', -- 'active', 'sold', 'inactive'
    quality_grade TEXT,
    is_organic BOOLEAN DEFAULT FALSE,
    district TEXT,
    state TEXT,
    -- Fields for processed products
    product_type TEXT,
    source_batch_id TEXT,
    processing_date TIMESTAMPTZ,
    shelf_life_days INTEGER,
    packaging_type TEXT,
    packaging_size_grams NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Offers (Negotiations)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
    farmer_id UUID REFERENCES public.users(id),
    buyer_id UUID REFERENCES public.users(id),
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
    user_id UUID REFERENCES public.users(id),
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
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
    created_by_id UUID REFERENCES public.users(id),
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
    owner_id UUID REFERENCES public.users(id),
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
    farmer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fpo_id, farmer_id)
);

-- 19. QA Requests
CREATE TABLE IF NOT EXISTS public.qa_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id),
    requested_by_user_id UUID REFERENCES public.users(id),
    inspector_id UUID REFERENCES public.users(id),
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
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    qty_kg NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
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

-- Basic Policies (Open for development - tighten these for production!)

-- Users: Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings: Public read, Owner write
CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = owner_id);

-- Cart: Owner only
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders: Farmer or Buyer can view
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = farmer_id OR auth.uid() = buyer_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Schemes: Public read
CREATE POLICY "Schemes are viewable by everyone" ON public.schemes FOR SELECT USING (true);

-- Seed Data for Schemes
INSERT INTO public.schemes (name, name_hi, description, description_hi, eligibility, benefits, crops, states, application_url)
VALUES 
('PM-KISAN', 'पीएम-किसान', 'Income support of Rs 6000 per year', 'प्रति वर्ष 6000 रुपये की आय सहायता', ARRAY['Small farmers', 'Marginal farmers'], ARRAY['Rs 6000/year'], ARRAY['All'], ARRAY['All'], 'https://pmkisan.gov.in'),
('Millet Mission', 'मिलेट मिशन', 'Support for millet cultivation', 'बाजरा की खेती के लिए सहायता', ARRAY['Millet farmers'], ARRAY['Seed subsidy', 'Training'], ARRAY['Millets'], ARRAY['Karnataka', 'Odisha'], 'https://nfsm.gov.in');
