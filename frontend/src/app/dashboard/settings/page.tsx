"use client";
import React, { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Trash2,
  Save,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const SettingsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    profile: {
      name: "Musa Kannike",
      email: "musa@example.com",
      timezone: "UTC",
    },
    notifications: {
      emailNotifications: true,
      quizReminders: true,
      studyStreaks: false,
      weeklyReports: true,
    },
    privacy: {
      dataCollection: true,
      analytics: false,
      shareProgress: false,
    },
    appearance: {
      theme: "light",
      language: "en",
      compactMode: false,
    },
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    alert("Settings saved successfully!");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // In a real app, this would call the delete account API
      logout();
      router.push("/");
    }
  };

  const handleExportData = () => {
    // In a real app, this would export user data
    alert("Data export will be sent to your email address.");
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "privacy", name: "Privacy", icon: Shield },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "data", name: "Data", icon: Database },
  ];

  return (
    <div className="min-h-screen flex overflow-x-hidden w-full py-2 lg:py-4">
      <Sidebar />
      <main className="flex-1 mx-auto overflow-y-auto bg-white border border-gray-200 lg:rounded-lg">
        <div className="flex h-full">
          {/* Settings Sidebar */}
          <div className="w-64 border-r border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Settings className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon size={20} />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-8">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
                  <p className="text-gray-600">Manage your account information</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => handleSettingChange("profile", "name", e.target.value)}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleSettingChange("profile", "email", e.target.value)}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.profile.timezone}
                      onChange={(e) => handleSettingChange("profile", "timezone", e.target.value)}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Settings</h2>
                  <p className="text-gray-600">Choose what notifications you want to receive</p>
                </div>

                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {key === "emailNotifications" && "Receive email notifications for important updates"}
                          {key === "quizReminders" && "Get reminded when you have pending quizzes"}
                          {key === "studyStreaks" && "Celebrate your study streaks and milestones"}
                          {key === "weeklyReports" && "Receive weekly progress reports"}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleSettingChange("notifications", key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
                  <p className="text-gray-600">Control your privacy and data sharing preferences</p>
                </div>

                <div className="space-y-4">
                  {Object.entries(settings.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {key === "dataCollection" && "Allow us to collect usage data to improve the service"}
                          {key === "analytics" && "Share anonymous analytics to help us understand user behavior"}
                          {key === "shareProgress" && "Allow others to see your learning progress and achievements"}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleSettingChange("privacy", key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Appearance Settings</h2>
                  <p className="text-gray-600">Customize how Synapse looks and feels</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <div className="flex space-x-4">
                      {["light", "dark", "auto"].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => handleSettingChange("appearance", "theme", theme)}
                          className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                            settings.appearance.theme === theme
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.appearance.language}
                      onChange={(e) => handleSettingChange("appearance", "language", e.target.value)}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium text-gray-900">Compact Mode</h3>
                      <p className="text-sm text-gray-600">Use a more compact interface with smaller spacing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.appearance.compactMode}
                        onChange={(e) => handleSettingChange("appearance", "compactMode", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Management</h2>
                  <p className="text-gray-600">Manage your data and account</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Download className="w-6 h-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-2">Export Your Data</h3>
                        <p className="text-blue-700 text-sm mb-4">
                          Download a copy of all your data including documents, chats, topics, and quiz results.
                        </p>
                        <button
                          onClick={handleExportData}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Trash2 className="w-6 h-6 text-red-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
                        <p className="text-red-700 text-sm mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-semibold transition-colors"
              >
                <Save size={20} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
