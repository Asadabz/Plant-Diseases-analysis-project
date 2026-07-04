import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Cpu, Leaf, ShieldAlert, Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { modelClasses, TOTAL_MODEL_CLASSES } from "@/lib/modelClasses";

const categoryCfg = {
  Healthy: { color: "hsl(145 65% 36%)", bg: "hsl(145 55% 95%)", border: "hsl(145 45% 82%)", icon: Leaf },
  Disease: { color: "hsl(0 65% 46%)", bg: "hsl(0 60% 96%)", border: "hsl(0 45% 85%)", icon: ShieldAlert },
  Decorative: { color: "hsl(270 55% 46%)", bg: "hsl(270 50% 96%)", border: "hsl(270 40% 85%)", icon: Sparkles },
} as const;

export default function ModelInfo() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Healthy" | "Disease" | "Decorative">("All");

  const filtered = useMemo(() => {
    return modelClasses.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || c.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const counts = useMemo(() => {
    return {
      Healthy: modelClasses.filter((c) => c.category === "Healthy").length,
      Disease: modelClasses.filter((c) => c.category === "Disease").length,
      Decorative: modelClasses.filter((c) => c.category === "Decorative").length,
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="hero-bg px-6 md:px-10 py-12 relative z-0">
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-4"
            style={{ background: "hsl(145 65% 44% / 0.2)", border: "1px solid hsl(145 65% 44% / 0.35)", color: "hsl(145 65% 72%)" }}
          >
            <Cpu className="w-3.5 h-3.5" />
            Model Info
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2"
          >
            Trained on{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{ color: "hsl(145 65% 58%)" }}
              className="inline-block"
            >
              {TOTAL_MODEL_CLASSES}
            </motion.span>{" "}
            Classes
          </motion.h1>
          <p className="text-base mb-7" style={{ color: "hsl(140 15% 65%)" }}>
            A MobileNetV2 model fine-tuned to recognize plant diseases, healthy leaves, and common decorative houseplants.
          </p>

          {/* Stat pills */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-3 mb-7">
            {(["Healthy", "Disease", "Decorative"] as const).map((cat, i) => {
              const cfg = categoryCfg[cat];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-medium"
                  style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.85)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: cat === "Disease" ? "hsl(0 70% 65%)" : cat === "Decorative" ? "hsl(270 60% 72%)" : "hsl(145 65% 58%)" }} />
                  <span className="font-extrabold text-white text-base">{counts[cat]}</span>
                  <span style={{ color: "rgba(255,255,255,0.52)" }}>{cat} classes</span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(142 18% 50%)" }} />
            <Input
              placeholder="Search classes..."
              className="pl-11 h-12 rounded-2xl text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(255,255,255,0.3)", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-model-classes"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {(["All", "Healthy", "Disease", "Decorative"] as const).map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-150"
                style={
                  active
                    ? { background: "hsl(145 72% 30%)", color: "white" }
                    : { background: "hsl(144 25% 95%)", color: "hsl(142 18% 42%)", border: "1px solid hsl(142 20% 86%)" }
                }
                data-testid={`filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            );
          })}
          <span className="text-sm font-semibold ml-auto" style={{ color: "hsl(142 18% 40%)" }}>
            {filtered.length} of {TOTAL_MODEL_CLASSES} classes
          </span>
        </div>

        {/* Animated grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((c, i) => {
            const cfg = categoryCfg[c.category];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.6), duration: 0.3 }}
                whileHover={{ scale: 1.04, y: -2 }}
                className="rounded-2xl p-3.5 flex items-center gap-2.5 cursor-default"
                style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
                data-testid={`chip-class-${c.name.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.7)" }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                </div>
                <span className="text-xs font-bold leading-tight" style={{ color: "hsl(150 30% 14%)" }}>
                  {c.name}
                </span>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)", border: "2px dashed hsl(142 22% 80%)" }}>
            <Search className="w-12 h-12 mx-auto mb-4" style={{ color: "hsl(142 20% 70%)" }} />
            <p className="font-bold mb-1" style={{ color: "hsl(142 25% 28%)" }}>No classes found</p>
            <p className="text-sm" style={{ color: "hsl(142 15% 48%)" }}>Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}