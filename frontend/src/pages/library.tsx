import { useState } from "react";
import { diseases } from "@/lib/detection";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Leaf, AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { motion } from "framer-motion";

const sevCfg = {
  Severe: { badge: "bg-red-100 text-red-700 border-red-200", stripe: "from-red-500 to-rose-600", icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-600" },
  Moderate: { badge: "bg-amber-100 text-amber-700 border-amber-200", stripe: "from-amber-500 to-orange-500", icon: ShieldAlert, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  Mild: { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", stripe: "from-yellow-400 to-yellow-500", icon: Info, iconBg: "bg-yellow-50", iconColor: "text-yellow-600" },
};

export default function Library() {
  const [search, setSearch] = useState("");
  const filtered = diseases.filter(d =>
    !d.isHealthy && (
      d.diseaseName.toLowerCase().includes(search.toLowerCase()) ||
      d.affectedPlants.some(p => p.toLowerCase().includes(search.toLowerCase()))
    )
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="hero-bg px-6 md:px-10 py-12 relative z-0">
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Disease Library</h1>
          <p className="text-base mb-7" style={{ color: "hsl(140 15% 65%)" }}>
            Browse pathogens, understand symptoms, and find treatment protocols.
          </p>
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(142 18% 50%)" }} />
            <Input
              placeholder="Search by disease or plant name..."
              className="pl-11 h-12 rounded-2xl text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(255,255,255,0.3)", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search-library"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold" style={{ color: "hsl(142 18% 40%)" }}>
            {filtered.length} {filtered.length === 1 ? "disease" : "diseases"} found
          </p>
          <div className="flex items-center gap-4">
            {(["Severe", "Moderate", "Mild"] as const).map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${sevCfg[s].stripe}`} />
                <span className="text-xs font-medium" style={{ color: "hsl(142 15% 42%)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d, i) => {
            const cfg = sevCfg[d.severity];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={d.diseaseName}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-3xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 cursor-default"
                style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", border: "1.5px solid hsl(142 20% 84%)", boxShadow: "0 2px 12px hsl(145 40% 20% / 0.06)" }}
                data-testid={`card-disease-${d.diseaseName.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {/* Gradient stripe */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.stripe}`} />

                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                      <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-base leading-tight mb-1" style={{ color: "hsl(150 50% 6%)" }}>{d.diseaseName}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.badge}`}>
                        {d.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "hsl(142 18% 36%)" }}>{d.description}</p>

                  <div className="pt-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Leaf className="w-3.5 h-3.5" style={{ color: "hsl(145 65% 32%)" }} />
                        <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: "hsl(142 18% 42%)" }}>Affects</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {d.affectedPlants.slice(0, 3).map(p => <Badge key={p} variant="secondary" className="text-xs rounded-full font-medium">{p}</Badge>)}
                        {d.affectedPlants.length > 3 && <Badge variant="secondary" className="text-xs rounded-full font-medium">+{d.affectedPlants.length - 3}</Badge>}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl" style={{ background: "hsl(144 28% 96%)", border: "1px solid hsl(142 20% 90%)" }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "hsl(142 18% 44%)" }}>Key Symptom</p>
                      <p className="text-xs leading-relaxed" style={{ color: "hsl(150 30% 18%)" }}>{d.symptoms[0]}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)", border: "2px dashed hsl(142 22% 80%)" }}>
            <Search className="w-12 h-12 mx-auto mb-4" style={{ color: "hsl(142 20% 70%)" }} />
            <p className="font-bold mb-1" style={{ color: "hsl(142 25% 28%)" }}>No diseases found</p>
            <p className="text-sm" style={{ color: "hsl(142 15% 48%)" }}>Try a different disease name or plant type.</p>
          </div>
        )}
      </div>
    </div>
  );
}
