"use client";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/client";

type Preferences = {
  theme: string;
  notifications: {
    dailyReminders: boolean;
    weeklyReports: boolean;
    leaderboardAlerts: boolean;
  };
  privacy: {
    publicProfile: boolean;
  };
  uiDensity: string;
};

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refresh } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const [preferences, setPreferences] = useState<Preferences>({
    theme: "dark",
    notifications: {
      dailyReminders: true,
      weeklyReports: true,
      leaderboardAlerts: false,
    },
    privacy: {
      publicProfile: true,
    },
    uiDensity: "comfortable",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile?.preferences) {
      setPreferences(profile.preferences);
    }
  }, [profile]);

  const toggleNotification = (key: keyof Preferences["notifications"]) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };
  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setPasswordSuccess(true);
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    }
  };
  const togglePrivacy = (key: keyof Preferences["privacy"]) => {
    setPreferences((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key],
      },
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ preferences })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess(true);
      await refresh();
      // Optionally apply theme immediately
      if (preferences.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen md:pl-64">
        <div className="flex flex-col w-full relative pb-xl">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-[200px] -mt-[200px]"></div>

          <div className="px-xl py-lg flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-xs">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight">
                Settings
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-xl flex items-center gap-xs hover:-translate-y-1 transition-transform shadow-[0_4px_20px_rgba(157,78,221,0.2)] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                save
              </span>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {error && (
            <div className="px-xl text-error text-sm mb-2">{error}</div>
          )}
          {success && (
            <div className="px-xl text-success-green text-sm mb-2">
              Settings saved successfully!
            </div>
          )}

          <div className="px-xl grid grid-cols-12 gap-xl z-10 relative">
            {/* Sidebar Navigation */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-lg">
              <div className="bg-surface-charcoal rounded-xl p-lg flex flex-col items-center gap-md shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative w-32 h-32 rounded-full shadow-[0_0_30px_rgba(157,78,221,0.15)] bg-surface-container flex items-center justify-center p-base">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[64px] text-on-surface-variant">
                      person
                    </span>
                  )}
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-primary group/edit">
                    <span className="material-symbols-outlined text-[20px] group-hover/edit:text-primary-container">
                      edit
                    </span>
                  </button>
                </div>
                <div className="text-center">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    {profile?.display_name || "User"}
                  </h2>
                  <p className="font-body-md text-body-md text-text-muted mt-xs">
                    {profile?.school || "Student"}
                  </p>
                </div>
                <div className="w-full flex justify-between items-center bg-surface-container rounded-xl p-md mt-sm">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-widest">
                      Rank
                    </span>
                    <span className="font-headline-md text-headline-md text-rank-gold flex items-center gap-xs">
                      <span
                        className="material-symbols-outlined text-rank-gold"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        military_tech
                      </span>
                      Top 5%
                    </span>
                  </div>
                  <div className="h-10 w-px bg-border-subtle"></div>
                  <div className="flex flex-col text-right">
                    <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-widest">
                      Total XP
                    </span>
                    <span className="font-headline-md text-headline-md text-primary">
                      {profile?.total_xp?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>

              <nav className="flex flex-col gap-xs bg-surface-charcoal rounded-xl p-sm shadow-xl sticky top-24">
                <a
                  className="flex items-center gap-md px-md py-sm rounded-lg bg-surface-container-high text-on-surface shadow-sm"
                  href="#notifications"
                >
                  <span className="material-symbols-outlined text-secondary">
                    notifications
                  </span>
                  <span className="font-label-md text-label-md">
                    Notifications
                  </span>
                </a>
                <a
                  className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                  href="#privacy"
                >
                  <span className="material-symbols-outlined">shield</span>
                  <span className="font-label-md text-label-md">
                    Privacy & Security
                  </span>
                </a>
                <a
                  className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                  href="#appearance"
                >
                  <span className="material-symbols-outlined">palette</span>
                  <span className="font-label-md text-label-md">
                    Appearance
                  </span>
                </a>
              </nav>
            </div>

            {/* Main Settings Content */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-xl">
              {/* Notifications */}
              <section
                className="bg-surface-charcoal rounded-xl shadow-xl flex flex-col relative overflow-hidden"
                id="notifications"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-secondary rounded-l-xl"></div>
                <div className="p-lg border-b border-border-subtle">
                  <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
                    <span className="material-symbols-outlined text-secondary text-[28px]">
                      campaign
                    </span>
                    Notifications
                  </h3>
                  <p className="font-body-md text-body-md text-text-muted mt-xs">
                    Control how and when we contact you.
                  </p>
                </div>
                <div className="p-lg flex flex-col gap-md">
                  <div className="flex items-center justify-between p-md bg-surface-container rounded-xl">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface">
                        Daily Study Reminders
                      </span>
                      <span className="font-body-md text-body-md text-text-muted text-sm mt-1">
                        Get notified to keep your streak alive.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.dailyReminders}
                        onChange={() => toggleNotification("dailyReminders")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary-container after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-green shadow-inner"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-md bg-surface-container rounded-xl">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface">
                        Weekly Progress Reports
                      </span>
                      <span className="font-body-md text-body-md text-text-muted text-sm mt-1">
                        A summary of your XP and weak areas.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.weeklyReports}
                        onChange={() => toggleNotification("weeklyReports")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary-container after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-green shadow-inner"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-md bg-surface-container rounded-xl">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface">
                        Leaderboard Alerts
                      </span>
                      <span className="font-body-md text-body-md text-text-muted text-sm mt-1">
                        When you drop or climb in the regional ranks.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.leaderboardAlerts}
                        onChange={() => toggleNotification("leaderboardAlerts")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary-container after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-green shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Privacy & Security */}
              <section
                className="bg-surface-charcoal rounded-xl shadow-xl flex flex-col relative overflow-hidden"
                id="privacy"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-error rounded-l-xl"></div>
                <div className="p-lg border-b border-border-subtle flex justify-between items-start">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
                      <span className="material-symbols-outlined text-error text-[28px]">
                        lock
                      </span>
                      Privacy & Security
                    </h3>
                    <p className="font-body-md text-body-md text-text-muted mt-xs">
                      Manage your data and account security.
                    </p>
                  </div>
                </div>
                <div className="p-lg flex flex-col gap-lg">
                  <div className="h-px w-full bg-border-subtle"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface">
                        Password
                      </span>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-md py-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-error">
                        Danger Zone
                      </span>
                      <span className="font-body-md text-body-md text-text-muted text-sm mt-1">
                        Permanently delete your account and all data.
                      </span>
                    </div>
                    <button className="px-md py-sm rounded-lg bg-error-container/20 hover:bg-error-container/40 text-error font-label-md text-label-md transition-colors shadow-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
                {showPasswordModal && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container rounded-xl p-lg max-w-md w-full shadow-2xl">
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-md">
                        Change Password
                      </h3>
                      {passwordError && (
                        <div className="text-error text-sm mb-2">
                          {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="text-success-green text-sm mb-2">
                          Password updated successfully!
                        </div>
                      )}
                      <div className="flex flex-col gap-sm">
                        <input
                          type="password"
                          placeholder="Current Password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="bg-[#14141A] text-on-surface font-body-md text-body-md p-md rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-shadow w-full shadow-inner"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-[#14141A] text-on-surface font-body-md text-body-md p-md rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-shadow w-full shadow-inner"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="bg-[#14141A] text-on-surface font-body-md text-body-md p-md rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-shadow w-full shadow-inner"
                          onChange={(e) => {
                            if (e.target.value !== newPassword) {
                              setPasswordError("Passwords do not match");
                            } else {
                              setPasswordError(null);
                            }
                          }}
                        />
                        <div className="flex justify-end gap-sm mt-sm">
                          <button
                            onClick={() => {
                              setShowPasswordModal(false);
                              setPasswordError(null);
                              setOldPassword("");
                              setNewPassword("");
                            }}
                            className="px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handlePasswordChange}
                            className="px-md py-sm rounded-lg bg-primary text-on-primary hover:bg-primary/80 transition-colors"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Appearance */}
              <section
                className="bg-surface-charcoal rounded-xl shadow-xl flex flex-col relative overflow-hidden mb-xl"
                id="appearance"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-tertiary rounded-l-xl"></div>
                <div className="p-lg border-b border-border-subtle">
                  <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
                    <span className="material-symbols-outlined text-tertiary text-[28px]">
                      contrast
                    </span>
                    Appearance
                  </h3>
                  <p className="font-body-md text-body-md text-text-muted mt-xs">
                    Customize your learning environment.
                  </p>
                </div>
                <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-sm">
                    <span className="font-label-md text-label-md text-on-surface">
                      Theme Preference
                    </span>
                    <div className="grid grid-cols-2 gap-md">
                      <div
                        className={`bg-surface-container p-md rounded-xl flex flex-col items-center gap-sm cursor-pointer border ${preferences.theme === "dark" ? "border-primary ring-2 ring-primary/20 shadow-[0_0_15px_rgba(157,78,221,0.1)]" : "border-transparent hover:bg-surface-container-high transition-colors"}`}
                        onClick={() =>
                          setPreferences({ ...preferences, theme: "dark" })
                        }
                      >
                        <span className="material-symbols-outlined text-primary text-[32px]">
                          dark_mode
                        </span>
                        <span
                          className={`font-label-md text-label-md ${preferences.theme === "dark" ? "text-primary" : "text-text-muted"}`}
                        >
                          Dark (Focus)
                        </span>
                      </div>
                      <div
                        className={`bg-surface-container p-md rounded-xl flex flex-col items-center gap-sm cursor-pointer border ${preferences.theme === "light" ? "border-primary ring-2 ring-primary/20 shadow-[0_0_15px_rgba(157,78,221,0.1)]" : "border-transparent hover:bg-surface-container-high transition-colors"}`}
                        onClick={() =>
                          setPreferences({ ...preferences, theme: "light" })
                        }
                      >
                        <span
                          className={`material-symbols-outlined text-[32px] ${preferences.theme === "light" ? "text-primary" : "text-text-muted"}`}
                        >
                          light_mode
                        </span>
                        <span
                          className={`font-label-md text-label-md ${preferences.theme === "light" ? "text-primary" : "text-text-muted"}`}
                        >
                          Light
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
