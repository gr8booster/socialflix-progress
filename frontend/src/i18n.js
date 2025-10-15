import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navbar
      home: "Home",
      forYou: "For You",
      viral: "Viral",
      myFeed: "My Feed",
      myProfile: "My Profile",
      analytics: "Analytics",
      signIn: "Sign in",
      logout: "Logout",
      profile: "Profile",
      searchPlaceholder: "Search posts...",
      
      // Hero
      watchNow: "Watch Now",
      moreInfo: "More Info",
      
      // Posts
      likes: "Likes",
      comments: "Comments",
      shares: "Shares",
      save: "Save",
      
      // Recommendations
      trendingNow: "Trending Now",
      trendingTopics: "Trending Topics",
      mostEngagingPosts: "Most Engaging Posts",
      popularContent: "Popular content across all platforms",
      
      // Analytics
      analyticsDashboard: "Analytics Dashboard",
      platformPerformance: "Platform performance and engagement metrics",
      totalPosts: "Total Posts",
      totalLikes: "Total Likes",
      totalComments: "Total Comments",
      videos: "Videos",
      
      // Filters
      filters: "Filters",
      advancedFilters: "Advanced Filters",
      platforms: "Platforms",
      categories: "Categories",
      timeRange: "Time Range",
      sortBy: "Sort By",
      applyFilters: "Apply Filters",
      clearAll: "Clear All",
      saveFilter: "Save Filter",
      
      // Time ranges
      allTime: "All Time",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month",
      
      // Categories
      viralCat: "Viral",
      trendingCat: "Trending",
      mostLiked: "Most Liked",
      
      // Profile
      editProfile: "Edit Profile",
      savedPosts: "Saved Posts",
      favoritePlatforms: "Favorite Platforms",
      activity: "Activity",
      noSavedPosts: "No saved posts yet",
      
      // Share
      shareToTwitter: "Share to Twitter",
      shareToFacebook: "Share to Facebook",
      copyLink: "Copy Link",
      shareViaEmail: "Share via Email",
      
      // Common
      loading: "Loading...",
      loadingMore: "Loading more posts...",
      noResults: "No results found",
      tryAgain: "Try Again",
    }
  },
  es: {
    translation: {
      home: "Inicio",
      forYou: "Para Ti",
      viral: "Viral",
      myFeed: "Mi Feed",
      myProfile: "Mi Perfil",
      analytics: "Analíticas",
      signIn: "Iniciar Sesión",
      logout: "Cerrar Sesión",
      profile: "Perfil",
      searchPlaceholder: "Buscar publicaciones...",
      watchNow: "Ver Ahora",
      moreInfo: "Más Info",
      likes: "Me Gusta",
      comments: "Comentarios",
      shares: "Compartir",
      save: "Guardar",
      trendingNow: "Tendencias Ahora",
      trendingTopics: "Temas Populares",
      mostEngagingPosts: "Publicaciones Más Populares",
      popularContent: "Contenido popular de todas las plataformas",
      analyticsDashboard: "Panel de Analíticas",
      platformPerformance: "Rendimiento de plataformas y métricas",
      totalPosts: "Total de Publicaciones",
      totalLikes: "Total Me Gusta",
      totalComments: "Total Comentarios",
      videos: "Videos",
      filters: "Filtros",
      advancedFilters: "Filtros Avanzados",
      platforms: "Plataformas",
      categories: "Categorías",
      timeRange: "Rango de Tiempo",
      sortBy: "Ordenar Por",
      applyFilters: "Aplicar Filtros",
      clearAll: "Limpiar Todo",
      saveFilter: "Guardar Filtro",
      loading: "Cargando...",
      loadingMore: "Cargando más publicaciones...",
      noResults: "No se encontraron resultados",
    }
  },
  fr: {
    translation: {
      home: "Accueil",
      forYou: "Pour Vous",
      viral: "Viral",
      myFeed: "Mon Fil",
      myProfile: "Mon Profil",
      analytics: "Analytique",
      signIn: "Se Connecter",
      logout: "Déconnexion",
      searchPlaceholder: "Rechercher des publications...",
      watchNow: "Regarder Maintenant",
      likes: "J'aime",
      comments: "Commentaires",
      shares: "Partages",
      save: "Sauvegarder",
      trendingNow: "Tendances Actuelles",
      filters: "Filtres",
      loading: "Chargement...",
    }
  },
  de: {
    translation: {
      home: "Startseite",
      forYou: "Für Dich",
      viral: "Viral",
      myFeed: "Mein Feed",
      myProfile: "Mein Profil",
      analytics: "Analytik",
      signIn: "Anmelden",
      logout: "Abmelden",
      searchPlaceholder: "Beiträge suchen...",
      watchNow: "Jetzt Ansehen",
      likes: "Gefällt mir",
      comments: "Kommentare",
      shares: "Teilen",
      save: "Speichern",
      trendingNow: "Jetzt im Trend",
      filters: "Filter",
      loading: "Wird geladen...",
    }
  },
  pt: {
    translation: {
      home: "Início",
      forYou: "Para Você",
      viral: "Viral",
      myFeed: "Meu Feed",
      myProfile: "Meu Perfil",
      analytics: "Analítica",
      signIn: "Entrar",
      logout: "Sair",
      searchPlaceholder: "Pesquisar publicações...",
      watchNow: "Assistir Agora",
      likes: "Curtidas",
      comments: "Comentários",
      shares: "Compartilhar",
      save: "Salvar",
      trendingNow: "Tendências Agora",
      filters: "Filtros",
      loading: "Carregando...",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
