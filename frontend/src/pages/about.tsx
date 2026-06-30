import { ShieldCheck, Zap, Database, Smartphone, Leaf, ArrowRight, ScanLine } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const features = [
  { icon: Zap, title: "Instant Analysis", desc: "Results in under 3 seconds — catch pathogens before they spread across your entire crop.", color: "hsl(145 72% 28%)", bg: "hsl(145 65% 94%)", border: "hsl(145 55% 84%)" },
  { icon: Database, title: "12+ Disease Library", desc: "Comprehensive coverage of the most common plant diseases affecting vegetables, grains, and ornamentals.", color: "hsl(205 72% 38%)", bg: "hsl(205 65% 94%)", border: "hsl(205 55% 84%)" },
  { icon: ShieldCheck, title: "92% Accuracy Rate", desc: "High-confidence detection on clear, unobstructed leaf imagery photographed in natural lighting.", color: "hsl(38 85% 42%)", bg: "hsl(38 80% 94%)", border: "hsl(38 70% 84%)" },
  { icon: Smartphone, title: "Field-Ready", desc: "Optimized for mobile use — works efficiently even on slower field connections.", color: "hsl(0 65% 46%)", bg: "hsl(0 60% 95%)", border: "hsl(0 50% 86%)" },
];

const steps = [
  { n: "01", title: "Photograph the Leaf", desc: "Use natural daylight. The leaf should fill the frame with a plain, uncluttered background." },
  { n: "02", title: "Upload to FloraScan", desc: "Drag and drop or click to select your photo. JPEG, PNG, and WebP are all supported." },
  { n: "03", title: "AI Runs the Scan", desc: "The engine analyzes lesion shapes, chlorosis patterns, necrotic zones, and fungal textures." },
  { n: "04", title: "Read Your Diagnosis", desc: "Get disease name, confidence score, severity rating, and a full treatment and prevention protocol." },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="hero-bg px-6 md:px-10 py-14 relative z-0">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-4 h-4" style={{ color: "hsl(145 60% 56%)" }} />
            <span className="text-sm font-bold" style={{ color: "hsl(145 40% 60%)" }}>About FloraScan</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Built for the People<br /><span style={{ color: "hsl(145 65% 60%)" }}>Who Grow Our Food</span>
          </h1>
          <p className="text-base md:text-lg max-w-2xl leading-relaxed" style={{ color: "hsl(140 15% 65%)" }}>
            FloraScan combines botanical pathology data with instant visual feedback — giving farmers, agronomists, and gardeners the tools to diagnose plant disease before it becomes crop loss.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 space-y-14">
        {/* Features */}
        <section>
          <h2 className="text-2xl font-extrabold mb-1" style={{ color: "hsl(150 50% 7%)" }}>Why FloraScan</h2>
          <p className="text-sm mb-7" style={{ color: "hsl(142 18% 42%)" }}>Everything you need — nothing you don't.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="flex gap-4 p-5 rounded-3xl"
                  style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", border: `1.5px solid hsl(142 20% 84%)`, boxShadow: "0 2px 12px hsl(145 40% 20% / 0.05)" }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: f.bg, border: `1.5px solid ${f.border}` }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base mb-1" style={{ color: "hsl(150 50% 7%)" }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "hsl(142 18% 38%)" }}>{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Steps */}
        <section>
          <h2 className="text-2xl font-extrabold mb-1" style={{ color: "hsl(150 50% 7%)" }}>How It Works</h2>
          <p className="text-sm mb-7" style={{ color: "hsl(142 18% 42%)" }}>From photo to diagnosis in four steps.</p>
          <div className="relative space-y-4">
            <div className="absolute left-6 top-8 bottom-8 w-px hidden md:block" style={{ background: "linear-gradient(180deg, hsl(145 55% 76%) 0%, hsl(145 45% 88%) 100%)" }} />
            {steps.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-5 p-5 pl-6 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", border: "1.5px solid hsl(142 20% 84%)", boxShadow: "0 2px 12px hsl(145 40% 20% / 0.05)" }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-sm font-extrabold relative z-10"
                  style={{ background: "linear-gradient(135deg, hsl(145 65% 30%) 0%, hsl(130 58% 24%) 100%)", color: "white", boxShadow: "0 4px 12px hsl(145 65% 28% / 0.3)" }}>
                  {s.n}
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-base mb-1" style={{ color: "hsl(150 50% 7%)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(142 18% 38%)" }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, hsl(152 65% 10%) 0%, hsl(145 72% 18%) 50%, hsl(130 60% 22%) 100%)" }}
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, hsl(145 65% 44% / 0.2) 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-3xl mx-auto mb-5 flex items-center justify-center" style={{ background: "hsl(145 65% 44% / 0.2)", border: "1.5px solid hsl(145 65% 44% / 0.4)" }}>
              <ScanLine className="w-7 h-7" style={{ color: "hsl(145 65% 65%)" }} />
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2">Start Diagnosing Now</h3>
            <p className="text-sm mb-7" style={{ color: "hsl(140 15% 62%)" }}>Upload a leaf photo and get your first diagnosis in under 3 seconds.</p>
            <Link href="/">
              <a className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, hsl(145 65% 44%) 0%, hsl(130 60% 34%) 100%)", color: "white", boxShadow: "0 4px 20px hsl(145 65% 28% / 0.45)" }}>
                Go to Detection <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
