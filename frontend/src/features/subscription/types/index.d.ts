export type CheckoutResponse = {
  checkoutUrl: string;
};

export type SubscriptionSummary = {
  status: string;
  isActive: boolean;
  canAccessNutrition: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
};

export type SubscribeButtonProps = {
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

export type PremiumAccessLinkProps = {
  isActive: boolean;
  isLoading: boolean;
  activateLabel: string;
  crownLabel: string;
};
