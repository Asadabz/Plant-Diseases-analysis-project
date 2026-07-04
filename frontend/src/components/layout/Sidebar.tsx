import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ScanLine, LayoutGrid, Info, Sprout, Leaf, Cpu } from "lucide-react";

const links = [
  { href: "/", label: "Detection", icon: ScanLine, desc: "Upload & analyze" },
  { href: "/library", label: "Disease Library", icon: LayoutGrid, desc: "Browse pathogens" },
  { href: "/model-info", label: "Model Info", icon: Cpu, desc: "Trained classes" },
  { href: "/about", label: "About", icon: Info, desc: "How it works" },
];

export function Sidebar({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <aside
        className="w-full md:w-64 shrink-0 md:min-h-screen flex flex-col"
        style={{
          background: "linear-gradient(180deg, hsl(152 60% 7%) 0%, hsl(150 55% 10%) 100%)",
          borderRight: "1px solid hsl(152 55% 14%)",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3" style={{ borderBottom: "1px solid hsl(152 40% 14%)" }}>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 relative"
            style={{ background: "linear-gradient(135deg, hsl(145 65% 38%) 0%, hsl(130 60% 28%) 100%)" }}
          >
            <Sprout className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "0 0 16px hsl(145 65% 44% / 0.5)" }} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white leading-none block">FloraScan</span>
            <span className="text-xs font-medium" style={{ color: "hsl(140 20% 52%)" }}>Plant Disease AI</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          <p className="hidden md:block text-xs font-bold uppercase tracking-widest px-3 py-3" style={{ color: "hsl(140 15% 38%)" }}>Menu</p>
          {links.map(({ href, label, icon: Icon, desc }) => {
            const active = location === href;
            return (
              <Link key={href} href={href} className="block">
                <div
                  className="relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer group"
                  style={
                    active
                      ? { background: "hsl(145 65% 44% / 0.15)", border: "1px solid hsl(145 65% 44% / 0.25)" }
                      : { background: "transparent", border: "1px solid transparent" }
                  }
                  data-testid={`link-sidebar-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {active && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ background: "hsl(145 65% 52%)" }}
                    />
                  )}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                    style={
                      active
                        ? { background: "hsl(145 65% 44% / 0.3)", color: "hsl(145 65% 60%)" }
                        : { background: "hsl(152 40% 14%)", color: "hsl(140 15% 55%)" }
                    }
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="hidden md:block min-w-0">
                    <p
                      className="text-sm font-semibold leading-none mb-0.5"
                      style={{ color: active ? "hsl(145 65% 65%)" : "hsl(140 15% 78%)" }}
                    >
                      {label}
                    </p>
                    <p className="text-xs leading-none" style={{ color: "hsl(140 12% 42%)" }}>{desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom tip */}
        <div className="p-4 hidden md:block" style={{ borderTop: "1px solid hsl(152 40% 14%)" }}>
          <div
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(145 65% 44% / 0.12) 0%, hsl(130 55% 30% / 0.08) 100%)",
              border: "1px solid hsl(145 50% 44% / 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4" style={{ color: "hsl(145 60% 52%)" }} />
              <span className="text-sm font-bold text-white">Pro Tip</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(140 15% 55%)" }}>
              Photograph leaves in natural sunlight with a plain background for the highest detection accuracy.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}