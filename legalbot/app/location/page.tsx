"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Scale, Shield, Building2, Users, Loader2, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const mockServices = {
  lawyers: [
    { name: "Sharma & Associates", type: "Law Firm", distance: "0.5 km", address: "123 MG Road, Bangalore", phone: "+91 80 2345 6789", rating: 4.8 },
    { name: "Legal Aid Society", type: "Legal Aid", distance: "1.2 km", address: "45 Brigade Road, Bangalore", phone: "+91 80 3456 7890", rating: 4.6 },
    { name: "Kumar Law Chambers", type: "Law Firm", distance: "2.1 km", address: "78 Residency Road, Bangalore", phone: "+91 80 4567 8901", rating: 4.5 },
  ],
  police: [
    { name: "Cubbon Park Police Station", type: "Police", distance: "0.8 km", address: "Cubbon Park, Bangalore", phone: "100", rating: null },
    { name: "Brigade Road Police Station", type: "Police", distance: "1.5 km", address: "Brigade Road, Bangalore", phone: "100", rating: null },
    { name: "Shivajinagar Police Station", type: "Police", distance: "2.3 km", address: "Shivajinagar, Bangalore", phone: "100", rating: null },
  ],
  courts: [
    { name: "City Civil Court", type: "Court", distance: "1.1 km", address: "Court Road, Bangalore", phone: "+91 80 2286 0001", rating: null },
    { name: "High Court of Karnataka", type: "High Court", distance: "2.8 km", address: "High Court Road, Bangalore", phone: "+91 80 2235 0001", rating: null },
    { name: "Family Court", type: "Court", distance: "3.2 km", address: "Sheshadri Road, Bangalore", phone: "+91 80 2286 0002", rating: null },
  ],
  legalAid: [
    { name: "District Legal Services Authority", type: "Legal Aid", distance: "1.4 km", address: "Court Complex, Bangalore", phone: "15100", rating: 4.7 },
    { name: "NALSA Help Center", type: "Legal Aid", distance: "2.0 km", address: "Vidhana Soudha, Bangalore", phone: "15100", rating: 4.8 },
    { name: "Karnataka Legal Aid", type: "Legal Aid", distance: "3.5 km", address: "Rajbhavan Road, Bangalore", phone: "+91 80 2235 0003", rating: 4.5 },
  ],
};

const tabs = [
  { key: "lawyers", label: "Lawyers", icon: Users, color: "from-purple-500 to-blue-500" },
  { key: "police", label: "Police Stations", icon: Shield, color: "from-blue-500 to-cyan-500" },
  { key: "courts", label: "Courts", icon: Scale, color: "from-yellow-500 to-amber-500" },
  { key: "legalAid", label: "Legal Aid", icon: Building2, color: "from-green-500 to-emerald-500" },
];

export default function LocationPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("lawyers");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("Bangalore, Karnataka");

  const detectLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
        },
        () => {
          setLoading(false);
          alert("Location access denied. Showing default results for Bangalore.");
        }
      );
    } else {
      setLoading(false);
    }
  };

  const services = mockServices[activeTab as keyof typeof mockServices];

  const openMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, "_blank");
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">{t("location")}</h1>
        <p className="text-gray-400">Find lawyers, courts, police stations, and legal aid centers near you</p>
      </motion.div>

      {/* Location Bar */}
      <div className="glass rounded-2xl border border-white/10 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-sm text-gray-400">Current Location</p>
            <p className="font-medium text-white">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : locationName}</p>
          </div>
        </div>
        <button onClick={detectLocation} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          {loading ? "Detecting..." : t("findNearby")}
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {tabs.map(({ key, label, icon: Icon, color }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 p-3 rounded-xl transition-all ${activeTab === key ? `bg-gradient-to-r ${color} text-white` : "glass text-gray-300 hover:bg-white/10 border border-white/10"}`}>
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Map Placeholder */}
      <div className="glass rounded-2xl border border-white/10 mb-6 overflow-hidden" style={{ height: "200px" }}>
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20 relative">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Interactive map • {locationName}</p>
            <button onClick={() => window.open(`https://www.google.com/maps/search/lawyers+near+me`, "_blank")}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto">
              Open in Google Maps <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          {/* Decorative dots */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-40"
              style={{ left: `${15 + i * 10}%`, top: `${20 + (i % 3) * 25}%` }} />
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl border border-white/10 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tabs.find(t => t.key === activeTab)?.color} flex items-center justify-center flex-shrink-0`}>
                {(() => { const Icon = tabs.find(t => t.key === activeTab)?.icon || MapPin; return <Icon className="w-5 h-5 text-white" />; })()}
              </div>
              <div>
                <h3 className="font-semibold text-white">{service.name}</h3>
                <p className="text-sm text-gray-400">{service.type} • {service.address}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-blue-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{service.distance}
                  </span>
                  <span className="text-xs text-gray-500">{service.phone}</span>
                  {service.rating && <span className="text-xs text-yellow-400">★ {service.rating}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a href={`tel:${service.phone}`}
                className="p-2 glass rounded-lg text-green-400 hover:bg-green-500/10 border border-white/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </a>
              <button onClick={() => openMaps(service.address)}
                className="p-2 glass rounded-lg text-blue-400 hover:bg-blue-500/10 border border-white/10 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
