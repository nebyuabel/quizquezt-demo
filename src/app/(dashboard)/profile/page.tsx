"use client";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import { useLevel } from "@/hooks/useLevel";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/client";
import { getLevelFromXP } from "@/lib/config/levels";

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, refresh } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    email: "",
    school: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        username: profile.username || "",
        email: user?.email || "",
        school: profile.school || "",
      });
    }
  }, [profile, user]);

  const levelData = useLevel(profile?.total_xp || 0);
  const nextLevel = getLevelFromXP(profile?.total_xp || 0).level + 1;
  const nextLevelXP = getLevelFromXP(profile?.total_xp || 0).xpRequired;
  const currentXP = profile?.total_xp || 0;
  const progressToNext = nextLevelXP
    ? Math.min(100, (currentXP / nextLevelXP) * 100)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name,
          username: formData.username,
          school: formData.school,
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess(true);
      await refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.");
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      // Generate unique file path: avatars/{userId}/{timestamp}-{filename}
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Refresh profile data
      await refresh();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen md:pl-64">
        <div className="flex flex-col w-full px-md py-lg max-w-[1200px] mx-auto gap-xl">
          {/* Profile Header */}
          <section className="flex flex-col md:flex-row items-center md:items-start gap-lg bg-surface-container rounded-2xl p-lg shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50"></div>

            {/* Avatar with upload trigger */}
            <div
              className="relative group cursor-pointer z-10"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl bg-surface-container-highest flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant">
                    person
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                {uploadingAvatar ? (
                  <span className="material-symbols-outlined text-on-primary animate-spin">
                    refresh
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-on-primary">
                    edit
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </div>

            <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left z-10">
              <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">
                {profile.display_name}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-md">
                {profile.username || profile.display_name}
              </p>
              <div className="flex flex-wrap gap-sm justify-center md:justify-start">
                <div className="flex items-center gap-xs bg-surface-container-high px-md py-xs rounded-full border border-outline-variant/30 shadow-sm hover:border-rank-gold/50 transition-colors">
                  <span
                    className="material-symbols-outlined text-rank-gold"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">
                    {levelData.tier}
                  </span>
                </div>
                <div className="flex items-center gap-xs bg-surface-container-high px-md py-xs rounded-full border border-outline-variant/30 shadow-sm hover:border-warning-orange/50 transition-colors">
                  <span
                    className="material-symbols-outlined text-warning-orange"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_fire_department
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">
                    {profile.current_streak} Day Streak
                  </span>
                </div>
                {profile.school && (
                  <div className="flex items-center gap-xs bg-surface-container-high px-md py-xs rounded-full border border-outline-variant/30 shadow-sm hover:border-primary/50 transition-colors">
                    <span className="material-symbols-outlined text-primary">
                      school
                    </span>
                    <span className="font-label-md text-label-md text-on-surface">
                      {profile.school}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-sm w-full md:w-auto mt-md md:mt-0 z-10">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-xl shadow-md hover:-translate-y-1 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                onClick={handleSignOut}
                className="bg-transparent border border-border-subtle text-on-surface font-label-md text-label-md px-lg py-sm rounded-xl hover:bg-surface-container-highest transition-colors"
              >
                Sign Out
              </button>
            </div>
            {error && (
              <div className="text-error text-sm mt-2 z-10">{error}</div>
            )}
            {success && (
              <div className="text-success-green text-sm mt-2 z-10">
                Profile updated successfully!
              </div>
            )}
          </section>

          {/* Rest of the page unchanged... */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
            {/* Account Information */}
            <section className="lg:col-span-2 flex flex-col gap-md">
              <div className="flex items-center gap-sm mb-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">
                    person_outline
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Account Information
                </h2>
              </div>
              <form
                onSubmit={handleSubmit}
                className="bg-surface-charcoal p-lg rounded-2xl shadow-md border border-border-subtle/50 hover:border-primary/30 transition-colors group"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_name: e.target.value,
                        })
                      }
                      className="bg-background border border-transparent focus:border-primary text-on-surface font-body-md text-body-md px-md py-sm rounded-xl outline-none transition-all w-full shadow-inner"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="bg-background border border-transparent focus:border-primary text-on-surface font-body-md text-body-md px-md py-sm rounded-xl outline-none transition-all w-full shadow-inner"
                    />
                  </div>
                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-background border border-transparent text-on-surface-variant font-body-md text-body-md px-md py-sm rounded-xl outline-none w-full shadow-inner opacity-60 cursor-not-allowed"
                    />
                    <p className="font-label-sm text-label-sm text-text-muted mt-1">
                      Email cannot be changed here. Contact support.
                    </p>
                  </div>
                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      School
                    </label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) =>
                        setFormData({ ...formData, school: e.target.value })
                      }
                      className="bg-background border border-transparent focus:border-primary text-on-surface font-body-md text-body-md px-md py-sm rounded-xl outline-none transition-all w-full shadow-inner"
                      placeholder="e.g., Addis Ababa University"
                    />
                  </div>
                </div>
              </form>
            </section>

            {/* Tier Information */}
            <section className="flex flex-col gap-md">
              <div className="flex items-center gap-sm mb-sm">
                <div className="w-8 h-8 rounded-full bg-rank-gold/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rank-gold text-sm">
                    stars
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Current Tier
                </h2>
              </div>
              <div className="bg-surface-charcoal p-lg rounded-2xl shadow-xl border border-rank-gold/20 relative overflow-hidden h-full flex flex-col justify-between hover:border-rank-gold/40 transition-colors">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-rank-gold/5 rounded-full blur-3xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between mb-lg">
                    <h3 className="font-headline-lg text-headline-lg text-rank-gold">
                      {levelData.tier}
                    </h3>
                    <span
                      className="material-symbols-outlined text-rank-gold text-[48px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                  </div>
                  <ul className="space-y-md">
                    <li className="flex items-start gap-sm">
                      <span className="material-symbols-outlined text-success-green mt-1">
                        check_circle
                      </span>
                      <div>
                        <h4 className="font-label-md text-label-md text-on-surface">
                          1.5x XP Multiplier
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                          Learn faster and climb the leaderboard quicker.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-sm">
                      <span className="material-symbols-outlined text-success-green mt-1">
                        check_circle
                      </span>
                      <div>
                        <h4 className="font-label-md text-label-md text-on-surface">
                          Exclusive Profile Frame
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                          Stand out with the {levelData.tier} glowing border.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-sm opacity-50">
                      <span className="material-symbols-outlined text-on-surface-variant mt-1">
                        lock
                      </span>
                      <div>
                        <h4 className="font-label-md text-label-md text-on-surface">
                          Next Tier Features
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                          Reach the next tier for more perks.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="mt-lg pt-md border-t border-border-subtle/50">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Progress to{" "}
                      {nextLevel > 25 ? "Max Level" : `Level ${nextLevel}`}
                    </span>
                    <span className="font-label-sm text-label-sm text-primary">
                      {currentXP.toLocaleString()} /{" "}
                      {nextLevelXP ? nextLevelXP.toLocaleString() : "∞"} XP
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                    <div
                      className={`bg-gradient-to-r from-rank-gold to-primary h-full rounded-full shadow-[0_0_10px_rgba(157,78,221,0.5)]`}
                      style={{ width: `${Math.min(100, progressToNext)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
