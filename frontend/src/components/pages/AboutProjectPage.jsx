import React from 'react';
import { 
  Target, 
  AlertOctagon, 
  Cpu, 
  Layers, 
  Database, 
  Atom, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight,
  Wind,
  Droplets,
  Clock,
  Sparkles,
  Server,
  Code2
} from 'lucide-react';
import { TEAM_MEMBERS, MENTOR_INFO, STATION_INFO } from '../../data/mockData';

export default function AboutProjectPage() {
  const architectureSteps = [
    { name: "OpenAQ", desc: "Live station feed", icon: Server, color: "text-[#36C5F0] bg-[#36C5F0]/15 border border-[#36C5F0]/30" },
    { name: "FastAPI", desc: "Asynchronous backend", icon: Cpu, color: "text-[#0D9B76] bg-[#0D9B76]/15 border border-[#0D9B76]/30" },
    { name: "Data Processing", desc: "Feature cleaning & lags", icon: Layers, color: "text-[#38BDF8] bg-[#38BDF8]/15 border border-[#38BDF8]/30" },
    { name: "CPCB AQI", desc: "Sub-index calculation", icon: CheckCircle2, color: "text-amber-400 bg-amber-500/15 border border-amber-500/30" },
    { name: "ML Model", desc: "LR + AQI Lags", icon: Sparkles, color: "text-[#36C5F0] bg-[#36C5F0]/15 border border-[#36C5F0]/30" },
    { name: "Prediction", desc: "Next-hour forecast (t+1)", icon: Clock, color: "text-[#0D9B76] bg-[#0D9B76]/15 border border-[#0D9B76]/30" },
    { name: "React Dashboard", desc: "Live visual console", icon: Code2, color: "text-[#38BDF8] bg-[#38BDF8]/15 border border-[#38BDF8]/30" },
  ];

  const techStack = [
    {
      category: "Frontend UI/UX",
      techs: ["React 19", "Vite", "Tailwind CSS", "Recharts", "Framer Motion", "Lucide Icons"],
      desc: "Responsive monitoring console with interactive telemetry gauges and data visualizations."
    },
    {
      category: "Inference Backend",
      techs: ["FastAPI", "Uvicorn ASGI", "Pydantic", "Joblib", "Python 3.12"],
      desc: "High-throughput asynchronous REST API serving live ingestion and ML inference."
    },
    {
      category: "Machine Learning",
      techs: ["Scikit-Learn", "NumPy & Pandas", "Autoregressive Lag Modeling", "Linear Regression"],
      desc: "Trained linear model with multi-hour lag autoregression achieving R² = 0.994."
    },
    {
      category: "Telemetry & Standards",
      techs: ["CPCB CAAQMS Protocol", "OpenAQ v3 API", "NAAQS 2009 Standards"],
      desc: "Continuous hourly criteria pollutant acquisition calibrated for Manali, Chennai."
    }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto text-slate-100">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0D9B76]/15 text-[#36C5F0] border border-[#0D9B76]/30 inline-block">
          AI Air Quality Platform
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          About the Project
        </h1>
        <p className="text-base font-bold text-[#36C5F0]">
          "Monitor Today. Predict Tomorrow."
        </p>
        <p className="text-xs sm:text-sm text-slate-400">
          An AI environmental monitoring and predictive system combining station telemetry, atmospheric variables, and autoregressive forecasting.
        </p>
      </div>

      {/* System Architecture Animated Flow */}
      <section className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-lg space-y-6 card-hover">
        <div>
          <h2 className="text-lg font-bold text-white">
            System Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end data pipeline from station observation to next-hour prediction.
          </p>
        </div>

        {/* Pipeline Nodes */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 overflow-x-auto py-2">
          {architectureSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.name}>
                <div className="w-full lg:w-36 p-3.5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] flex flex-col items-center text-center space-y-2 flex-shrink-0 hover:-translate-y-1 hover:border-[#36C5F0]/50 transition-all">
                  <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{step.name}</span>
                    <span className="text-[10px] text-slate-400">{step.desc}</span>
                  </div>
                </div>

                {idx < architectureSteps.length - 1 && (
                  <div className="text-slate-500 flex-shrink-0">
                    <ArrowRight size={18} className="hidden lg:block text-[#36C5F0]/60" />
                    <ArrowRight size={18} className="lg:hidden rotate-90 text-[#36C5F0]/60 my-1" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* Problem & Objective Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Card */}
        <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-md space-y-3 card-hover">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
            <AlertOctagon size={20} />
            <h3 className="text-white">Problem</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Conventional air quality platforms focus on passive reporting after peak pollution events occur. Industrial zones such as Manali experience rapid fluctuations, requiring proactive anticipation rather than delayed reporting.
          </p>
        </div>

        {/* Objective Card */}
        <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-md space-y-3 card-hover">
          <div className="flex items-center gap-2.5 text-[#36C5F0] font-bold text-base">
            <Target size={20} />
            <h3 className="text-white">Objective</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Deliver continuous criteria pollutant monitoring alongside next-hour predictive machine learning (t+1), giving communities and decision-makers advance lead time.
          </p>
        </div>
      </div>

      {/* AI + Physics Section (3 Clean Cards) */}
      <section className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-lg space-y-5 card-hover">
        <div>
          <div className="flex items-center gap-2 text-[#36C5F0] mb-1">
            <Atom size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-[#36C5F0]">Physical Intuition</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            AI + Environmental Physics
          </h2>
          <p className="text-xs text-slate-400">
            Grounding predictive features in observational environmental dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#0D9B76]/15 text-[#0D9B76] border border-[#0D9B76]/30 flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <h4 className="text-sm font-bold text-white">Air Pollution</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pollutant concentration changes with time based on emission rates and ambient accumulation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#36C5F0]/15 text-[#36C5F0] border border-[#36C5F0]/30 flex items-center justify-center font-bold">
              <Wind size={18} />
            </div>
            <h4 className="text-sm font-bold text-white">Atmospheric Conditions</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Wind speed, direction, and humidity influence observed atmospheric dispersion and transport.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <Clock size={18} />
            </div>
            <h4 className="text-sm font-bold text-white">Temporal Prediction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Historical AQI lag patterns capture temporal persistence to accurately forecast the next hour.
            </p>
          </div>
        </div>
      </section>

      {/* Model Benchmark Summary & Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-md space-y-3 card-hover">
          <div className="flex items-center gap-2 text-[#36C5F0] font-bold">
            <Cpu size={18} />
            <h3 className="text-white">Machine Learning Model</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Evaluated 5 architectures: Persistence baseline, Simple Linear Regression, Random Forest, XGBoost, and Linear Regression with autoregressive lags.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#0D9B76]/15 text-[#36C5F0] font-mono font-bold text-xs border border-[#0D9B76]/30">
              R² 0.994
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#13253B] text-slate-200 font-mono font-bold text-xs border border-[#1E3A5F]">
              MAE 0.691
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#13253B] text-slate-200 font-mono font-bold text-xs border border-[#1E3A5F]">
              RMSE 1.156
            </span>
          </div>
        </div>

        <div className="bg-[#0F1F33] rounded-3xl p-6 sm:p-7 border border-[#1E3A5F] shadow-md space-y-3 card-hover">
          <div className="flex items-center gap-2 text-[#0D9B76] font-bold">
            <Database size={18} />
            <h3 className="text-white">Station Telemetry</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Target station: <strong className="text-white">{STATION_INFO.name}</strong> (CAAQMS). Historical research window spans January 2026 – June 2026 with continuous hourly criteria pollutant records.
          </p>
          <span className="inline-block text-[11px] font-semibold text-slate-400">
            Source: CPCB / OpenAQ Open Telemetry Ingestion
          </span>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <section className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-lg space-y-5 card-hover">
        <div>
          <h2 className="text-lg font-bold text-white">
            Technology Stack
          </h2>
          <p className="text-xs text-slate-400">
            Modern tools powering frontend presentation, asynchronous backend, and model inference.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-2">
              <span className="text-xs font-bold text-[#36C5F0] uppercase tracking-wider block">
                {item.category}
              </span>
              <div className="flex flex-wrap gap-1">
                {item.techs.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-[#0B1724] border border-[#1E3A5F] text-slate-200 text-[11px] font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team & Mentor Attribution */}
      <section className="bg-[#0F1F33] rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] shadow-lg space-y-6 card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E3A5F] pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Project Contributors
            </h2>
            <p className="text-xs text-slate-400">
              Department of Computer Science & Engineering
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#13253B] px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs text-slate-200 font-bold self-start sm:self-auto">
            <GraduationCap size={16} className="text-[#36C5F0]" />
            <span>Mentor: {MENTOR_INFO.name}</span>
          </div>
        </div>

        {/* Team Members */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#13253B] border border-[#1E3A5F] space-y-1 hover:border-[#36C5F0]/40 transition-all">
              <span className="text-xs font-bold text-white block">
                {member.name}
              </span>
              <span className="text-xs text-[#36C5F0] font-semibold block">
                {member.role}
              </span>
              <span className="text-[11px] text-slate-400 block pt-1">
                {member.contribution}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
