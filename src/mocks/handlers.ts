import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005/api/v1';

// Mock data
const mockUser = {
  id: 'user-1',
  phone: '+919876543210',
  name: 'Test Farmer',
  role: 'farmer',
  language: 'en',
  location: 'Bangalore, Karnataka',
  created_at: '2024-01-01T00:00:00Z',
};

const mockListings = [
  {
    id: 'listing-1',
    farmer_id: 'user-1',
    millet_type: 'ragi',
    quantity_kg: 100,
    price_per_kg: 50,
    quality_grade: 'premium',
    location: 'Bangalore, Karnataka',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    photos: [],
    voice_note_url: null,
  },
  {
    id: 'listing-2',
    farmer_id: 'user-1',
    millet_type: 'jowar',
    quantity_kg: 200,
    price_per_kg: 40,
    quality_grade: 'standard',
    location: 'Mysore, Karnataka',
    status: 'active',
    created_at: '2024-01-16T00:00:00Z',
    photos: [],
    voice_note_url: null,
  },
];

const mockOffers = [
  {
    id: 'offer-1',
    listing_id: 'listing-1',
    buyer_id: 'buyer-1',
    offered_price: 55,
    quantity_kg: 50,
    status: 'pending',
    created_at: '2024-01-17T00:00:00Z',
    buyer_name: 'Test Buyer',
  },
];

const mockOrders = [
  {
    id: 'order-1',
    listing_id: 'listing-1',
    offer_id: 'offer-1',
    buyer_id: 'buyer-1',
    farmer_id: 'user-1',
    quantity_kg: 50,
    total_price: 2750,
    status: 'confirmed',
    pickup_date: '2024-01-20',
    created_at: '2024-01-18T00:00:00Z',
  },
];

const mockBatches = [
  {
    id: 'batch-1',
    fpo_id: 'fpo-1',
    qr_code: 'QR-2024-001',
    millet_type: 'ragi',
    total_quantity_kg: 500,
    farmer_count: 5,
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
  },
];

