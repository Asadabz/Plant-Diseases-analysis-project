import { useState, useRef } from "react";
import { Upload, Activity, CheckCircle, RotateCcw, AlertTriangle, ShieldAlert, Leaf, Zap, Microscope, CloudUpload, ArrowDown, Camera } from "lucide-react";
import heroPng from "@/assets/hero-plant.png";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeLeaf, DetectionResult } from "@/lib/detection";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 15, 88)), 200);
    try {
      const res = await analyzeLeaf(f);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => { setResult(res); setIsAnalyzing(false); }, 350);
    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setProgress(0);
      setError(err instanceof Error ? err.message : "Something went wrong. Is the API running?");
    }
  };

  const handleReset = () => {
    setFile(null); setPreview(null); setResult(null);
    setIsAnalyzing(false); setProgress(0); setError(null);
  };

  const sev = {
    Severe:   { label: "bg-red-500/15 text-red-600 border-red-300",    dot: "bg-red-500",    glow: "hsl(0 74% 46% / 0.12)" },
    Moderate: { label: "bg-amber-500/15 text-amber-700 border-amber-300", dot: "bg-amber-500", glow: "hsl(38 90% 46% / 0.12)" },
    Mild:     { label: "bg-yellow-400/15 text-yellow-700 border-yellow-300", dot: "bg-yellow-500", glow: "hsl(48 90% 46% / 0.10)" },
  };

  const stats = [
    { icon: Microscope,    value: "12+",  label: "Diseases in database" },
    { icon: Zap,           value: "< 3-4 Sec", label: "Analysis time" },
    { icon: CheckCircle,   value: "75-90%",  label: "Detection accuracy" },
  ];

  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────── */}
      <div className="hero-bg relative z-0" style={{ minHeight: "520px" }}>

        {/* Realistic plant photo — right side */}
        <div className="absolute right-0 top-0 h-full w-[55%] pointer-events-none select-none overflow-hidden">
          {/* Fade left so text stays readable */}
          <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to right, hsl(152 65% 10%) 0%, hsl(152 65% 10% / 0.6) 30%, transparent 70%)" }} />
          {/* Fade bottom */}
          <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to top, hsl(152 65% 10%) 0%, transparent 40%)" }} />
          <img
            src={heroPng}
            alt=""
            className="absolute right-0 top-0 h-full w-full object-cover object-left"
            style={{ opacity: 0.45 }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 pt-16 pb-20 flex flex-col gap-6">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
              style={{ background: "hsl(145 65% 44% / 0.2)", border: "1px solid hsl(145 65% 44% / 0.35)", color: "hsl(145 65% 72%)" }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              AI-Powered Leaf Analysis — No Account Needed
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-5">
              Detect Plant Diseases<br />
              <span style={{ color: "hsl(145 65% 58%)" }}>in Seconds</span>
            </h1>
            <p className="text-base md:text-xl max-w-xl leading-relaxed" style={{ color: "hsl(140 15% 68%)" }}>
              Upload a leaf photo and get an instant diagnosis — disease name, severity score, affected area, and a full treatment plan — powered by AI.
            </p>
          </motion.div>

          {/* Stat pills */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="flex flex-wrap gap-3">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.85)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "hsl(145 65% 58%)" }} />
                <span className="font-extrabold text-white text-base">{value}</span>
                <span style={{ color: "rgba(255,255,255,0.52)" }}>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Arrow nudge */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-2 mt-4">
            <ArrowDown className="w-4 h-4 animate-bounce" style={{ color: "hsl(145 60% 56%)" }} />
            <span className="text-sm font-medium" style={{ color: "hsl(140 15% 58%)" }}>Upload below to get started</span>
          </motion.div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 space-y-10">

        {/* ── UPLOAD ZONE ── */}
        {!file && (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <div
              className="relative rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden"
              style={
                dragOver
                  ? { border: "2px dashed hsl(145 72% 38%)", background: "hsl(145 50% 95%)", boxShadow: "0 0 0 6px hsl(145 72% 38% / 0.08)" }
                  : { border: "2px dashed hsl(142 22% 74%)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }
              }
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
              data-testid="upload-zone"
            >
              <input
                type="file" ref={fileInputRef} className="hidden" accept="image/*"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                data-testid="input-file-upload"
              />
              <input
                type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                data-testid="input-camera-capture"
              />

              {/* Main drop area */}
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <motion.div
                  animate={dragOver ? { scale: 1.12, rotate: 4 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-28 h-28 rounded-3xl mb-8 flex items-center justify-center relative"
                  style={{
                    background: "linear-gradient(145deg, hsl(145 65% 90%) 0%, hsl(145 50% 82%) 100%)",
                    border: "2px solid hsl(145 55% 74%)",
                    boxShadow: "0 8px 32px hsl(145 65% 32% / 0.18)",
                  }}
                >
                  <CloudUpload className="w-12 h-12" style={{ color: "hsl(145 72% 28%)" }} />
                </motion.div>

                <h3 className="text-2xl font-extrabold mb-3" style={{ color: "hsl(150 50% 8%)" }}>
                  Drop your leaf photo here
                </h3>
                <p className="text-base mb-2 max-w-sm" style={{ color: "hsl(142 18% 40%)" }}>
                  Drag & drop or browse. Supports JPG, PNG, WebP.
                </p>
                <p className="text-sm mb-8 max-w-xs" style={{ color: "hsl(142 15% 52%)" }}>
                  For best results: center the leaf, use natural daylight, plain background.
                </p>

                <div className="flex gap-3">
                  <button
                    className="px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-150 hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, hsl(145 72% 30%) 0%, hsl(130 65% 24%) 100%)",
                      boxShadow: "0 6px 20px hsl(145 72% 28% / 0.38)",
                    }}
                    data-testid="button-browse-files"
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Browse Files
                  </button>

                  <button
                    className="px-6 py-4 rounded-2xl font-bold text-base flex items-center gap-2 transition-all duration-150 hover:scale-105 active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      border: "2px solid hsl(145 55% 60%)",
                      color: "hsl(145 72% 24%)",
                    }}
                    data-testid="button-camera-capture"
                    onClick={e => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  >
                    <Camera className="w-5 h-5" /> Take Photo 🌿
                  </button>
                </div>
              </div>

              {/* Tip strip */}
              <div
                className="flex items-center justify-center gap-8 px-8 py-4"
                style={{ borderTop: "1px dashed hsl(142 22% 82%)", background: "hsl(144 25% 97%)" }}
              >
                {[
                  { icon: Leaf, text: "Clear, focused leaf image" },
                  { icon: Zap, text: "Results in under 3 seconds" },
                  { icon: CheckCircle, text: "No account required" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm" style={{ color: "hsl(142 18% 44%)" }}>
                    <Icon className="w-4 h-4" style={{ color: "hsl(145 65% 36%)" }} />
                    <span className="font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ANALYSIS LAYOUT ── */}
        {file && (
          <div className="grid md:grid-cols-[340px_1fr] gap-7 items-start">

            {/* Image card */}
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  aspectRatio: "1",
                  border: "2px solid hsl(142 22% 80%)",
                  boxShadow: "0 10px 40px hsl(145 50% 15% / 0.14)",
                }}
              >
                {preview && <img src={preview} alt="Leaf sample" className="w-full h-full object-cover" />}

                {isAnalyzing && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-8"
                    style={{ background: "linear-gradient(180deg, hsl(152 65% 5% / 0.88) 0%, hsl(145 55% 10% / 0.92) 100%)", backdropFilter: "blur(6px)" }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-18 h-18 rounded-full flex items-center justify-center mb-5"
                      style={{ background: "hsl(145 65% 44% / 0.2)", border: "2px solid hsl(145 65% 52%)", width: "72px", height: "72px" }}
                    >
                      <Activity className="w-8 h-8" style={{ color: "hsl(145 65% 62%)" }} />
                    </motion.div>
                    <p className="font-extrabold text-white text-base mb-1">Analyzing Sample</p>
                    <p className="text-sm mb-6 font-mono" style={{ color: "hsl(140 20% 56%)" }}>Running pathogen scan...</p>
                    <div className="w-full space-y-2">
                      <Progress value={progress} className="h-2.5 rounded-full" />
                      <p className="text-xs text-right font-mono font-bold" style={{ color: "hsl(145 65% 58%)" }}>{Math.round(progress)}%</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: "hsl(0 70% 96%)", border: "1.5px solid hsl(0 60% 84%)" }}
                  data-testid="error-banner"
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm mb-0.5" style={{ color: "hsl(0 60% 30%)" }}>Could not complete scan</p>
                    <p className="text-sm" style={{ color: "hsl(0 40% 38%)" }}>{error}</p>
                  </div>
                </motion.div>
              )}

              {(result || error) && (
                <button
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 transition-all duration-150 hover:scale-[1.02] active:scale-95"
                  style={{ borderColor: "hsl(145 72% 28%)", color: "hsl(145 72% 24%)", background: "hsl(145 55% 96%)" }}
                  onClick={handleReset}
                  data-testid="button-reset"
                >
                  <RotateCcw className="w-4 h-4" /> {error ? "Try Again" : "Analyze Another Leaf"}
                </button>
              )}
            </motion.div>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                  className="space-y-5"
                  data-testid="results-panel"
                >
                  {/* Result banner */}
                  <div
                    className="rounded-3xl p-6 relative overflow-hidden"
                    style={
                      result.isHealthy
                        ? { background: "linear-gradient(135deg, hsl(145 65% 92%) 0%, hsl(130 55% 88%) 100%)", border: "1.5px solid hsl(145 55% 76%)" }
                        : { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", border: "1.5px solid hsl(142 22% 82%)", boxShadow: `0 8px 32px ${sev[result.severity].glow}` }
                    }
                  >
                    <div className="flex items-start gap-4 mb-5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={result.isHealthy ? { background: "hsl(145 65% 44% / 0.2)" } : { background: "hsl(0 0% 98%)", border: "1px solid hsl(142 22% 84%)" }}
                      >
                        {result.isHealthy
                          ? <CheckCircle className="w-6 h-6" style={{ color: "hsl(145 72% 28%)" }} />
                          : result.severity === "Severe"
                            ? <AlertTriangle className="w-6 h-6 text-red-600" />
                            : <ShieldAlert className="w-6 h-6 text-amber-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-extrabold tracking-tight leading-tight mb-1.5" style={{ color: "hsl(150 50% 6%)" }}>
                          {result.diseaseName}
                        </h2>
                        <p className="text-sm leading-relaxed" style={{ color: "hsl(142 18% 36%)" }}>{result.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${result.isHealthy ? "bg-green-100 text-green-700 border-green-300" : sev[result.severity].label}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${result.isHealthy ? "bg-green-500" : sev[result.severity].dot}`} />
                        {result.isHealthy ? "Healthy" : result.severity}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: "hsl(145 65% 28% / 0.1)", border: "1px solid hsl(145 65% 28% / 0.2)", color: "hsl(145 72% 24%)" }}>
                        <Activity className="w-3 h-3" /> {(result.confidence * 100).toFixed(1)}% Confidence
                      </span>
                      {!result.isHealthy && result.affectedPlants.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold"
                          style={{ background: "hsl(142 18% 94%)", border: "1px solid hsl(142 18% 84%)", color: "hsl(142 25% 28%)" }}>
                          <Leaf className="w-3 h-3" /> Affects: {result.affectedPlants.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detail tabs */}
                  <div
                    className="rounded-3xl overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", border: "1.5px solid hsl(142 22% 82%)", boxShadow: "0 4px 24px hsl(145 50% 15% / 0.06)" }}
                  >
                    <Tabs defaultValue="diagnosis">
                      <div className="px-2 pt-2" style={{ borderBottom: "1px solid hsl(142 20% 88%)", background: "hsl(144 28% 97%)" }}>
                        <TabsList className="bg-transparent h-11 gap-0.5 p-0">
                          {["diagnosis", ...(result.isHealthy ? [] : ["treatment", "prevention"])].map(tab => (
                            <TabsTrigger
                              key={tab}
                              value={tab}
                              className="h-10 px-5 text-sm font-semibold rounded-t-xl rounded-b-none capitalize data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:text-primary"
                            >{tab}</TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      <div className="p-6">
                        <TabsContent value="diagnosis" className="m-0 space-y-5">
                          <h4 className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "hsl(142 18% 42%)" }}>Observed Symptoms</h4>
                          {result.isHealthy ? (
                            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "hsl(145 55% 94%)", border: "1px solid hsl(145 45% 84%)" }}>
                              <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "hsl(145 72% 32%)" }} />
                              <p className="text-sm font-medium" style={{ color: "hsl(145 45% 22%)" }}>No symptoms detected — leaf appears in excellent health.</p>
                            </div>
                          ) : (
                            <ul className="space-y-2.5">
                              {result.symptoms.map((sym, i) => (
                                <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                  className="flex items-start gap-3 p-3 rounded-xl text-sm" style={{ background: "hsl(144 22% 97%)", border: "1px solid hsl(142 18% 90%)" }}>
                                  <span className="w-5 h-5 rounded-lg shrink-0 flex items-center justify-center text-xs font-extrabold text-white mt-0.5"
                                    style={{ background: "hsl(145 72% 28%)" }}>{i + 1}</span>
                                  <span style={{ color: "hsl(150 30% 16%)" }}>{sym}</span>
                                </motion.li>
                              ))}
                            </ul>
                          )}
                          {!result.isHealthy && result.affectedPlants.length > 0 && (
                            <div>
                              <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "hsl(142 18% 42%)" }}>Commonly Affects</p>
                              <div className="flex flex-wrap gap-1.5">
                                {result.affectedPlants.map((p, i) => <Badge key={i} variant="secondary" className="text-xs rounded-full">{p}</Badge>)}
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="treatment" className="m-0 space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "hsl(142 18% 42%)" }}>Treatment Plan</h4>
                          {result.treatment.map((act, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                              className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "hsl(145 50% 96%)", border: "1px solid hsl(145 40% 88%)" }}>
                              <span className="w-6 h-6 rounded-xl shrink-0 flex items-center justify-center text-xs font-extrabold text-white"
                                style={{ background: "linear-gradient(135deg, hsl(145 72% 30%) 0%, hsl(130 60% 24%) 100%)" }}>{i + 1}</span>
                              <span className="text-sm" style={{ color: "hsl(150 30% 14%)" }}>{act}</span>
                            </motion.div>
                          ))}
                        </TabsContent>

                        <TabsContent value="prevention" className="m-0 space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "hsl(142 18% 42%)" }}>Prevention Guide</h4>
                          {result.prevention.map((prev, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                              className="flex items-start gap-3 text-sm" style={{ color: "hsl(150 30% 16%)" }}>
                              <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "hsl(145 65% 36%)" }} />
                              <span>{prev}</span>
                            </motion.div>
                          ))}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── HOW IT WORKS (only on empty state) ── */}
        {!file && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <h2 className="text-xl font-extrabold mb-6 text-center" style={{ color: "hsl(150 50% 8%)" }}>How It Works</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { n: "1", icon: Upload, title: "Upload Photo", desc: "Select or drop a clear leaf image" },
                { n: "2", icon: Activity, title: "AI Scans It", desc: "Pathogen patterns are matched instantly" },
                { n: "3", icon: Microscope, title: "Get Diagnosis", desc: "Disease name, severity & confidence" },
                { n: "4", icon: CheckCircle, title: "Take Action", desc: "Follow the treatment & prevention plan" },
              ].map(({ n, icon: Icon, title, desc }, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + i * 0.07 }}
                  className="flex flex-col items-center text-center p-6 rounded-3xl"
                  style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", border: "1.5px solid hsl(142 20% 84%)" }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, hsl(145 65% 30%) 0%, hsl(130 58% 24%) 100%)", boxShadow: "0 4px 14px hsl(145 65% 28% / 0.3)" }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: "hsl(145 55% 44%)" }}>Step {n}</span>
                  <h3 className="font-extrabold text-sm mb-1.5" style={{ color: "hsl(150 50% 8%)" }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(142 18% 42%)" }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}