export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    requestId: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export type SupportedLanguage = "en" | "nl" | "de" | "fr";

export type Nutrition = {
  energyKcal?: number;
  fat?: number;
  saturatedFat?: number;
  carbohydrates?: number;
  sugars?: number;
  fiber?: number;
  proteins?: number;
  salt?: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  language: SupportedLanguage;
  nutrition: Nutrition | null;
  nutritionAvailable: boolean;
  nutritionLocked: boolean;
};

export type ProductSearchResponse = {
  query: string;
  language: SupportedLanguage;
  products: Product[];
};

export type RecentSearch = {
  id: string;
  query: string;
  language: SupportedLanguage;
  createdAt: string;
};

export type SubscriptionSummary = {
  status: string;
  isActive: boolean;
  canAccessNutrition: boolean;
};

export type TranslationShape = {
  appName: string;
  statusActive: string;
  statusInactive: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  searchPlaceholder: string;
  searchButton: string;
  recentSearches: string;
  recentSearchesEmpty: string;
  loading: string;
  emptyTitle: string;
  emptyBody: string;
  errorTitle: string;
  noImage: string;
  nutritionTitle: string;
  lockedTitle: string;
  lockedBody: string;
  subscribe: string;
  subscriptionCtaTitle: string;
  subscriptionCtaBody: string;
  subscriptionSuccessEyebrow: string;
  subscriptionSuccessTitle: string;
  subscriptionSuccessBody: string;
  subscriptionCancelEyebrow: string;
  subscriptionCancelTitle: string;
  subscriptionCancelBody: string;
  backHome: string;
  activationPending: string;
  nutritionLabels: Record<string, string>;
};

export type ProviderProps = Readonly<{ children: React.ReactNode }>;
export type RootLayoutProps = Readonly<{ children: React.ReactNode }>;
