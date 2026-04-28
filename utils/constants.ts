import { isDev } from "./helpers";

export const pricingPlans = [
  {
    name: "Basic",
    id: "basic",
    price: 99,
    description: "For professionals and teams",
    items: [
      "5 PDF summaries per month",
      "Standard processing speed",
      "Email support",
    ],
    paymentLink: isDev ? "https://buy.stripe.com/test_fZueV6gkSaHoduH2yg4F200" : "",
    priceId: isDev ? "price_1TRG683DIli9w3nocrI5vPUD      " : "",
  },
  {
    name: "Pro",
    id: "pro",
    price: 199,
    description: "For professionals and teams",
    items: [
      "Unlimited PDF summaries",
      "Priority processing",
      "24/7 priority support",
      "Markdown Export",
    ],
    paymentLink: isDev ? "https://buy.stripe.com/test_7sYfZafgO9Dk2Q31uc4F202" : "",
    priceId: isDev ? "price_1TRGWk3DIli9w3noZDXMYlL1" : "",
  },
];
