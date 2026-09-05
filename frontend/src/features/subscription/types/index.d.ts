export type CheckoutResponse = {
  checkoutUrl: string;
};

export type SubscribeButtonProps = {
  disabled?: boolean;
  label: string;
  onClick: () => void;
};