const mockWeather = {
  location: 'Bangalore',
  temperature: 28,
  humidity: 65,
  condition: 'Partly Cloudy',
  forecast: [
    { date: '2024-01-20', high: 30, low: 18, condition: 'Sunny' },
    { date: '2024-01-21', high: 29, low: 19, condition: 'Cloudy' },
    { date: '2024-01-22', high: 27, low: 17, condition: 'Rain' },
  ],
  advisory: 'Good conditions for harvesting millets.',
};

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/request-otp`, async ({ request }) => {
    const body = await request.json() as { phone: string };
    return HttpResponse.json({
      message: `OTP sent to ${body.phone}`,
      expires_in: 300,
    });
  }),

  http.post(`${API_URL}/auth/verify-otp`, async ({ request }) => {
    const body = await request.json() as { phone: string; otp: string };
    if (body.otp === '123456') {
      return HttpResponse.json({
        access_token: 'mock-token-123',
        token_type: 'bearer',
        user: mockUser,
      });
    }
    return HttpResponse.json(
      { detail: 'Invalid OTP' },
      { status: 401 }
    );
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  // Listings endpoints
  http.get(`${API_URL}/listings`, ({ request }) => {
    const url = new URL(request.url);
    const milletType = url.searchParams.get('millet_type');
    
    let listings = mockListings;
    if (milletType) {
      listings = mockListings.filter(l => l.millet_type === milletType);
    }
    
    return HttpResponse.json({
      items: listings,
      total: listings.length,
      page: 1,
      size: 20,
    });
  }),

  http.get(`${API_URL}/listings/:id`, ({ params }) => {
    const listing = mockListings.find(l => l.id === params.id);
    if (listing) {
      return HttpResponse.json(listing);
    }
    return HttpResponse.json(
      { detail: 'Listing not found' },
      { status: 404 }
    );
  }),

  http.post(`${API_URL}/listings`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newListing = {
      id: `listing-${Date.now()}`,
      farmer_id: 'user-1',
      ...body,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json(newListing, { status: 201 });
  }),

  http.get(`${API_URL}/listings/my`, () => {
    return HttpResponse.json({
      items: mockListings.filter(l => l.farmer_id === 'user-1'),
      total: 2,
      page: 1,
      size: 20,
    });
  }),

  // Offers endpoints
  http.get(`${API_URL}/offers/my`, () => {
    return HttpResponse.json({
      items: mockOffers,
      total: mockOffers.length,
      page: 1,
      size: 20,
    });
  }),

  http.post(`${API_URL}/offers`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newOffer = {
      id: `offer-${Date.now()}`,
      buyer_id: 'user-1',
      ...body,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json(newOffer, { status: 201 });
  }),

  http.put(`${API_URL}/offers/:id/accept`, ({ params }) => {
    const offer = mockOffers.find(o => o.id === params.id);
    if (offer) {
      return HttpResponse.json({ ...offer, status: 'accepted' });
    }
    return HttpResponse.json(
      { detail: 'Offer not found' },
      { status: 404 }
    );
  }),

  http.put(`${API_URL}/offers/:id/reject`, ({ params }) => {
    const offer = mockOffers.find(o => o.id === params.id);
    if (offer) {
      return HttpResponse.json({ ...offer, status: 'rejected' });
    }
    return HttpResponse.json(
      { detail: 'Offer not found' },
      { status: 404 }
    );
  }),

  // Orders endpoints
  http.get(`${API_URL}/orders/my`, () => {
    return HttpResponse.json({
      items: mockOrders,
      total: mockOrders.length,
      page: 1,
      size: 20,
    });
  }),

  // Batches endpoints
  http.get(`${API_URL}/batches`, () => {
    return HttpResponse.json({
      items: mockBatches,
      total: mockBatches.length,
      page: 1,
      size: 20,
    });
  }),

  http.post(`${API_URL}/batches`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newBatch = {
      id: `batch-${Date.now()}`,
      fpo_id: 'user-1',
      qr_code: `QR-${Date.now()}`,
      ...body,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json(newBatch, { status: 201 });
  }),

  // Trace endpoint
  http.get(`${API_URL}/trace/:code`, ({ params }) => {
    return HttpResponse.json({
      batch: mockBatches[0],
      events: [
        {
          type: 'harvested',
          timestamp: '2024-01-10T08:00:00Z',
          location: 'Farm, Karnataka',
          actor: 'Farmer',
          details: 'Organic ragi harvested',
        },
        {
          type: 'collected',
          timestamp: '2024-01-12T10:00:00Z',
          location: 'FPO Center',
          actor: 'FPO',
          details: 'Quality checked and collected',
        },
        {
          type: 'processed',
          timestamp: '2024-01-14T14:00:00Z',
          location: 'Processing Unit',
          actor: 'Processor',
          details: 'Cleaned and packaged',
        },
      ],
      certifications: ['Organic India', 'FSSAI Certified'],
      verified: true,
    });
  }),

  // Weather endpoint
  http.get(`${API_URL}/weather`, () => {
    return HttpResponse.json(mockWeather);
  }),

  // Sync endpoints
  http.post(`${API_URL}/sync/push`, async ({ request }) => {
    const body = await request.json() as { actions: unknown[] };
    return HttpResponse.json({
      processed: body.actions?.length || 0,
      failed: 0,
      results: [],
    });
  }),

  http.get(`${API_URL}/sync/pull`, () => {
    return HttpResponse.json({
      listings: mockListings,
      offers: mockOffers,
      orders: mockOrders,
      last_sync: new Date().toISOString(),
    });
  }),

  // Admin endpoints
  http.get(`${API_URL}/admin/stats`, () => {
    return HttpResponse.json({
      total_farmers: 1250,
      total_buyers: 340,
      total_listings: 3500,
      total_transactions: 8900,
      total_volume_kg: 450000,
      active_fpos: 45,
    });
  }),

  http.post(`${API_URL}/admin/advisory`, async ({ request }) => {
    const body = await request.json() as { message: string; target: string };
    return HttpResponse.json({
      id: `advisory-${Date.now()}`,
      ...body,
      sent_at: new Date().toISOString(),
      recipients: 1250,
    });
  }),
];
