-- Seed Mock Listings for Developer Farmer Account
-- Phone: 9876543210 | Full Phone: +919876543210
-- District/State NOT stored in listings - fetched from users table via JOIN
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    farmer_user_id TEXT;
BEGIN
    -- Find the user by phone
    SELECT id INTO farmer_user_id 
    FROM public.users 
    WHERE phone = '+919876543210' 
    LIMIT 1;
    
    -- If no user found, raise an error
    IF farmer_user_id IS NULL THEN
        RAISE EXCEPTION 'Developer farmer not found. Please register with phone +919876543210 first.';
    END IF;
    
    RAISE NOTICE 'Found farmer user ID: %', farmer_user_id;
    
    -- Delete existing listings for this farmer (for clean re-runs)
    DELETE FROM public.listings WHERE owner_id = farmer_user_id;
    
    -- Insert 10 Millet Listings (NO district/state - these come from users table)
    
    -- 1. Finger Millet (Ragi) - Premium Quality
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'finger_millet', 'GPU-28',
        'Fresh harvest of premium Ragi. Sun-dried for 7 days. Perfect for flour and malt preparation.',
        500, 3800,
        ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
        'active', 'week', 'natural', 'machine-cleaned', 'uniform', 'dried', 'no'
    );
    
    -- 2. Foxtail Millet (Navane) - Standard Quality
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'foxtail_millet', 'SiA-3156',
        'Organic foxtail millet grown without any chemicals. Great for making upma, kheer and rice alternatives.',
        300, 4200,
        ARRAY['https://images.unsplash.com/photo-1574323347407-f5e1c6e0f3bb?w=400'],
        'active', 'today', 'natural', 'hand-cleaned', 'uniform', 'dried', 'no'
    );
    
    -- 3. Pearl Millet (Bajra) - Economy Quality
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'pearl_millet', 'HHB-67',
        'Fresh Bajra ideal for rotis and traditional dishes. Good nutritional value.',
        800, 2400,
        ARRAY['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400'],
        'active', 'fortnight', 'mixed', 'uncleaned', 'mixed', 'moist', 'yes'
    );
    
    -- 4. Barnyard Millet (Sanwa) - Premium
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'barnyard_millet', 'VL-29',
        'High-fiber Sanwa millet, perfect for diabetic-friendly meals.',
        200, 4500,
        ARRAY['https://images.unsplash.com/photo-1547050605-2f268cd5dfc9?w=400'],
        'active', 'week', 'natural', 'machine-cleaned', 'uniform', 'dried', 'no'
    );
    
    -- 5. Little Millet (Samai) - Standard
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'little_millet', 'CO-4',
        'Traditional Samai. Low glycemic index, great for weight management.',
        350, 3600,
        ARRAY['https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400'],
        'active', 'today', 'mixed', 'hand-cleaned', 'uniform', 'dried', 'no'
    );
    
    -- 6. Kodo Millet (Varagu) - Premium
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'kodo_millet', 'GPUK-3',
        'Premium Kodo millet, traditionally grown. Rich in antioxidants and perfect for rice replacement.',
        250, 4000,
        ARRAY['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400'],
        'active', 'week', 'natural', 'machine-cleaned', 'uniform', 'dried', 'no'
    );
    
    -- 7. Proso Millet (Chena) - Standard
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'proso_millet', 'TNAU-151',
        'White Proso millet from dryland farming. Excellent for pongal and sweet dishes.',
        400, 3400,
        ARRAY['https://images.unsplash.com/photo-1559813114-cad82d6a1a6d?w=400'],
        'active', 'fortnight', 'mixed', 'hand-cleaned', 'mixed', 'dried', 'no'
    );
    
    -- 8. Sorghum (Jowar) - Premium Bulk
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'sorghum', 'CSH-16',
        'White Jowar, bulk quantity available. Traditional variety, great for rotis and bhakri.',
        1000, 2800,
        ARRAY['https://images.unsplash.com/photo-1593113630400-ea4288922497?w=400'],
        'active', 'today', 'natural', 'machine-cleaned', 'uniform', 'dried', 'no'
    );
    
    -- 9. Browntop Millet (Korle) - Rare
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'browntop_millet', 'Native',
        'Rare Browntop millet from tribal farmers. Ancient grain with high protein content. Limited stock.',
        100, 5500,
        ARRAY['https://images.unsplash.com/photo-1502741126161-b048400d085d?w=400'],
        'active', 'week', 'natural', 'hand-cleaned', 'uniform', 'dried', 'no'
    );
    
    -- 10. Finger Millet (Ragi) - Large Bulk Order
    INSERT INTO public.listings (
        owner_id, owner_type, crop_type, crop, variety, description, qty_kg, min_price_per_qtl,
        photos, status, harvest_date, crop_inputs, cleanliness, uniformity, drying_status, damaged_grains
    ) VALUES (
        farmer_user_id, 'farmer', 'millets', 'finger_millet', 'MR-6',
        'Bulk Ragi available for processors and exporters. Suitable for malt, flour, and ready-to-eat products.',
        2000, 3500,
        ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
        'active', 'fortnight', 'chemical', 'machine-cleaned', 'uniform', 'dried', 'no'
    );
    
    RAISE NOTICE '✅ Successfully inserted 10 millet listings for farmer ID: %', farmer_user_id;
END $$;

-- Verify the insertions with farmer details from JOIN
SELECT 
    l.id, 
    l.crop, 
    l.variety, 
    l.qty_kg, 
    l.min_price_per_qtl, 
    l.quality_grade, 
    l.is_organic, 
    l.status,
    u.name AS farmer_name,
    u.district AS farmer_district,
    fp.state AS farmer_state
FROM public.listings l
JOIN public.users u ON l.owner_id = u.id
LEFT JOIN public.farmer_profiles fp ON u.id = fp.user_id
WHERE u.phone = '+919876543210'
ORDER BY l.created_at DESC;
