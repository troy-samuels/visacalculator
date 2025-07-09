"use client"

import { useState, useEffect } from "react"

// Translation keys and values for the Schengen Travel Assistant
export const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.dashboard": "Dashboard",
    "nav.back": "Back to Home",
    
    // Hero Section
    "hero.title": "Plan Smarter.\nTravel Easier.",
    "hero.subtitle": "Know Where You Can Go — Instantly See Visa Rules, Book Trips, and Travel Confidently.",
    
    // Quick Destination Checker
    "quick.title": "Where Can You Travel?",
    "quick.subtitle": "Discover all visa-free destinations available to your passport instantly",
    "quick.button": "Check Your Travel Options →",
    "quick.features": "Free • No registration required • Instant results",
    
    // Destination Checker
    "dest.title": "Discover Your Travel Possibilities",
    "dest.subtitle": "Select your nationality to see all the amazing destinations you can visit visa-free in the Schengen Area",
    "dest.select": "Select Your Nationality",
    "dest.choose": "Choose your passport country to see available destinations",
    "dest.placeholder": "🌍 Select your country",
    "dest.loading": "Finding your travel destinations...",
    "dest.results": "Great News! {flag} {country} passport holders can visit",
    "dest.countries": "{count} Schengen Countries Visa-Free",
    "dest.period": "Up to 90 days within any 180-day period",
    "dest.search": "Search destinations...",
    "dest.cities": "Popular Cities",
    "dest.flights": "Flights",
    "dest.hotels": "Hotels",
    
    // Call to Action
    "cta.title": "Ready to Plan Your Perfect European Adventure?",
    "cta.subtitle": "Use our advanced Schengen calculator to plan multiple trips and stay compliant with the 90/180 day rule",
    "cta.plan": "Plan Your Trips",
    "cta.save": "Save Your Results",
    
    // How It Works
    "how.title": "How It Works",
    "how.step1": "Select Nationality",
    "how.step1.desc": "Choose your passport country",
    "how.step2": "View Destinations", 
    "how.step2.desc": "See all visa-free countries",
    "how.step3": "Start Planning",
    "how.step3.desc": "Book flights and accommodation",
    
    // Calculator
    "calc.country": "Country",
    "calc.dates": "Date Range",
    "calc.days": "Days of Stay",
    "calc.last180": "Days of Stay in the last 180 days",
    "calc.remaining": "Days Remaining",
    "calc.add": "Add Another Trip",
    "calc.total": "Total Days in Last 180 Days: {used} / 90",
    "calc.available": "Days Remaining: {remaining}",
    
    // Alerts
    "alert.compliance": "Compliance Alert: You have exceeded the 90-day limit in the past 180 days. Current usage: {days} out of 90 days allowed.",
    "alert.next": "Next Entry Available: {date} ({days} days from now) with {available} days available.",
    
    // Common
    "common.save": "Save Progress",
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.try_again": "Try Again",
    "common.close": "Close",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",

    // Travel Quiz
    "quiz.title": "European Travel Personality Quiz",
    "quiz.progress": "Question {current} of {total}",
    "quiz.complete": "{percent}% Complete",
    "quiz.previous": "Previous",
    "quiz.next": "Next", 
    "quiz.results": "See Results",
    
    // Quiz Questions
    "quiz.q1": "What's your ideal European adventure style?",
    "quiz.q1.a": "🏰 Culture & History Explorer",
    "quiz.q1.b": "🍷 Food & Wine Enthusiast", 
    "quiz.q1.c": "🏔️ Outdoor Adventure Seeker",
    "quiz.q1.d": "🎨 Art & Museums Lover",
    "quiz.q1.e": "🌃 City Nightlife Explorer",
    "quiz.q1.f": "🧘‍♀️ Relaxation & Wellness",
    "quiz.q1.g": "📸 Instagram-worthy Destinations",
    
    // Quiz Results
    "quiz.result.title": "You're {personality}!",
    "quiz.email.title": "Get Your Personalized Travel Guide",
    "quiz.email.subtitle": "Receive a detailed destination guide, travel tips, and exclusive deals tailored to your personality type",
    "quiz.email.button": "Get My Guide",
    "quiz.email.success": "Check Your Email!",
    "quiz.email.sent": "Your personalized travel guide is on its way to {email}",
    "quiz.flights": "Find Flights",
    "quiz.hotels": "Book Accommodation",
    "quiz.share": "Share Your Results",
    "quiz.retake": "Retake Quiz",
    "quiz.plan": "Plan Your Trip",
    
    // Home Page Quiz CTA
    "home.quiz.title": "What's Your Travel Personality?",
    "home.quiz.subtitle": "Take our quiz and get personalized European destination recommendations",
    "home.quiz.button": "Discover Your Travel Style →",
    "home.quiz.features": "2 minutes • Personalized results • Share with friends",
  },
  
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.login": "Iniciar Sesión",
    "nav.signup": "Registrarse",
    "nav.dashboard": "Panel",
    "nav.back": "Volver al Inicio",
    
    // Hero Section
    "hero.title": "Planifica Mejor.\nViaja Más Fácil.",
    "hero.subtitle": "Sabe Dónde Puedes Ir — Ve Instantáneamente las Reglas de Visa, Reserva Viajes y Viaja con Confianza.",
    
    // Quick Destination Checker
    "quick.title": "¿A Dónde Puedes Viajar?",
    "quick.subtitle": "Descubre todos los destinos sin visa disponibles para tu pasaporte al instante",
    "quick.button": "Verifica Tus Opciones de Viaje →",
    "quick.features": "Gratis • No requiere registro • Resultados instantáneos",
    
    // Destination Checker
    "dest.title": "Descubre Tus Posibilidades de Viaje",
    "dest.subtitle": "Selecciona tu nacionalidad para ver todos los increíbles destinos que puedes visitar sin visa en el Área Schengen",
    "dest.select": "Selecciona Tu Nacionalidad",
    "dest.choose": "Elige el país de tu pasaporte para ver destinos disponibles",
    "dest.placeholder": "🌍 Selecciona tu país",
    "dest.loading": "Encontrando tus destinos de viaje...",
    "dest.results": "¡Buenas Noticias! Los portadores de pasaporte {flag} {country} pueden visitar",
    "dest.countries": "{count} Países Schengen Sin Visa",
    "dest.period": "Hasta 90 días dentro de cualquier período de 180 días",
    "dest.search": "Buscar destinos...",
    "dest.cities": "Ciudades Populares",
    "dest.flights": "Vuelos",
    "dest.hotels": "Hoteles",
    
    // Call to Action
    "cta.title": "¿Listo para Planificar tu Aventura Europea Perfecta?",
    "cta.subtitle": "Usa nuestra calculadora avanzada Schengen para planificar múltiples viajes y mantenerte en cumplimiento con la regla 90/180",
    "cta.plan": "Planifica Tus Viajes",
    "cta.save": "Guarda Tus Resultados",
    
    // How It Works
    "how.title": "Cómo Funciona",
    "how.step1": "Seleccionar Nacionalidad",
    "how.step1.desc": "Elige el país de tu pasaporte",
    "how.step2": "Ver Destinos",
    "how.step2.desc": "Ve todos los países sin visa",
    "how.step3": "Comenzar a Planificar",
    "how.step3.desc": "Reserva vuelos y alojamiento",
    
    // Calculator
    "calc.country": "País",
    "calc.dates": "Rango de Fechas",
    "calc.days": "Días de Estancia",
    "calc.last180": "Días de Estancia en los últimos 180 días",
    "calc.remaining": "Días Restantes",
    "calc.add": "Agregar Otro Viaje",
    "calc.total": "Días Totales en Últimos 180 Días: {used} / 90",
    "calc.available": "Días Restantes: {remaining}",
    
    // Common
    "common.save": "Guardar Progreso",
    "common.loading": "Cargando...",
    "common.error": "Algo salió mal",
    "common.try_again": "Intentar de Nuevo",
    "common.close": "Cerrar",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",

    // Travel Quiz
    "quiz.title": "Quiz de Personalidad de Viaje Europeo",
    "quiz.progress": "Pregunta {current} de {total}",
    "quiz.complete": "{percent}% Completo",
    "quiz.previous": "Anterior",
    "quiz.next": "Siguiente",
    "quiz.results": "Ver Resultados",

    // Home Page Quiz CTA
    "home.quiz.title": "¿Cuál es Tu Personalidad de Viaje?",
    "home.quiz.subtitle": "Toma nuestro quiz y obtén recomendaciones personalizadas de destinos europeos",
    "home.quiz.button": "Descubre Tu Estilo de Viaje →",
    "home.quiz.features": "2 minutos • Resultados personalizados • Comparte con amigos",
  },
  
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.login": "Connexion",
    "nav.signup": "S'inscrire",
    "nav.dashboard": "Tableau de bord",
    "nav.back": "Retour à l'accueil",
    
    // Hero Section
    "hero.title": "Planifiez Plus Intelligemment.\nVoyagez Plus Facilement.",
    "hero.subtitle": "Sachez Où Vous Pouvez Aller — Voyez Instantanément les Règles de Visa, Réservez des Voyages et Voyagez en Confiance.",
    
    // Quick Destination Checker
    "quick.title": "Où Pouvez-vous Voyager?",
    "quick.subtitle": "Découvrez toutes les destinations sans visa disponibles pour votre passeport instantanément",
    "quick.button": "Vérifiez Vos Options de Voyage →",
    "quick.features": "Gratuit • Aucune inscription requise • Résultats instantanés",
    
    // Destination Checker
    "dest.title": "Découvrez Vos Possibilités de Voyage",
    "dest.subtitle": "Sélectionnez votre nationalité pour voir toutes les destinations incroyables que vous pouvez visiter sans visa dans l'Espace Schengen",
    "dest.select": "Sélectionnez Votre Nationalité",
    "dest.choose": "Choisissez le pays de votre passeport pour voir les destinations disponibles",
    "dest.placeholder": "🌍 Sélectionnez votre pays",
    "dest.loading": "Recherche de vos destinations de voyage...",
    "dest.results": "Bonne Nouvelle! Les détenteurs de passeport {flag} {country} peuvent visiter",
    "dest.countries": "{count} Pays Schengen Sans Visa",
    "dest.period": "Jusqu'à 90 jours dans toute période de 180 jours",
    "dest.search": "Rechercher des destinations...",
    "dest.cities": "Villes Populaires",
    "dest.flights": "Vols",
    "dest.hotels": "Hôtels",
    
    // Call to Action
    "cta.title": "Prêt à Planifier Votre Aventure Européenne Parfaite?",
    "cta.subtitle": "Utilisez notre calculatrice Schengen avancée pour planifier plusieurs voyages et rester conforme à la règle 90/180",
    "cta.plan": "Planifiez Vos Voyages",
    "cta.save": "Sauvegardez Vos Résultats",
    
    // How It Works
    "how.title": "Comment Ça Marche",
    "how.step1": "Sélectionner la Nationalité",
    "how.step1.desc": "Choisissez le pays de votre passeport",
    "how.step2": "Voir les Destinations",
    "how.step2.desc": "Voir tous les pays sans visa",
    "how.step3": "Commencer à Planifier",
    "how.step3.desc": "Réserver des vols et un hébergement",
    
    // Calculator
    "calc.country": "Pays",
    "calc.dates": "Plage de Dates",
    "calc.days": "Jours de Séjour",
    "calc.last180": "Jours de Séjour dans les 180 derniers jours",
    "calc.remaining": "Jours Restants",
    "calc.add": "Ajouter un Autre Voyage",
    "calc.total": "Total des Jours dans les 180 Derniers Jours: {used} / 90",
    "calc.available": "Jours Restants: {remaining}",
    
    // Common
    "common.save": "Sauvegarder les Progrès",
    "common.loading": "Chargement...",
    "common.error": "Quelque chose s'est mal passé",
    "common.try_again": "Réessayer",
    "common.close": "Fermer",
    "common.cancel": "Annuler",
    "common.confirm": "Confirmer",

    // Travel Quiz
    "quiz.title": "Quiz de Personnalité de Voyage Européen",
    "quiz.progress": "Question {current} de {total}",
    "quiz.complete": "{percent}% Terminé",
    "quiz.previous": "Précédent",
    "quiz.next": "Suivant",
    "quiz.results": "Voir les Résultats",

    // Home Page Quiz CTA
    "home.quiz.title": "Quelle est Votre Personnalité de Voyage?",
    "home.quiz.subtitle": "Répondez à notre quiz et obtenez des recommandations personnalisées de destinations européennes",
    "home.quiz.button": "Découvrez Votre Style de Voyage →",
    "home.quiz.features": "2 minutes • Résultats personnalisés • Partagez avec des amis",
  },
  
  de: {
    // Navigation
    "nav.home": "Startseite",
    "nav.login": "Anmelden",
    "nav.signup": "Registrieren",
    "nav.dashboard": "Dashboard",
    "nav.back": "Zurück zur Startseite",
    
    // Hero Section
    "hero.title": "Klüger Planen.\nEinfacher Reisen.",
    "hero.subtitle": "Wissen Sie, Wohin Sie Reisen Können — Sehen Sie Sofort Visa-Regeln, Buchen Sie Reisen und Reisen Sie Vertrauensvoll.",
    
    // Quick Destination Checker
    "quick.title": "Wohin Können Sie Reisen?",
    "quick.subtitle": "Entdecken Sie sofort alle visafreien Ziele, die für Ihren Pass verfügbar sind",
    "quick.button": "Prüfen Sie Ihre Reiseoptionen →",
    "quick.features": "Kostenlos • Keine Registrierung erforderlich • Sofortige Ergebnisse",
    
    // Destination Checker
    "dest.title": "Entdecken Sie Ihre Reisemöglichkeiten",
    "dest.subtitle": "Wählen Sie Ihre Nationalität, um alle erstaunlichen Ziele zu sehen, die Sie visafrei im Schengen-Raum besuchen können",
    "dest.select": "Wählen Sie Ihre Nationalität",
    "dest.choose": "Wählen Sie Ihr Passland, um verfügbare Ziele zu sehen",
    "dest.placeholder": "🌍 Wählen Sie Ihr Land",
    "dest.loading": "Finde Ihre Reiseziele...",
    "dest.results": "Gute Nachrichten! {flag} {country} Passinhaber können besuchen",
    "dest.countries": "{count} Schengen-Länder Visafrei",
    "dest.period": "Bis zu 90 Tage innerhalb eines 180-Tage-Zeitraums",
    "dest.search": "Ziele suchen...",
    "dest.cities": "Beliebte Städte",
    "dest.flights": "Flüge",
    "dest.hotels": "Hotels",
    
    // Call to Action
    "cta.title": "Bereit, Ihr Perfektes Europäisches Abenteuer zu Planen?",
    "cta.subtitle": "Verwenden Sie unseren erweiterten Schengen-Rechner, um mehrere Reisen zu planen und die 90/180-Regel einzuhalten",
    "cta.plan": "Planen Sie Ihre Reisen",
    "cta.save": "Speichern Sie Ihre Ergebnisse",
    
    // How It Works
    "how.title": "Wie Es Funktioniert",
    "how.step1": "Nationalität Auswählen",
    "how.step1.desc": "Wählen Sie Ihr Passland",
    "how.step2": "Ziele Anzeigen",
    "how.step2.desc": "Alle visafreien Länder sehen",
    "how.step3": "Planen Beginnen",
    "how.step3.desc": "Flüge und Unterkünfte buchen",
    
    // Calculator
    "calc.country": "Land",
    "calc.dates": "Datumsbereich",
    "calc.days": "Aufenthaltstage",
    "calc.last180": "Aufenthaltstage in den letzten 180 Tagen",
    "calc.remaining": "Verbleibende Tage",
    "calc.add": "Weitere Reise Hinzufügen",
    "calc.total": "Gesamttage in den Letzten 180 Tagen: {used} / 90",
    "calc.available": "Verbleibende Tage: {remaining}",
    
    // Common
    "common.save": "Fortschritt Speichern",
    "common.loading": "Laden...",
    "common.error": "Etwas ist schief gelaufen",
    "common.try_again": "Erneut Versuchen",
    "common.close": "Schließen",
    "common.cancel": "Abbrechen",
    "common.confirm": "Bestätigen",

    // Travel Quiz
    "quiz.title": "Europäischer Reisepersönlichkeits-Quiz",
    "quiz.progress": "Frage {current} von {total}",
    "quiz.complete": "{percent}% Abgeschlossen",
    "quiz.previous": "Zurück",
    "quiz.next": "Weiter",
    "quiz.results": "Ergebnisse Anzeigen",

    // Home Page Quiz CTA
    "home.quiz.title": "Was ist Ihre Reisepersönlichkeit?",
    "home.quiz.subtitle": "Machen Sie unser Quiz und erhalten Sie personalisierte europäische Reiseziel-Empfehlungen",
    "home.quiz.button": "Entdecken Sie Ihren Reisestil →",
    "home.quiz.features": "2 Minuten • Personalisierte Ergebnisse • Mit Freunden teilen",
  }
}

// Helper function to get translation
export function getTranslation(key: string, language: string = "en", params?: Record<string, string | number>): string {
  const langTranslations = translations[language as keyof typeof translations] || translations.en
  let translation = langTranslations[key as keyof typeof langTranslations] || key
  
  // Replace parameters in translation
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, String(value))
    })
  }
  
  return translation
}

// Hook for using translations in components
export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage") || "en"
    setCurrentLanguage(savedLanguage)
    
    // Listen for language changes
    const handleLanguageChange = () => {
      const newLanguage = localStorage.getItem("preferredLanguage") || "en"
      setCurrentLanguage(newLanguage)
    }
    
    window.addEventListener("languageChanged", handleLanguageChange)
    return () => window.removeEventListener("languageChanged", handleLanguageChange)
  }, [])

  const t = (key: string, params?: Record<string, string | number>) => {
    return getTranslation(key, currentLanguage, params)
  }

  return { t, currentLanguage }
} 