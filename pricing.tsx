import { useRouter } from "next/router";
import { useState } from "react";
import { postData } from "@/utils/http-helpers";
import { getStripe } from "@/utils/stripe-client";
import { useSubscription } from "@/utils/user-context";
import { useSession } from "@supabase/auth-helpers-react";
import Button from "../../../atoms/button";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "next-i18next";

type PricingPlan = {
  title: string;
  description: string;
  features: string[];
};

export default function Pricing() {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "year"
  );
  const [priceIdLoading, setPriceIdLoading] = useState("");
  const [priceError, setPriceError] = useState({ priceId: "", message: "" });
  const session = useSession();
  const subscription = useSubscription();
  const { t } = useTranslation("landingPage");
  const translatedPricingPlans = t("pricing.plans", {
    returnObjects: true,
  }) as PricingPlan[];

  const pricingPlans = [
    {
      title: "Floof",
      description: "The floof plan to get you started. 🐱",
      monthly: {
        pricing: "29.99",
        pricingId: process.env.NEXT_PUBLIC_PRICE_BASIC_MONTHLY,
      },
      yearly: {
        pricing: "199.99",
        pricingId: process.env.NEXT_PUBLIC_PRICE_BASIC_YEARLY,
      },
      features: [
        "60 Petfluencer Applications / Month",
        "20 Petfluencer Requests / Month",
        "2 Campaigns / Month",
        "Monthly Social Boost",
      ],
    },
    {
      title: "Boop",
      description: "Boop since this plan will get your brand noticed. ☝️",
      monthly: {
        pricing: "39.99",
        pricingId: process.env.NEXT_PUBLIC_PRICE_PRO_MONTHLY,
      },
      yearly: {
        pricing: "249.99",
        pricingId: process.env.NEXT_PUBLIC_PRICE_PRO_YEARLY,
      },
      highlight: true,
      features: [
        "Everything In Floof +",
        "100 Petfluencer Requests / Month",
        "200 Petfluencer Applications / Month",
        "4 Campaigns / Month",
        "AI Generated Finder",
        "Monthly Social Boost",
        "Promote Your Affiliate Program",
        "Campaign Newsletter Boost",
      ],
    },
    {
      title: "Best Friend",
      description: "Petfluence will become your bestfriend 😉",
      monthly: {
        pricing: "79.99",
        pricingId: process.env.NEXT_PUBLIC_PRICE_MASTER_MONTHLY,
      },
      yearly: {
        pricing: "499.99",
        pricingId: process.env.NEXT_PUBLIC_PRICE_MASTER_YEARLY,
      },
      features: [
        "Everything In Floof + Boop +",
        "Unlimited Petfluencer Requests / Month",
        "Unlimited Petfluencer Applications / Month",
        "Unlimited Campaigns / Month",
        "AI Generated Finder",
        "Weekly Social Boost",
        "Promote Your Affiliate Program",
        "Campaign Newsletter Boost",
      ],
    },
  ];

  const handleCheckout = async (priceId: string) => {
    setPriceIdLoading(priceId);

    if (!session) {
      return router.push(
        `/login?returnUrl=${window.location.origin}/brand/pricing`
      );
    }

    if (subscription) {
      return router.push("/brand");
    }

    try {
      const { data } = await postData<{ sessionId: string }>(
        "/api/auth/get-checkout-session",
        { priceId },
        session.access_token
      );
      const stripe = await getStripe();
      stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error) {
      const errorMessage = "Error Please Contact Us";
      setPriceError({
        priceId: priceId,
        message: errorMessage,
      });
      console.log(error);
    } finally {
      setPriceIdLoading("");
    }
  };
  return (
    <>
      <div className="container mx-auto pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center items-center">
          <h2 className="section-heading">Petfluence Pricing</h2>
          <p className="section-subheading">
            The ultimate platform for any pet brand looking to skyrocket!
          </p>
          <div className="mt-6 sm:mt-8 bg-gray-200 rounded-lg p-1 flex justify-center flex-col sm:flex-row space-x-0 sm:space-x-1 space-y-1 sm:space-y-0">
            <button
              onClick={() => setBillingInterval("month")}
              type="button"
              className={`border border-gray-300 border-solid rounded-md px-6 py-2 text-sm whitespace-nowrap focus:outline-none focus:z-5 relative w-full sm:w-1/2
                ${
                  billingInterval === "month"
                    ? "text-white font-bold bg-indigo-500"
                    : "bg-white text-black shadow-sm"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              type="button"
              className={`border border-gray-300 border-solid rounded-md px-6 py-2 text-sm whitespace-nowrap focus:outline-none focus:z-5 relative w-full sm:w-1/2
                ${
                  billingInterval === "year"
                    ? "text-white font-bold bg-indigo-500"
                    : "bg-white text-black shadow-sm"
                }`}
            >
              Yearly
            </button>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:mx-auto">
          {pricingPlans.map((pp, i) => (
            <div
              key={i}
              className={`relative rounded-lg shadow-sm p-6 ${
                pp.highlight
                  ? "border-indigo-500 border-4"
                  : "border-gray-300 border-2"
              }`}
            >
              {pp.highlight && (
                <span className="absolute -top-4 right-4 bg-red-600 text-white px-2 py-1 rounded-3xl text-xs">
                  {t("pricing.popularLabel")}
                </span>
              )}
              <h2 className="text-2xl font-bold">{pp.title}</h2>
              <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
                {pp.description}
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold">
                  $
                  {billingInterval === "month"
                    ? pp.monthly.pricing
                    : pp.yearly.pricing}
                </span>
                <span className="text-base font-medium">
                  {billingInterval === "month" ? " / month" : " / year"}
                </span>
              </p>
              <div className="border-t border-gray-300 grow my-8"></div>
              <h3 className="text-sm font-medium uppercase tracking-wide">
                {t("pricing.featuresLabel")}
              </h3>
              <ul className="mt-4 mb-8">
                {pp.features.map((feature, i) => (
                  <li key={i} className="flex space-x-4 my-1">
                    <CheckIcon className="h-5 w-5 text-mainpink" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                disabled={false}
                loading={
                  priceIdLoading === pp.monthly.pricingId ||
                  priceIdLoading === pp.yearly.pricingId
                }
                className="default-button"
                onClick={() =>
                  handleCheckout(
                    billingInterval === "month"
                      ? pp.monthly.pricingId
                      : pp.yearly.pricingId
                  )
                }
              >
                {subscription
                  ? t("pricing.signedInPricingButton")
                  : "Subcribe To This Plan"}
              </Button>
              {(priceError.priceId === pp.monthly.pricingId ||
                priceError.priceId === pp.yearly.pricingId) &&
                priceError.message && (
                  <div className="mt-6">{priceError.message}</div>
                )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
