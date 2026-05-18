import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Settings = () => {
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({
    name: currentUser?.fullname || "",
    email: currentUser?.email || "",
    bio: "I am a passionate learner!",
    language: "en",
    timezone: "UTC+05:30",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    updates: true,
    promo: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      alert("Profile updated successfully");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-300">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm">
          Manage your account settings and preferences.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Custom Tabs Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          {["profile", "notifications", "preferences"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-10">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="flex flex-col lg:flex-row gap-12">
              <form onSubmit={handleSave} className="flex-1 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase t mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase t mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase t mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows="4"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white resize-none"
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Profile Changes"}
                </button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              {[
                {
                  id: "email",
                  title: "Email Notifications",
                  desc: "Receive updates about account activity.",
                },
                {
                  id: "updates",
                  title: "Course Updates",
                  desc: "Get notified when new lessons are added.",
                },
                {
                  id: "promo",
                  title: "Promotional Content",
                  desc: "Special offers and newsletter updates.",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm t">{item.desc}</p>
                  </div>
                  {/* Custom Toggle Switch */}
                  <button
                    onClick={() => toggleNotification(item.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${notifications[item.id] ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${notifications[item.id] ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="max-w-md space-y-8">
              <div>
                <label className="block text-xs font-black uppercase t mb-3">
                  Preferred Language
                </label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white appearance-none">
                  <option value="en">English (US)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase t mb-3">
                  Time Zone
                </label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white appearance-none">
                  <option value="IST">India (GMT+5:30)</option>
                  <option value="UTC">Universal Time (UTC)</option>
                  <option value="EST">Eastern Time (EST)</option>
                </select>
              </div>
              <button className="px-8 py-3 bg-slate-800 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-slate-700 dark:hover:bg-blue-700 transition-all shadow-lg">
                Update Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
