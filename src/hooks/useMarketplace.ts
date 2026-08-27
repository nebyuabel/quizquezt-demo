import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ActiveEffect {
  id: string;
  effect_type: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface InventoryItem {
  id: string;
  item_type: string;
  item_id: string;
  quantity: number;
}

export function useMarketplace() {
  const { user } = useAuth();
  const supabase = createClient();
  const [balance, setBalance] = useState({ xp: 0, coins: 0 });
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    // Profile balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, coins")
      .eq("id", user.id)
      .single();
    if (profile)
      setBalance({ xp: profile.total_xp || 0, coins: profile.coins || 0 });

    // Active effects (exclude streak_freeze)
    const { data: effects } = await supabase
      .from("active_effects")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())
      .neq("effect_type", "streak_freeze"); // <-- exclude
    setActiveEffects(effects || []);

    // Inventory (including streak_freeze count)
    const { data: inv } = await supabase
      .from("user_inventory")
      .select("*")
      .eq("user_id", user.id)
      .gt("quantity", 0);
    setInventory(inv || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const purchase = async (
    itemType: string,
    itemId: string,
    costType: "xp" | "coins",
    costAmount: number,
  ) => {
    if (!user) return { success: false, error: "Not logged in" };

    const { data, error } = await supabase.rpc("purchase_item", {
      p_user_id: user.id,
      p_item_type: itemType,
      p_item_id: itemId,
      p_cost_type: costType,
      p_cost_amount: costAmount,
    });

    if (error) {
      console.error("Purchase error:", error);
      return { success: false, error: error.message };
    }

    // Refresh data
    await fetchData();
    return { success: true };
  };

  const exchangeXP = async (xpAmount: number) => {
    if (!user) return { success: false, error: "Not logged in" };

    const { data, error } = await supabase.rpc("exchange_xp_to_coins", {
      p_user_id: user.id,
      p_xp_amount: xpAmount,
    });

    if (error) {
      console.error("Exchange error:", error);
      return { success: false, error: error.message };
    }

    await fetchData();
    return { success: true, coins_earned: data.coins_earned };
  };

  return {
    balance,
    activeEffects,
    inventory,
    loading,
    purchase,
    exchangeXP,
    refresh: fetchData,
  };
}
