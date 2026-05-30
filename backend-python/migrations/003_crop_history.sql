-- ============================================================
-- Crop History Tables for Farmer Dashboard
-- Tracks complete lifecycle of Millets & Pulses crops
-- ============================================================

-- 1. Crop Cycles (Main Table)
CREATE TABLE IF NOT EXISTS public.crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic Info
    crop_type TEXT NOT NULL, -- 'millets' or 'pulses'
    crop TEXT NOT NULL, -- specific crop (finger_millet, pearl_millet, toor_dal, etc.)
    variety TEXT,
    season TEXT NOT NULL, -- 'kharif', 'rabi', 'summer'
    year INTEGER NOT NULL,
    plot_name TEXT, -- optional field/plot identifier
    area_acres NUMERIC, -- area in acres
    
    -- Status & Summary
    status TEXT DEFAULT 'active', -- 'active', 'harvested', 'completed', 'cancelled'
    total_input_cost NUMERIC DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    total_yield_kg NUMERIC DEFAULT 0,
    
    -- Timestamps
    sowing_date DATE,
    harvest_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seed Entries
CREATE TABLE IF NOT EXISTS public.crop_seeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE NOT NULL,
    
    seed_name TEXT NOT NULL,
    variety TEXT,
    quantity_kg NUMERIC NOT NULL,
    cost_per_kg NUMERIC,
    total_cost NUMERIC,
    supplier TEXT,
    sowing_date DATE,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fertilizers & Inputs
CREATE TABLE IF NOT EXISTS public.crop_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE NOT NULL,
    
    input_type TEXT NOT NULL, -- 'fertilizer', 'pesticide', 'herbicide', 'other'
    input_name TEXT NOT NULL,
    is_organic BOOLEAN DEFAULT FALSE,
    quantity TEXT, -- e.g., '50 kg', '2 L'
    cost NUMERIC,
    application_date DATE,
    purpose TEXT, -- 'basal_dose', 'top_dressing', 'pest_control', 'weed_control', etc.
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Farm Activities/Operations
CREATE TABLE IF NOT EXISTS public.crop_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE NOT NULL,
    
    activity_type TEXT NOT NULL, -- 'land_preparation', 'sowing', 'irrigation', 'weeding', 'pest_control', 'harvest', 'other'
    activity_name TEXT NOT NULL,
    activity_date DATE NOT NULL,
    cost NUMERIC DEFAULT 0,
    labor_hours NUMERIC,
    labor_cost NUMERIC,
    description TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Harvest Records
CREATE TABLE IF NOT EXISTS public.crop_harvests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE NOT NULL,
    
    harvest_date DATE NOT NULL,
    yield_kg NUMERIC NOT NULL,
    quality_grade TEXT, -- 'premium', 'standard', 'economy'
    moisture_level TEXT, -- 'dry', 'medium', 'moist'
    harvest_cost NUMERIC DEFAULT 0,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crop-to-Listing Link (connects crop cycle to marketplace listings)
CREATE TABLE IF NOT EXISTS public.crop_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    quantity_kg NUMERIC NOT NULL, -- quantity from this crop cycle used in listing
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crop_cycle_id, listing_id)
);

-- 7. Crop Sales Records (denormalized for easy access)
CREATE TABLE IF NOT EXISTS public.crop_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    
    buyer_name TEXT,
    buyer_type TEXT, -- 'processor', 'trader', 'fpo', 'shg', 'retail'
    quantity_kg NUMERIC NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    sale_date DATE NOT NULL,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for development)
CREATE POLICY "Crop Cycles: Allow all" ON public.crop_cycles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Crop Seeds: Allow all" ON public.crop_seeds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Crop Inputs: Allow all" ON public.crop_inputs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Crop Activities: Allow all" ON public.crop_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Crop Harvests: Allow all" ON public.crop_harvests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Crop Listings: Allow all" ON public.crop_listings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Crop Sales: Allow all" ON public.crop_sales FOR ALL USING (true) WITH CHECK (true);

-- Function to update crop cycle totals
CREATE OR REPLACE FUNCTION update_crop_cycle_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_input_cost
    UPDATE public.crop_cycles SET 
        total_input_cost = (
            COALESCE((SELECT SUM(total_cost) FROM public.crop_seeds WHERE crop_cycle_id = NEW.crop_cycle_id), 0) +
            COALESCE((SELECT SUM(cost) FROM public.crop_inputs WHERE crop_cycle_id = NEW.crop_cycle_id), 0) +
            COALESCE((SELECT SUM(cost + COALESCE(labor_cost, 0)) FROM public.crop_activities WHERE crop_cycle_id = NEW.crop_cycle_id), 0) +
            COALESCE((SELECT SUM(harvest_cost) FROM public.crop_harvests WHERE crop_cycle_id = NEW.crop_cycle_id), 0)
        ),
        total_yield_kg = COALESCE((SELECT SUM(yield_kg) FROM public.crop_harvests WHERE crop_cycle_id = NEW.crop_cycle_id), 0),
        total_revenue = COALESCE((SELECT SUM(total_amount) FROM public.crop_sales WHERE crop_cycle_id = NEW.crop_cycle_id), 0),
        updated_at = NOW()
    WHERE id = NEW.crop_cycle_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating totals
DROP TRIGGER IF EXISTS trigger_update_totals_seeds ON public.crop_seeds;
CREATE TRIGGER trigger_update_totals_seeds
    AFTER INSERT OR UPDATE OR DELETE ON public.crop_seeds
    FOR EACH ROW EXECUTE FUNCTION update_crop_cycle_totals();

DROP TRIGGER IF EXISTS trigger_update_totals_inputs ON public.crop_inputs;
CREATE TRIGGER trigger_update_totals_inputs
    AFTER INSERT OR UPDATE OR DELETE ON public.crop_inputs
    FOR EACH ROW EXECUTE FUNCTION update_crop_cycle_totals();

DROP TRIGGER IF EXISTS trigger_update_totals_activities ON public.crop_activities;
CREATE TRIGGER trigger_update_totals_activities
    AFTER INSERT OR UPDATE OR DELETE ON public.crop_activities
    FOR EACH ROW EXECUTE FUNCTION update_crop_cycle_totals();

DROP TRIGGER IF EXISTS trigger_update_totals_harvests ON public.crop_harvests;
CREATE TRIGGER trigger_update_totals_harvests
    AFTER INSERT OR UPDATE OR DELETE ON public.crop_harvests
    FOR EACH ROW EXECUTE FUNCTION update_crop_cycle_totals();

DROP TRIGGER IF EXISTS trigger_update_totals_sales ON public.crop_sales;
CREATE TRIGGER trigger_update_totals_sales
    AFTER INSERT OR UPDATE OR DELETE ON public.crop_sales
    FOR EACH ROW EXECUTE FUNCTION update_crop_cycle_totals();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crop_cycles_farmer ON public.crop_cycles(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_status ON public.crop_cycles(status);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_year ON public.crop_cycles(year);
CREATE INDEX IF NOT EXISTS idx_crop_seeds_cycle ON public.crop_seeds(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_crop_inputs_cycle ON public.crop_inputs(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_crop_activities_cycle ON public.crop_activities(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_crop_harvests_cycle ON public.crop_harvests(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_crop_sales_cycle ON public.crop_sales(crop_cycle_id);
