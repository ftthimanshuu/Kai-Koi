import { http, HttpResponse } from 'msw';

/**
 * Mock Service Worker Request Handlers
 * Built against SPECIFICATION.md §10 (REST API endpoints).
 */
export const handlers = [
  // Health Check
  http.get('/api/v1/health', () => {
    return HttpResponse.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'kaikoi-mock-api',
    });
  }),

  // Customer Account Sync (POST /api/v1/me/sync) - SPECIFICATION.md §10.1
  http.post('/api/v1/me/sync', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    return HttpResponse.json({
      id: 'usr_01jk98a7bcde',
      firebaseUid: 'fb_demo_uid_123',
      email: 'customer@kaikoi.com',
      fullName: 'Aarav Mehta',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      emailVerified: true,
      enabled: true,
      hasAuthToken: Boolean(authHeader),
    });
  }),

  // Customer Profile (GET /api/v1/me) - SPECIFICATION.md §10.1
  http.get('/api/v1/me', () => {
    return HttpResponse.json({
      id: 'usr_01jk98a7bcde',
      fullName: 'Aarav Mehta',
      phone: '+91 98765 43210',
      email: 'customer@kaikoi.com',
      role: 'CUSTOMER',
    });
  }),

  // Movie Catalog (GET /api/v1/movies) - SPECIFICATION.md §10.1
  http.get('/api/v1/movies', () => {
    return HttpResponse.json([
      {
        id: 'mov_01',
        slug: 'dune-part-three',
        title: 'Dune: Part Three',
        synopsis: 'Paul Atreides continues his mythic journey as the forces of the known universe gather on Arrakis.',
        runtimeMin: 165,
        certificate: 'UA',
        genres: ['Sci-Fi', 'Adventure'],
        languages: ['English', 'Hindi'],
        formats: ['IMAX 4K', '2D Laser'],
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop',
        status: 'NOW_SHOWING',
        nextSession: 'Today, 18:30',
        venue: 'Screen 1 (Laser)',
      },
      {
        id: 'mov_02',
        slug: 'interstellar',
        title: 'Interstellar: 10th Anniversary',
        synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
        runtimeMin: 169,
        certificate: 'UA',
        genres: ['Sci-Fi', 'Drama'],
        languages: ['English'],
        formats: ['IMAX 70mm', '2D'],
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop',
        status: 'NOW_SHOWING',
        nextSession: 'Today, 21:15',
        venue: 'Screen 2 (IMAX)',
      },
      {
        id: 'mov_03',
        slug: 'spirited-away',
        title: 'Spirited Away (Studio Ghibli Classics)',
        synopsis: 'During her family move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods.',
        runtimeMin: 125,
        certificate: 'U',
        genres: ['Animation', 'Fantasy'],
        languages: ['Japanese (Sub)', 'English'],
        formats: ['2D Laser'],
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop',
        status: 'NOW_SHOWING',
        nextSession: 'Tomorrow, 15:00',
        venue: 'Screen 3 (Cosy)',
      },
    ]);
  }),

  // Shows Catalog (GET /api/v1/shows) - SPECIFICATION.md §10.1
  http.get('/api/v1/shows', () => {
    return HttpResponse.json([
      {
        id: 'shw_01',
        slug: 'vir-das-mind-fool',
        title: 'Vir Das: Mind Fool World Tour',
        description: 'International Emmy-winning standup comedian Vir Das brings his signature razor-sharp wit to Kai Koi Grand Hall.',
        category: 'COMEDY',
        performers: ['Vir Das'],
        durationMin: 90,
        minAge: 18,
        posterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop',
        status: 'UPCOMING',
        nextSession: 'Friday, 20:00',
        venue: 'Grand Hall Auditorium',
      },
      {
        id: 'shw_02',
        slug: 'symphony-under-the-stars',
        title: 'Acoustic Strings & Film Scores',
        description: 'A 14-piece chamber orchestra performing Hans Zimmer and John Williams cinematic masterpieces live.',
        category: 'MUSIC',
        performers: ['Bombay String Ensemble'],
        durationMin: 105,
        minAge: 8,
        posterUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop',
        status: 'UPCOMING',
        nextSession: 'Sunday, 19:00',
        venue: 'Grand Hall Auditorium',
      },
    ]);
  }),

  // Restaurant Overview (GET /api/v1/restaurant) - SPECIFICATION.md §10.1
  http.get('/api/v1/restaurant', () => {
    return HttpResponse.json({
      name: 'Koi Dining & Rooftop Bar',
      tagline: 'Modern Pan-Asian Cuisine & Craft Cocktails',
      description: 'Perched atop the Kai Koi entertainment complex, enjoy artisanal robata grills, sushi bars, and panoramic city views before or after your show.',
      openingHours: '12:00 PM – 11:30 PM (Daily)',
      slotDurationMin: 90,
      photoUrls: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop',
      ],
      tableTiers: [
        { code: 'STANDARD', name: 'Standard Dining (Indoor)', depositPaise: 20000 },
        { code: 'WINDOW', name: 'Skyline Window (View)', depositPaise: 35000 },
        { code: 'ROOFTOP_VIP', name: 'Terrace Cabana (8-seater)', depositPaise: 50000 },
      ],
      todayAvailableSlots: ['12:30 PM', '02:00 PM', '07:00 PM', '08:30 PM', '10:00 PM'],
    });
  }),

  // Admin Operations Dashboard (GET /api/v1/admin/dashboard) - SPECIFICATION.md §5.6 & §10.2
  http.get('/api/v1/admin/dashboard', () => {
    return HttpResponse.json({
      todaySessions: 14,
      occupancyRatePercent: 82.5,
      todayBookingsCount: 148,
      todayRevenuePaise: 24500000, // ₹2,45,000.00
      recentBookings: [
        { reference: 'KK-7F3K9Q', vertical: 'CINEMA', unitsCount: 3, totalPaise: 135000, status: 'CONFIRMED' },
        { reference: 'KK-9A2M4L', vertical: 'RESTAURANT', unitsCount: 1, totalPaise: 50000, status: 'CONFIRMED' },
      ],
    });
  }),
];
