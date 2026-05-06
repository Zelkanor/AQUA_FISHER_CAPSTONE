import { useState, useEffect, useRef, useCallback } from "react";

const ACCENT = "#00E5FF";
const ACCENT2 = "#00BFA5";
const DEEP = "#0A1628";
const SURFACE = "rgba(10, 22, 40, 0.85)";
const GLASS = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";
const TEXT_PRIMARY = "rgba(255,255,255,0.95)";
const TEXT_SECONDARY = "rgba(255,255,255,0.55)";
const TEXT_MUTED = "rgba(255,255,255,0.3)";

// ─── Particle Canvas Background ───
function ParticleBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1),
      o: Math.random() * 0.5 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${p.o})`;
        ctx.fill();
      });
      // connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,229,255,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ─── Animated Ring / Pulse ───
function PulseRing({ size = 200, color = ACCENT }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `1px solid ${color}`,
          opacity: 0.3 - i * 0.08,
          animation: `pulse-ring 3s ease-out ${i * 0.8}s infinite`,
        }} />
      ))}
      <style>{`@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.4; } 100% { transform: scale(1.6); opacity: 0; } }`}</style>
    </div>
  );
}

// ─── Glowing status dot ───
function StatusDot({ status }) {
  const colors = { Normal: "#00E676", Caution: "#FFD600", Critical: "#FF1744" };
  const c = colors[status] || colors.Normal;
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: c, boxShadow: `0 0 8px ${c}80`, marginRight: 8, flexShrink: 0,
    }} />
  );
}

// ─── Glass Card ───
function GlassCard({ children, style = {}, glow, onClick, hover = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: GLASS,
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        border: `1px solid ${hovered && hover ? "rgba(0,229,255,0.2)" : GLASS_BORDER}`,
        borderRadius: 16,
        padding: "24px",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered && hover ? "translateY(-2px)" : "none",
        boxShadow: glow ? `0 0 40px ${glow}15, inset 0 1px 0 rgba(255,255,255,0.05)` : "inset 0 1px 0 rgba(255,255,255,0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Animated Score Ring ───
function ScoreRing({ score = 0, size = 180, label }) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = () => {
      start += (score - start) * 0.05;
      if (Math.abs(score - start) < 0.5) { setAnimScore(score); return; }
      setAnimScore(Math.round(start));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * animScore) / 100;
  const color = score >= 70 ? "#00E676" : score >= 40 ? "#FFD600" : "#FF1744";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)", filter: `drop-shadow(0 0 12px ${color}60)` }}
        />
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill={TEXT_PRIMARY}
          fontSize="42" fontWeight="300" fontFamily="'Outfit', sans-serif"
          style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
          {animScore}
        </text>
      </svg>
      {label && <span style={{ fontSize: 13, color: TEXT_SECONDARY, letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>}
    </div>
  );
}

// ─── Water ripple loader ───
function WaterLoader({ text = "Analyzing..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "80px 0" }}>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `1.5px solid ${ACCENT}`,
            animation: `water-ripple 2.4s ease-out ${i * 0.5}s infinite`,
          }} />
        ))}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 8, height: 8, borderRadius: "50%", background: ACCENT,
          boxShadow: `0 0 20px ${ACCENT}80, 0 0 60px ${ACCENT}30`,
        }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: TEXT_PRIMARY, fontSize: 18, fontWeight: 300, margin: 0, letterSpacing: 1 }}>{text}</p>
        <p style={{ color: TEXT_MUTED, fontSize: 13, margin: "8px 0 0", letterSpacing: 3, textTransform: "uppercase" }}>
          Processing sensor data
        </p>
      </div>
      <style>{`@keyframes water-ripple { 0% { transform: scale(0.3); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }`}</style>
    </div>
  );
}

// ─── Typewriter text ───
function Typewriter({ text, speed = 30, style = {} }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <span style={style}>{displayed}<span style={{ opacity: 0.4, animation: "blink 1s step-end infinite" }}>|</span></span>;
}

// ─── MOCK ANALYSIS DATA ───
const MOCK_ANALYSIS = {
  report_title: "Dal Lake Water Quality Assessment",
  location: { name: "Dal Lake, Srinagar, J&K", coordinates: { latitude: 34.0837, longitude: 74.86 }, elevation_m: 1583, geographic_context: "Dal Lake is an urban freshwater lake in the heart of Srinagar at ~1,583m ASL. It spans roughly 18 km² and serves as a critical ecological, economic, and cultural resource for the Kashmir Valley. The lake has historically suffered from eutrophication driven by agricultural runoff, houseboat sewage, and encroachment." },
  overall_water_quality_index: { score: 62, category: "Moderate", summary: "The water quality of Dal Lake falls in the moderate range, indicating noticeable stress from nutrient loading and organic contamination. While dissolved oxygen levels support aquatic life, elevated turbidity and ammonia concentrations point to ongoing eutrophication. The lake remains below drinking water standards but meets basic recreational thresholds for most parameters." },
  parameter_analysis: [
    { parameter: "pH", unit: "—", stats: { min: 7.06, max: 8.65, mean: 7.82, std_dev: 0.36 }, status: "Normal", applicable_standard: "CPCB Class B: 6.5–8.5", compliance: "Compliant", interpretation: "The pH values are within the normal alkaline range expected for Dal Lake, consistent with carbonate-buffered systems at this altitude. Minor spatial variation suggests localized differences in biological activity.", health_implications: "pH levels are safe for aquatic organisms and human recreational contact." },
    { parameter: "Turbidity", unit: "NTU", stats: { min: 3.21, max: 32.47, mean: 18.04, std_dev: 5.89 }, status: "Caution", applicable_standard: "BIS IS 10500: ≤5 NTU (drinking)", compliance: "Non-compliant", interpretation: "Turbidity is significantly elevated above drinking water standards, though this is expected for an urban lake receiving multiple inflows. Higher values in the southern sampling points suggest sediment disturbance or algal density near shore.", health_implications: "High turbidity reduces light penetration, impairing photosynthesis and potentially harboring pathogens." },
    { parameter: "Dissolved Oxygen", unit: "mg/L", stats: { min: 3.84, max: 8.91, mean: 6.48, std_dev: 1.18 }, status: "Normal", applicable_standard: "CPCB Class B: ≥3 mg/L", compliance: "Compliant", interpretation: "DO levels are adequate for sustaining most freshwater fish species. The early-morning sampling window captures pre-photosynthetic minima, suggesting daytime values would be higher. Some samples near the 4 mg/L threshold warrant monitoring.", health_implications: "Current DO levels support aquatic biodiversity, though sustained dips below 4 mg/L could stress sensitive species." },
    { parameter: "Temperature", unit: "°C", stats: { min: 14.22, max: 20.78, mean: 17.49, std_dev: 1.53 }, status: "Normal", applicable_standard: "No specific standard", compliance: "Compliant", interpretation: "Water temperatures are consistent with early May conditions in Kashmir at this elevation. The ~6.5°C range across samples likely reflects depth variation at dip points and proximity to inflow channels.", health_implications: "Temperature range is optimal for the native cold-water fish assemblage of Kashmir lakes." },
    { parameter: "Conductivity", unit: "µS/cm", stats: { min: 220.15, max: 418.62, mean: 319.87, std_dev: 44.12 }, status: "Caution", applicable_standard: "Typical freshwater: 100–500 µS/cm", compliance: "Marginal", interpretation: "Conductivity values are in the upper range for freshwater systems, reflecting dissolved mineral and nutrient load. Higher readings correlate with GPS points near houseboat clusters, suggesting anthropogenic ion input.", health_implications: "Not directly harmful but indicates elevated total dissolved solids from multiple contamination pathways." },
    { parameter: "Ammonia (NH₃-N)", unit: "mg/L", stats: { min: 0.089, max: 0.791, mean: 0.448, std_dev: 0.147 }, status: "Caution", applicable_standard: "BIS IS 10500: ≤0.5 mg/L", compliance: "Marginal", interpretation: "Mean ammonia is near the BIS drinking water limit, with several samples exceeding it. This strongly suggests organic waste input from houseboats, agricultural runoff, and possibly inadequate sewage treatment in peripheral areas.", health_implications: "Elevated ammonia at these concentrations can cause gill damage in fish and indicates fecal contamination risk for human contact." },
    { parameter: "ORP", unit: "mV", stats: { min: 148.2, max: 278.5, mean: 210.6, std_dev: 29.8 }, status: "Normal", applicable_standard: "WHO Recreation: ≥200 mV ideal", compliance: "Marginal", interpretation: "ORP values indicate mildly oxidizing conditions overall, which is positive for microbial control. However, readings below 180 mV at some points suggest localized reducing conditions — potentially anoxic sediment pockets.", health_implications: "Adequate for general recreational safety, but low-ORP zones may support pathogen survival." },
  ],
  ecological_assessment: { trophic_state: "Eutrophic", trophic_justification: "Elevated turbidity, high nutrient indicators (ammonia, conductivity), and field-observed algal mats confirm eutrophic status consistent with decades of published research on Dal Lake.", biodiversity_impact: "The eutrophic state favors pollution-tolerant species over sensitive native fauna. Native Schizothorax fish populations are likely stressed.", algal_bloom_risk: "High" },
  contamination_analysis: { likely_pollution_sources: ["Houseboat sewage discharge", "Agricultural runoff from catchment", "Urban stormwater", "Floating garden (Rad) nutrient leaching", "Inadequate municipal sewage treatment"], nutrient_loading_assessment: "Nutrient loading is significant and consistent with chronic eutrophication patterns documented by LAWDA and CSIR-IITR studies.", organic_pollution_indicators: "Ammonia levels and ORP readings in the lower range confirm active organic decomposition in parts of the lake." },
  recommendations: {
    immediate_actions: ["Deploy floating aerators in low-DO zones near southern shore", "Increase sampling frequency to weekly during May–September algal bloom season", "Issue advisory for houseboat clusters to verify holding tank integrity"],
    monitoring_plan: ["Establish 3 permanent monitoring stations with telemetry buoys", "Add chlorophyll-a and total phosphorus sensors in next drone sortie", "Correlate readings with LAWDA monthly reports for trend analysis"],
    long_term_remediation: ["Complete interceptor sewage system around lake perimeter", "Enforce floating garden (Rad) removal in designated zones", "Restore Dachigam Nallah riparian buffer zone", "Implement constructed wetlands at major inflow points"]
  },
  regulatory_compliance_summary: { cpcb_class: "Class B (Bathing) — Partially compliant", bis_compliance_notes: "Fails turbidity standard; ammonia at margin. Not a potable source.", who_compliance_notes: "Meets basic recreational criteria; ORP marginal at some points.", overall_compliance: "Partially Compliant" },
  confidence_notes: "This assessment is based on a single morning sortie of 25 samples — a temporal snapshot. Diurnal DO variation, seasonal monsoon dilution, and winter stratification are not captured. Sensor accuracy is instrument-spec; no independent lab validation was performed."
};

// ─── Sensor Chip ───
function SensorChip({ label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
        padding: "6px 14px", borderRadius: 20,
        border: `1px solid ${hovered ? ACCENT : GLASS_BORDER}`,
        background: hovered ? `${ACCENT}12` : GLASS,
        color: hovered ? ACCENT : TEXT_MUTED,
        transition: "all 0.25s ease",
        cursor: "default",
        boxShadow: hovered ? `0 0 12px ${ACCENT}25` : "none",
      }}
    >
      {label}
    </span>
  );
}

// ─── MAIN APP ───
export default function AquaSentinel() {
  const [phase, setPhase] = useState("landing"); // landing | confirm | loading | dashboard
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [fadeIn, setFadeIn] = useState(true);
  const fileRef = useRef(null);

  const transition = useCallback((nextPhase, data) => {
    setFadeIn(false);
    setTimeout(() => {
      setPhase(nextPhase);
      if (data) setAnalysis(data);
      setFadeIn(true);
    }, 500);
  }, []);

  const handleFile = (file) => {
    if (file && file.name.toLowerCase().endsWith(".pdf")) {
      setFileName(file.name);
      setTimeout(() => transition("confirm"), 600);
    }
  };

  const handleConfirm = (confirmed) => {
    if (confirmed) {
      transition("loading");
      // Simulate API call — replace with actual fetch to /api/v1/analyze
      setTimeout(() => transition("dashboard", MOCK_ANALYSIS), 4000);
    } else {
      transition("landing");
      setFileName("");
    }
  };

  const handleReset = () => {
    transition("landing");
    setFileName("");
    setAnalysis(null);
  };

  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(170deg, ${DEEP} 0%, #0D1F3C 40%, #0A2A3C 70%, #081C28 100%)`,
      fontFamily: "'Outfit', sans-serif", color: TEXT_PRIMARY, overflow: "hidden", position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet" />
      <ParticleBackground />

      {/* ── Top Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,22,40,0.7)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${ACCENT}30, ${ACCENT2}30)`, border: `1px solid ${ACCENT}40`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: 2 }}>AQUA FISHER</span>
          <span style={{ fontSize: 10, color: ACCENT, background: `${ACCENT}15`, padding: "2px 8px", borderRadius: 4, letterSpacing: 1.5, marginLeft: 4 }}>v0.1</span>
        </div>
        {phase === "dashboard" && (
          <button onClick={handleReset} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
            color: TEXT_SECONDARY, padding: "8px 20px", cursor: "pointer", fontSize: 13, letterSpacing: 1,
            transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.target.style.borderColor = `${ACCENT}50`; e.target.style.color = ACCENT; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = TEXT_SECONDARY; }}
          >
            New Analysis
          </button>
        )}
      </nav>

      {/* ── Content ── */}
      <div style={{
        paddingTop: 64, minHeight: "100vh", position: "relative", zIndex: 1,
        opacity: fadeIn ? 1 : 0, transition: "opacity 0.5s ease",
      }}>

        {/* ════════ LANDING ════════ */}
        {phase === "landing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: "0 24px" }}>
            <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.15 }}>
              <PulseRing size={400} />
            </div>

            <p style={{ fontSize: 12, letterSpacing: 6, textTransform: "uppercase", color: ACCENT, marginBottom: 16, fontWeight: 400 }}>
              Drone-Powered Intelligence
            </p>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 200, textAlign: "center", lineHeight: 1.15, margin: "0 0 16px", maxWidth: 700 }}>
              Decode Your<br />
              <span style={{ fontWeight: 500, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Water Quality
              </span>
            </h1>
            <p style={{ color: TEXT_SECONDARY, fontSize: 16, maxWidth: 500, textAlign: "center", lineHeight: 1.7, margin: "0 0 48px", fontWeight: 300 }}>
              Upload your drone sensor data PDF and let our AI analyze pH, turbidity, dissolved oxygen, temperature, conductivity, ammonia, ORP, and GPS coordinates in seconds.
            </p>

            {/* Upload Zone */}
            <input ref={fileRef} id="pdf-upload" type="file" accept=".pdf" style={{ display: "none" }}
              onChange={e => handleFile(e.target.files[0])} />
            <label
              htmlFor="pdf-upload"
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              style={{
                width: "100%", maxWidth: 520, padding: "48px 40px",
                border: `2px dashed ${dragOver ? ACCENT : "rgba(255,255,255,0.12)"}`,
                borderRadius: 20, cursor: "pointer",
                background: dragOver ? `${ACCENT}08` : "rgba(255,255,255,0.02)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT2}15)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${ACCENT}25`,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <polyline points="9 15 12 12 15 15" />
                </svg>
              </div>
              {fileName ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: ACCENT }}>{fileName}</p>
                  <p style={{ fontSize: 12, color: TEXT_MUTED, margin: "6px 0 0" }}>PDF loaded successfully</p>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 15, fontWeight: 400, margin: 0 }}>Drop your sensor data PDF here</p>
                  <p style={{ fontSize: 13, color: TEXT_MUTED, margin: "6px 0 0" }}>or click to browse — supports .pdf</p>
                </div>
              )}
            </label>

            {/* Sensor chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 32, maxWidth: 500 }}>
              {["pH", "Turbidity", "DO", "Temperature", "Conductivity", "NH₃", "ORP", "GPS"].map((s) => (
                <SensorChip key={s} label={s} />
              ))}
            </div>
          </div>
        )}

        {/* ════════ LOCATION CONFIRM ════════ */}
        {phase === "confirm" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: "0 24px" }}>
            <GlassCard style={{ maxWidth: 480, width: "100%", textAlign: "center", padding: "48px 40px" }} glow={ACCENT} hover={false}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, margin: "0 auto 24px",
                background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT2}20)`, border: `1px solid ${ACCENT}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 8px" }}>Confirm survey location</h2>
              <p style={{ color: TEXT_SECONDARY, fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>
                We detected the following location from your sensor data. Is this correct?
              </p>

              <div style={{
                background: "rgba(0,229,255,0.04)", border: `1px solid ${ACCENT}20`, borderRadius: 12,
                padding: "20px", marginBottom: 32, textAlign: "left",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: TEXT_MUTED, letterSpacing: 1.5, textTransform: "uppercase" }}>Location</span>
                  <span style={{ fontSize: 14, fontWeight: 400 }}>Dal Lake, Srinagar, J&K</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: TEXT_MUTED, letterSpacing: 1.5, textTransform: "uppercase" }}>Coordinates</span>
                  <span style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 300, color: ACCENT }}>34.0837°N, 74.8600°E</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: TEXT_MUTED, letterSpacing: 1.5, textTransform: "uppercase" }}>Elevation</span>
                  <span style={{ fontSize: 14 }}>1,583 m ASL</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => handleConfirm(false)} style={{
                  flex: 1, padding: "14px", borderRadius: 12, border: `1px solid rgba(255,255,255,0.1)`,
                  background: "rgba(255,255,255,0.03)", color: TEXT_SECONDARY, cursor: "pointer",
                  fontSize: 14, fontWeight: 400, letterSpacing: 0.5, transition: "all 0.3s",
                  fontFamily: "'Outfit', sans-serif",
                }}
                  onMouseEnter={e => e.target.style.borderColor = "#FF174440"}
                  onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                >
                  No, go back
                </button>
                <button onClick={() => handleConfirm(true)} style={{
                  flex: 1, padding: "14px", borderRadius: 12, border: "none",
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: DEEP,
                  cursor: "pointer", fontSize: 14, fontWeight: 600, letterSpacing: 0.5,
                  transition: "all 0.3s", fontFamily: "'Outfit', sans-serif",
                  boxShadow: `0 4px 24px ${ACCENT}30`,
                }}
                  onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.target.style.transform = "none"}
                >
                  Yes, analyze
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ════════ LOADING ════════ */}
        {phase === "loading" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
            <WaterLoader text="Analyzing Dal Lake sensor data..." />
          </div>
        )}

        {/* ════════ DASHBOARD ════════ */}
        {phase === "dashboard" && analysis && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: ACCENT, margin: "0 0 8px" }}>Analysis Complete</p>
              <h1 style={{ fontSize: 32, fontWeight: 300, margin: "0 0 6px" }}>{analysis.report_title}</h1>
              <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                {analysis.location.name} — {analysis.location.coordinates.latitude}°N, {analysis.location.coordinates.longitude}°E — {analysis.location.elevation_m}m ASL
              </p>
            </div>

            {/* WQI + Summary Row */}
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, marginBottom: 24 }}>
              <GlassCard style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }} glow={ACCENT}>
                <ScoreRing score={analysis.overall_water_quality_index.score} label={analysis.overall_water_quality_index.category} />
              </GlassCard>
              <GlassCard hover={false}>
                <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: ACCENT, margin: "0 0 16px" }}>Executive Summary</p>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: TEXT_SECONDARY, margin: 0, fontWeight: 300 }}>
                  {analysis.overall_water_quality_index.summary}
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "rgba(255,214,0,0.1)", color: "#FFD600", letterSpacing: 1 }}>
                    {analysis.regulatory_compliance_summary.overall_compliance}
                  </span>
                  <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "rgba(255,23,68,0.1)", color: "#FF6E6E", letterSpacing: 1 }}>
                    {analysis.ecological_assessment.trophic_state}
                  </span>
                  <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "rgba(255,23,68,0.1)", color: "#FF6E6E", letterSpacing: 1 }}>
                    Algal Bloom Risk: {analysis.ecological_assessment.algal_bloom_risk}
                  </span>
                </div>
              </GlassCard>
            </div>

            {/* Parameter Cards Grid */}
            <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: ACCENT, margin: "32px 0 16px" }}>Parameter Analysis</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 24 }}>
              {analysis.parameter_analysis.map((p, i) => (
                <GlassCard key={i} style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <StatusDot status={p.status} />
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{p.parameter}</span>
                      {p.unit !== "—" && <span style={{ fontSize: 11, color: TEXT_MUTED, marginLeft: 6 }}>({p.unit})</span>}
                    </div>
                    <span style={{
                      fontSize: 10, padding: "3px 10px", borderRadius: 4, letterSpacing: 1.5, textTransform: "uppercase",
                      background: p.compliance === "Compliant" ? "rgba(0,230,118,0.1)" : p.compliance === "Non-compliant" ? "rgba(255,23,68,0.1)" : "rgba(255,214,0,0.1)",
                      color: p.compliance === "Compliant" ? "#00E676" : p.compliance === "Non-compliant" ? "#FF6E6E" : "#FFD600",
                    }}>{p.compliance}</span>
                  </div>

                  {/* Stats bar */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
                    {[["Min", p.stats.min], ["Max", p.stats.max], ["Mean", p.stats.mean], ["σ", p.stats.std_dev]].map(([lbl, val]) => (
                      <div key={lbl} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: TEXT_MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{lbl}</div>
                        <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>{typeof val === "number" ? val.toFixed(2) : val}</div>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 12, color: TEXT_SECONDARY, lineHeight: 1.7, margin: "0 0 8px" }}>{p.interpretation}</p>
                  <p style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{p.health_implications}</p>
                  <div style={{ marginTop: 10, fontSize: 10, color: TEXT_MUTED, letterSpacing: 0.5 }}>
                    Standard: {p.applicable_standard}
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Ecological + Contamination Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: ACCENT, margin: "16px 0 12px" }}>Ecological Assessment</p>
                <GlassCard hover={false}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{
                      fontSize: 22, fontWeight: 300, color: "#FF6E6E",
                    }}>{analysis.ecological_assessment.trophic_state}</span>
                  </div>
                  <p style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.7, margin: "0 0 12px" }}>{analysis.ecological_assessment.trophic_justification}</p>
                  <p style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.6, margin: "0 0 8px" }}>{analysis.ecological_assessment.biodiversity_impact}</p>
                </GlassCard>
              </div>
              <div>
                <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: ACCENT, margin: "16px 0 12px" }}>Contamination Sources</p>
                <GlassCard hover={false}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {analysis.contamination_analysis.likely_pollution_sources.map((src, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, opacity: 0.6, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>{src}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.6, margin: "16px 0 0" }}>{analysis.contamination_analysis.nutrient_loading_assessment}</p>
                </GlassCard>
              </div>
            </div>

            {/* Recommendations */}
            <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: ACCENT, margin: "16px 0 12px" }}>Recommendations</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { title: "Immediate Actions", items: analysis.recommendations.immediate_actions, color: "#FF6E6E", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8" },
                { title: "Monitoring Plan", items: analysis.recommendations.monitoring_plan, color: "#FFD600", icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z" },
                { title: "Long-term Remediation", items: analysis.recommendations.long_term_remediation, color: "#00E676", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9 12l2 2 4-4" },
              ].map(({ title, items, color, icon }) => (
                <GlassCard key={title} hover={false} style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: 1 }}>{title}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'JetBrains Mono', monospace", marginTop: 2, flexShrink: 0 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.6 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Heatmap Placeholder */}
            <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: ACCENT, margin: "32px 0 12px" }}>Spatial Heatmap</p>
            <GlassCard hover={false} style={{
              padding: 0, overflow: "hidden", minHeight: 400,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `linear-gradient(135deg, rgba(0,229,255,0.02), rgba(0,191,165,0.02))`,
              position: "relative",
            }}>
              {/* Decorative grid lines */}
              <svg width="100%" height="400" style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 20} x2="100%" y2={i * 20} stroke={ACCENT} strokeWidth="0.5" />
                ))}
                {Array.from({ length: 40 }, (_, i) => (
                  <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="400" stroke={ACCENT} strokeWidth="0.5" />
                ))}
              </svg>

              <div style={{ textAlign: "center", zIndex: 1 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18, margin: "0 auto 20px",
                  background: `linear-gradient(135deg, ${ACCENT}10, ${ACCENT2}10)`, border: `1px dashed ${ACCENT}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 400, margin: "0 0 6px", color: TEXT_SECONDARY }}>Heatmap integration coming soon</p>
                <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0, maxWidth: 400 }}>
                  Spatial parameter distribution across GPS coordinates will render here
                </p>
              </div>
            </GlassCard>

            {/* Confidence Notes */}
            <div style={{
              marginTop: 32, padding: "16px 20px", borderRadius: 12,
              border: `1px solid rgba(255,214,0,0.15)`, background: "rgba(255,214,0,0.03)",
            }}>
              <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#FFD600", margin: "0 0 8px" }}>Confidence Notes</p>
              <p style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.7, margin: 0 }}>{analysis.confidence_notes}</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        ::selection { background: ${ACCENT}40; color: white; }
      `}</style>
    </div>
  );
}