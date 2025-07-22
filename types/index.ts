// Types pour GozoAuthentic - Carnet de voyage intimiste

// ========== TYPES DE BASE ==========

export interface Category {
  id: string;
  slug: string;
  icon: string;
  position: number;
  is_active: boolean;
  name_en: string;
  name_fr: string;
  name_de?: string;
  name_it?: string;
  name_nl?: string;
  name_es?: string;
  name_pt?: string;
  description_en?: string;
  description_fr?: string;
  description_de?: string;
  description_it?: string;
  description_nl?: string;
  description_es?: string;
  description_pt?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  slug: string;
  tag_type: 'ambiance' | 'budget' | 'duration' | 'location' | 'special';
  name_en: string;
  name_fr: string;
  name_de?: string;
  name_it?: string;
  name_nl?: string;
  name_es?: string;
  name_pt?: string;
  is_active: boolean;
  created_at: string;
}

export interface Experience {
  id: string;
  category_id?: string;
  name_en: string;
  name_fr: string;
  name_de?: string;
  name_it?: string;
  name_nl?: string;
  name_es?: string;
  name_pt?: string;
  name_en_us?: string;
  description_en?: string;
  description_fr?: string;
  description_de?: string;
  description_it?: string;
  description_nl?: string;
  description_es?: string;
  description_pt?: string;
  description_en_us?: string;
  price_from?: number;
  partner_id?: string;
  partner_name?: string;
  partner_phone?: string;
  partner_whatsapp?: string;
  partner_contact?: string;
  contact_method?: string;
  duration_hours?: number;
  featured_image_url?: string;
  gallery_urls?: string[];
  our_story_en?: string;
  our_story_fr?: string;
  our_story_de?: string;
  our_story_it?: string;
  our_story_nl?: string;
  our_story_es?: string;
  our_story_pt?: string;
  tips_en?: string;
  tips_fr?: string;
  images?: any;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Pour la compatibilité avec le code existant
}

export interface ExperienceTag {
  id: string;
  experience_id: string;
  tag_id: string;
  created_at: string;
}

export interface Lead {
  id: string;
  experience_id?: string;
  reference_code?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string; // Maintenant obligatoire
  preferred_date?: string;
  guests?: number;
  message?: string;
  status?: string;
  locale?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  category_slug?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CommissionTracking {
  id: string;
  lead_reference?: string;
  partner_id?: string;
  commission_rate?: number;
  expected_amount?: number;
  actual_amount?: number;
  cash_collected?: boolean;
  collection_date?: string;
  collection_code?: string;
  notes?: string;
  encrypted_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CarnetEntry {
  id: string;
  user_email?: string;
  experience_id?: string;
  added_at: string;
  contacted?: boolean;
  contacted_at?: string;
  notes?: string;
  locale?: string;
}

export interface EmailLog {
  id: string;
  lead_id?: string;
  email_type?: string;
  sent_to?: string;
  sent_at: string;
  status?: string;
}

export interface Testimonial {
  id: string;
  experience_id?: string;
  author_name?: string;
  author_location?: string;
  content_en?: string;
  content_fr?: string;
  rating?: number;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface FreeSpot {
  id: string;
  name_en?: string;
  name_fr?: string;
  description_en?: string;
  description_fr?: string;
  location_lat?: number;
  location_lng?: number;
  category?: string;
  tips_en?: string;
  tips_fr?: string;
  is_active?: boolean;
  created_at?: string;
}

// ========== TYPES COMPOSÉS ==========

export interface ExperienceWithDetails extends Experience {
  category?: Category;
  tags?: Tag[];
  testimonials?: Testimonial[];
}

export interface ExperienceWithCategory extends Experience {
  category_slug?: string;
  category_icon?: string;
  category_name_en?: string;
  category_name_fr?: string;
  tag_slugs?: string[];
}

// ========== TYPES POUR L'ÉTAT LOCAL ==========

export interface CarnetLocalEntry {
  experienceId: string;
  experienceName: string;
  categorySlug: string;
  categoryName: string;
  partnerName?: string;
  addedAt: Date;
  contacted: boolean;
  contactedAt?: Date;
  notes?: string;
  budget?: number;
  locale: string;
  tags?: string[];
}

// ========== TYPES POUR LES FILTRES ==========

export interface FilterState {
  category?: string;
  tags: string[];
  search?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export interface TagGroup {
  type: 'ambiance' | 'budget' | 'duration' | 'location' | 'special';
  tags: Tag[];
}

// ========== TYPES POUR LES PROPS ==========

export interface CategoryCardProps {
  category: Category;
  experienceCount?: number;
  onClick?: () => void;
}

export interface ExperienceCardProps {
  experience: ExperienceWithCategory;
  showCategory?: boolean;
  onAddToCarnet?: (experience: ExperienceWithCategory) => void;
}

export interface TagFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagSlug: string) => void;
  onClearAll?: () => void;
}

export interface ContactModalProps {
  experience: ExperienceWithDetails;
  onClose: () => void;
}

// ========== TYPES UTILITAIRES ==========

export type SupportedLocale = 'en' | 'fr' | 'de' | 'it' | 'nl' | 'es' | 'pt';

export type TranslationKey<T> = {
  [K in SupportedLocale as `${string}_${K}`]?: T;
};

export type LocalizedField<T> = T & TranslationKey<string>;

// Helper pour obtenir la valeur localisée
export function getLocalizedValue<T extends Record<string, any>>(
  obj: T,
  field: string,
  locale: string,
  fallbackLocale: string = 'en'
): string | undefined {
  const localizedKey = `${field}_${locale}`;
  const fallbackKey = `${field}_${fallbackLocale}`;
  
  return obj[localizedKey] || obj[fallbackKey] || obj[field];
}

// ========== CONSTANTES ==========

export const CATEGORY_SLUGS = {
  SEA_ADVENTURES: 'nos-aventures-en-mer',
  LAND_ADVENTURES: 'nos-folies-terrestres',
  SECRET_TABLES: 'nos-tables-secretes',
  FAVORITE_REFUGES: 'nos-refuges-coup-de-coeur',
  HIDDEN_BEACHES: 'nos-plages-cachees',
  LOCAL_GEMS: 'nos-pepites-locales'
} as const;

export const TAG_TYPES = {
  AMBIANCE: 'ambiance',
  BUDGET: 'budget',
  DURATION: 'duration',
  LOCATION: 'location',
  SPECIAL: 'special'
} as const;
