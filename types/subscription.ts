export type SubscriptionFeature = {
  id: string;
  text: string;
  isIncluded: boolean;
};

export type SubscriptionPlan = {
  id: string;
  name: "Breeze" | "Flow" | "Zen";
  tagline: string;
  priceMonthly: number | "Free";
  priceAnnually: number | "Free";
  currency: string;
  features: SubscriptionFeature[];
  callToAction: string;
  isMostPopular?: boolean; // Optional: to highlight a plan
};
