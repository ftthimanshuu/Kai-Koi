import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Film,
  Sparkles,
  Utensils,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface MovieSummary {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  runtimeMin: number;
  certificate: string;
  genres: string[];
  languages: string[];
  formats: string[];
  posterUrl: string;
  nextSession: string;
  venue: string;
}

interface ShowSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  performers: string[];
  durationMin: number;
  minAge: number;
  posterUrl: string;
  nextSession: string;
  venue: string;
}

interface RestaurantInfo {
  name: string;
  tagline: string;
  description: string;
  openingHours: string;
  slotDurationMin: number;
  photoUrls: string[];
  todayAvailableSlots: string[];
}

export function HomePage() {
  // Fetch Now Showing Movies
  const { data: movies, isLoading: moviesLoading } = useQuery({
    queryKey: ['movies-now-showing'],
    queryFn: async () => {
      const res = await apiClient.get<MovieSummary[]>('/movies');
      return res.data;
    },
  });

  // Fetch Live Shows
  const { data: shows, isLoading: showsLoading } = useQuery({
    queryKey: ['shows-upcoming'],
    queryFn: async () => {
      const res = await apiClient.get<ShowSummary[]>('/shows');
      return res.data;
    },
  });

  // Fetch Restaurant Info
  const { data: restaurant } = useQuery({
    queryKey: ['restaurant-info'],
    queryFn: async () => {
      const res = await apiClient.get<RestaurantInfo>('/restaurant');
      return res.data;
    },
  });

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden border border-border/60 bg-gradient-to-b from-card/90 via-card/50 to-background p-8 sm:p-14 text-center sm:text-left shadow-sm">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Phase F1: Unified Entertainment Portal</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
              Cinema. Live Shows. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                Rooftop Dining.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Kai Koi is a single destination housing IMAX screens, live performance auditoriums, and gourmet dining tables under one seamless booking engine.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md hover:from-indigo-600 hover:to-indigo-700">
                <Link to="/movies" className="gap-2">
                  <Film className="h-4 w-4" />
                  Book Movie Seats
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/shows">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Explore Live Shows
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="gap-2 text-muted-foreground hover:text-foreground">
                <Link to="/restaurant">
                  <Utensils className="h-4 w-4 text-rose-500" />
                  Reserve a Table
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Now Showing Movies Section (SPECIFICATION.md §5.2 FR-BROWSE-1 & FR-BROWSE-2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-end justify-between border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Film className="h-4 w-4" />
              <span>Cinema Screens</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Now Showing</h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Link to="/movies">
              View All Screenings
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {moviesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies?.map((movie) => (
              <Card
                key={movie.id}
                className="group border-border/60 bg-card/60 backdrop-blur-md overflow-hidden hover:border-indigo-500/40 transition-all duration-200 flex flex-col"
              >
                {/* Poster Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                      {movie.certificate}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-md text-[11px] font-semibold text-white">
                      {movie.formats[0]}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3 text-indigo-400" />
                      {movie.runtimeMin} mins
                    </span>
                    <span className="font-mono">{movie.nextSession}</span>
                  </div>
                </div>

                <CardHeader className="p-5 pb-2">
                  <div className="text-xs text-muted-foreground font-medium mb-1">
                    {movie.genres.join(' • ')}
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {movie.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-1">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {movie.synopsis}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
                    <span>{movie.venue}</span>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t border-border/30 mt-auto">
                  <Button asChild size="sm" className="w-full bg-indigo-600/90 hover:bg-indigo-600 text-white gap-1.5">
                    <Link to={`/movies/${movie.slug}`}>
                      Select Seats
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 3. Live Shows & Performances Section (SPECIFICATION.md §5.2 FR-BROWSE-4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-end justify-between border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Live Auditorium</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Upcoming Shows & Comedy</h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Link to="/shows">
              All Performances
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {showsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shows?.map((show) => (
              <Card
                key={show.id}
                className="group border-border/60 bg-card/60 backdrop-blur-md overflow-hidden hover:border-amber-500/40 transition-all duration-200 flex flex-col sm:flex-row"
              >
                <div className="relative sm:w-2/5 aspect-[4/3] sm:aspect-auto overflow-hidden bg-muted">
                  <img
                    src={show.posterUrl}
                    alt={show.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-[11px] font-bold text-slate-900">
                      {show.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-amber-500 font-semibold mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{show.nextSession}</span>
                    </div>
                    <CardTitle className="text-base sm:text-lg font-bold group-hover:text-amber-400 transition-colors">
                      {show.title}
                    </CardTitle>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {show.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border/30">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Performer: <strong className="text-foreground">{show.performers.join(', ')}</strong></span>
                      <span>Age: {show.minAge}+</span>
                    </div>
                    <Button asChild size="sm" variant="outline" className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                      <Link to={`/shows/${show.slug}`} className="gap-1.5 justify-center">
                        Book Tickets
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 4. Kai Koi Dining & Rooftop Section (SPECIFICATION.md §5.2 FR-BROWSE-5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden border border-rose-500/20 bg-gradient-to-r from-card via-card/80 to-background p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
                <Utensils className="h-4 w-4" />
                <span>Rooftop Table Reservations</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {restaurant?.name || 'Koi Dining & Rooftop Bar'}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {restaurant?.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Hours</span>
                  <p className="font-medium text-foreground mt-0.5">{restaurant?.openingHours}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Dining Slot</span>
                  <p className="font-medium text-foreground mt-0.5">{restaurant?.slotDurationMin} Mins Table Experience</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
                  <Link to="/restaurant">
                    <Calendar className="h-4 w-4" />
                    Reserve Dining Slot
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">
                  Fixed deposit adjusted against final bill at venue.
                </span>
              </div>
            </div>

            {/* Photo Showcase */}
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                <img
                  src={restaurant?.photoUrls[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
                  alt="Restaurant ambience"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                <img
                  src={restaurant?.photoUrls[1] || 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600'}
                  alt="Bar lounge"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
