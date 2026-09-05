export type SubscriptionSummary = {
  status: string;
  isActive: boolean;
  canAccessNutrition: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
};
