"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useMarketplace } from "@/hooks/useMarketplace";

type PowerUp = {
  id: string;
  name: string;
  description: string;
  xpCost: number;
  coinsCost: number;
  icon: string;
  color: string;
  duration: string;
};

const POWER_UPS: PowerUp[] = [
  {
    id: "streak_freeze",
    name: "Streak Freeze",
    description:
      "Missed a study day? Automatically protect your learning streak from resetting to zero. Holds for one missed day.",
    xpCost: 300,
    coinsCost: 1500,
    icon: "ac_unit",
    color: "text-warning-orange",
    duration: "1 use",
  },
  {
    id: "double_xp",
    name: "2x XP Multiplier",
    description:
      "Double all XP earned from quizzes, flashcards, and notes for the next 24 hours. Perfect for weekend cram sessions.",
    xpCost: 500,
    coinsCost: 3000,
    icon: "rocket_launch",
    color: "text-primary",
    duration: "24h",
  },
  {
    id: "retry_token",
    name: "Retry Token",
    description:
      "Allows you to retake one failed mastery quiz without waiting the standard 24-hour cooldown period.",
    xpCost: 150,
    coinsCost: 750,
    icon: "replay",
    color: "text-success-green",
    duration: "1 use",
  },
];

export default function MarketplacePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    balance,
    activeEffects,
    inventory,
    loading,
    purchase,
    exchangeXP,
    refresh,
  } = useMarketplace();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handlePurchase = async (powerUp: PowerUp, costType: "xp" | "coins") => {
    const cost = costType === "xp" ? powerUp.xpCost : powerUp.coinsCost;
    const result = await purchase("power_up", powerUp.id, costType, cost);
    if (result.success) {
      // Refresh inventory to update freeze count
      await refresh();
      setToast({
        message: `${powerUp.name} purchased successfully!`,
        type: "success",
      });
    } else {
      setToast({ message: result.error || "Purchase failed", type: "error" });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleExchange = async () => {
    const xpAmount = 100;
    const result = await exchangeXP(xpAmount);
    if (result.success) {
      await refresh();
      setToast({
        message: `Exchanged ${xpAmount} XP for ${result.coins_earned} coins`,
        type: "success",
      });
    } else {
      setToast({ message: result.error || "Exchange failed", type: "error" });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Compute freeze count from inventory
  const freezeItem = inventory.find((i) => i.item_id === "streak_freeze");
  const freezeCount = freezeItem?.quantity || 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto pt-lg md:pt-xl pb-xl gap-xl">
          {/* Store Hero */}
          <div className="relative w-full rounded-3xl bg-surface-charcoal shadow-xl p-lg md:p-xl flex flex-col md:flex-row md:items-center justify-between overflow-hidden gap-lg">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-warning-orange/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-sm max-w-2xl">
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant">
                The Reward Store
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Exchange your hard-earned XP for vital study boosts, streak
                protections, and exclusive profile cosmetics to stand out on the
                leaderboard.
              </p>
            </div>
            <div className="relative z-10 flex flex-col items-start md:items-end p-md bg-surface-container-low rounded-2xl shadow-lg">
              <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-[0.1em] mb-xs">
                Available Balance
              </span>
              <div className="flex items-center gap-sm">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shadow-inner">
                  <span
                    className="material-symbols-outlined text-rank-gold text-[28px] animate-[pulse_3s_ease-in-out_infinite]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stars
                  </span>
                </div>
                <span className="font-display-lg text-display-lg text-rank-gold tracking-tight">
                  {balance.xp.toLocaleString()}
                </span>
                <span className="font-headline-md text-headline-md text-rank-gold/70 self-end pb-1">
                  XP
                </span>
              </div>
              <div className="flex items-center gap-sm mt-2">
                <span className="material-symbols-outlined text-warning-orange">
                  coin
                </span>
                <span className="font-headline-md text-headline-md text-on-surface">
                  {balance.coins.toLocaleString()}
                </span>
                <span className="font-label-md text-label-md text-text-muted">
                  coins
                </span>
              </div>
            </div>
          </div>

          {/* Active Boosts */}
          {activeEffects.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-md p-md bg-surface-container rounded-2xl shadow-sm">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-success-green">
                  check_circle
                </span>
                <span className="font-label-md text-label-md text-on-surface">
                  Active Boosts:
                </span>
              </div>
              <div className="flex flex-wrap gap-sm">
                {activeEffects.map((effect) => {
                  const powerUp = POWER_UPS.find(
                    (p) => p.id === effect.effect_type,
                  );
                  const expiresIn = Math.max(
                    0,
                    Math.floor(
                      (new Date(effect.expires_at).getTime() - Date.now()) /
                        (1000 * 60 * 60),
                    ),
                  );
                  return (
                    <div
                      key={effect.id}
                      className="px-sm py-xs bg-surface-container-high rounded-lg flex items-center gap-xs"
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${powerUp?.color || "text-primary"}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {powerUp?.icon || "bolt"}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {powerUp?.name || effect.effect_type} ({expiresIn}h
                        left)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Power-ups Grid */}
          <div className="flex flex-col gap-md">
            <div className="flex items-center gap-sm pl-xs">
              <span
                className="material-symbols-outlined text-warning-orange text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Study Power-ups
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:gap-lg">
              {POWER_UPS.map((powerUp) => {
                // Show freeze count only for streak_freeze
                const isFreeze = powerUp.id === "streak_freeze";
                return (
                  <div
                    key={powerUp.id}
                    className="flex flex-col bg-surface-charcoal rounded-3xl p-lg shadow-md hover:-translate-y-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-warning-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <div className="flex items-start justify-between mb-lg relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <span
                          className={`material-symbols-outlined text-[32px] ${powerUp.color}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {powerUp.icon}
                        </span>
                      </div>
                      <div className="bg-surface-container px-md py-xs rounded-full flex items-center gap-xs shadow-sm">
                        <span
                          className="material-symbols-outlined text-rank-gold text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          stars
                        </span>
                        <span className="font-label-md text-label-md text-on-surface">
                          {powerUp.xpCost} XP
                        </span>
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-xs relative z-10">
                      {powerUp.name}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant flex-1 mb-xl relative z-10">
                      {powerUp.description}
                    </p>
                    {isFreeze && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-warning-orange">
                          ac_unit
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface">
                          Owned: {freezeCount}
                        </span>
                        <span className="font-label-sm text-label-sm text-text-muted">
                          (max 2)
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePurchase(powerUp, "xp")}
                        className="flex-1 py-md bg-surface-container-high hover:bg-warning-orange text-on-surface hover:text-on-tertiary-fixed transition-colors rounded-xl font-label-md text-label-md shadow-sm relative z-10 flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          shopping_cart
                        </span>
                        XP
                      </button>
                      <button
                        onClick={() => handlePurchase(powerUp, "coins")}
                        className="flex-1 py-md bg-surface-container-high hover:bg-primary text-on-surface hover:text-on-primary transition-colors rounded-xl font-label-md text-label-md shadow-sm relative z-10 flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          coin
                        </span>
                        Coins
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exchange Section */}
          <div className="w-full p-md bg-surface-container-low rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-rank-gold">
                swap_horiz
              </span>
              <span className="font-label-md text-label-md text-on-surface">
                Exchange XP for Coins
              </span>
              <span className="font-label-sm text-label-sm text-text-muted">
                (1 XP = 10 coins)
              </span>
            </div>
            <button
              onClick={handleExchange}
              className="px-md py-sm bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:-translate-y-0.5 transition-transform shadow-md shadow-primary/20"
            >
              Exchange 100 XP
            </button>
          </div>

          {/* Cosmetics Section (simplified) */}
          <div className="flex flex-col gap-md">
            <div className="flex items-center gap-sm pl-xs">
              <span
                className="material-symbols-outlined text-secondary text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                palette
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Profile Cosmetics
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="flex flex-col sm:flex-row bg-surface-charcoal rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="sm:w-2/5 h-48 sm:h-auto relative bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[64px] text-primary">
                    account_circle
                  </span>
                </div>
                <div className="p-lg sm:w-3/5 flex flex-col relative z-10">
                  <div className="flex items-start justify-between mb-sm">
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Neon Scholar Frame
                    </h3>
                    <div className="bg-surface-container px-sm py-xs rounded-full flex items-center gap-xs">
                      <span
                        className="material-symbols-outlined text-rank-gold text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        stars
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface">
                        1,000 XP
                      </span>
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant flex-1 mb-lg">
                    Stand out on the leaderboard with this exclusive animated
                    profile frame.
                  </p>
                  <button className="store-purchase-btn w-full py-sm bg-primary text-on-primary hover:bg-inverse-primary transition-colors rounded-xl font-label-md text-label-md shadow-sm">
                    Preview & Purchase
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row bg-surface-charcoal rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="sm:w-2/5 h-48 sm:h-auto relative bg-gradient-to-br from-success-green/20 to-success-green/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[64px] text-success-green">
                    palette
                  </span>
                </div>
                <div className="p-lg sm:w-3/5 flex flex-col relative z-10">
                  <div className="flex items-start justify-between mb-sm">
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Emerald Focus Theme
                    </h3>
                    <div className="bg-surface-container px-sm py-xs rounded-full flex items-center gap-xs">
                      <span
                        className="material-symbols-outlined text-rank-gold text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        stars
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface">
                        2,500 XP
                      </span>
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant flex-1 mb-lg">
                    Unlock a specialized dark green color palette engineered to
                    reduce eye strain.
                  </p>
                  <button className="store-purchase-btn w-full py-sm bg-primary text-on-primary hover:bg-inverse-primary transition-colors rounded-xl font-label-md text-label-md shadow-sm">
                    Preview & Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-margin-mobile md:bottom-lg right-margin-mobile md:right-lg px-md py-sm rounded-xl shadow-2xl flex items-center gap-sm z-50 transition-all duration-300 ${
              toast.type === "success"
                ? "bg-success-green text-surface-container-lowest"
                : "bg-error-container text-on-error-container"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md">
                {toast.type === "success" ? "Success!" : "Error"}
              </span>
              <span className="font-label-sm text-label-sm opacity-90">
                {toast.message}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
