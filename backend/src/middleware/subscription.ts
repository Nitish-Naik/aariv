import { NextFunction, Request, Response } from "express";
import { config } from "../config/env";
import { supabase } from "../config/supabase";

export interface SubscriptionRequest extends Request {
  user?: {
    id: string;
    tier: "free" | "pro" | "enterprise";
    isPro: boolean;
  };
}

/**
 * Middleware to check user subscription tier
 * Attaches user.tier and user.isPro to request object
 */
export const checkSubscription = async (
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.body.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    let tier: "free" | "pro" | "enterprise" = "free";

    // Check Supabase for subscription status
    if (config.supabaseUrl && config.supabaseServiceRoleKey) {
      const { data: userProfile } = await supabase
        .from("users")
        .select("subscription_tier")
        .eq("id", String(userId))
        .single();

      if (userProfile?.subscription_tier) {
        tier = userProfile.subscription_tier;
      }
    } else {
      // Fallback for dev without Supabase
      // Check if userId ends with -pro or -enterprise
      const userIdStr = String(userId);
      if (userIdStr.endsWith("-enterprise")) {
        tier = "enterprise";
      } else if (userIdStr.endsWith("-pro")) {
        tier = "pro";
      }
    }

    // Attach to request
    req.user = {
      id: String(userId),
      tier,
      isPro: tier === "pro" || tier === "enterprise",
    };

    next();
  } catch (error: any) {
    console.error("Subscription check error:", error);
    // Don't block request on subscription check failure
    req.user = {
      id: String(req.body.userId || req.query.userId),
      tier: "free",
      isPro: false,
    };
    next();
  }
};

/**
 * Middleware to enforce Pro subscription
 * Use after checkSubscription middleware
 */
export const requirePro = (
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?.isPro) {
    return res.status(403).json({
      error: "Pro Plan Required",
      code: "PAYWALL_LIMIT",
      message: "This feature is only available in Aariv Pro.",
      tier: req.user?.tier || "free",
    });
  }
  next();
};

/**
 * Middleware to enforce Enterprise subscription
 * Use after checkSubscription middleware
 */
export const requireEnterprise = (
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.tier !== "enterprise") {
    return res.status(403).json({
      error: "Enterprise Plan Required",
      code: "PAYWALL_LIMIT",
      message: "This feature is only available in Aariv Enterprise.",
      tier: req.user?.tier || "free",
    });
  }
  next();
};
