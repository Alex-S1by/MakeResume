"use client";

import Image from "next/image";

export default function Home() {

const makeresume = () => {


  window.location.href = "/builder";
}



  return (
    <>
      {/* Google Fonts + Font Awesome */}
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* ── NAVBAR ── */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

            <a href="#" className="flex items-center  font-extrabold text-lg tracking-tight text-gray-900">
              <span className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white text-sm ">
                <i className="fa-solid fa-file-lines " />
              </span>
              <span className="ml-2"></span>
              MakeResume<span className="text-sky-500 p--10">.in</span>
            </a>

            

            <div className="flex items-center gap-2">
              <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <i className="fa-regular fa-user text-xs" />
                Login
              </button>
              <button  onClick={makeresume}className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all shadow-sm">
                Get Started
                <i className="fa-solid fa-arrow-right text-xs" />
              </button>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">

            {/* LEFT */}
            <div>
              <span className="inline-flex items-center gap-2 bg-sky-50 text-sky-600 border border-sky-100 text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wide uppercase">
                <i className="fa-solid fa-bolt" />
                AI-Powered Resume Builder
              </span>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-4">
                Build a Resume That{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-sky-500">Gets You Hired</span>
                 
                </span>
              </h1>

              <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-7 max-w-md">
                Create ATS-optimized resumes, get AI feedback, and match your profile to any job description — all in minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-7">
                <button  onClick={makeresume} className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow hover:shadow-sky-200 hover:shadow-lg">
                  <i className="fa-solid fa-wand-magic-sparkles" />
                  Create My Resume
                </button>
                <button className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors hover:bg-gray-50">
                  <i className="fa-solid fa-upload text-sky-500" />
                  Upload & Analyze
                </button>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                  {[1,2,3,4,5].map(i => <i key={i} className="fa-solid fa-star text-amber-400" />)}
                  <span className="ml-1.5 text-gray-700 font-semibold">4.8</span>
                  <span className="text-gray-400">(2.4k)</span>
                </div>
                <span className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <i className="fa-solid fa-shield-check text-sky-500" />
                  ATS-Friendly
                </div>
                <span className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <i className="fa-solid fa-users text-sky-500" />
                  10k+ users
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative flex justify-center md:justify-end mt-6 md:mt-0">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full bg-sky-50 blur-3xl opacity-90" />
              </div>

              <div className="relative z-10">
                {/* ATS chip */}
                <div className="absolute -top-4 -left-3 sm:-left-6 z-20 bg-white border border-gray-100 shadow-xl rounded-2xl px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                    94
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-none mb-0.5">ATS Score</p>
                    <p className="text-[11px] text-gray-400">Excellent match</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/80">
                  <Image
                    src="/heroimg.webp"
                    alt="Resume Preview"
                    width={380}
                    height={480}
                    className="block w-full max-w-[260px] sm:max-w-xs md:max-w-sm"
                  />
                </div>

                {/* Hired badge */}
                <div className="absolute -bottom-4 -right-3 sm:-right-6 z-20 bg-white border border-gray-100 shadow-xl rounded-2xl px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-circle-check text-emerald-500 text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-none mb-0.5">Interview Scheduled</p>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
        <div className="border-y border-gray-100 bg-gray-50/70 py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">
              Trusted by job seekers hired at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-gray-300 font-extrabold text-base md:text-lg tracking-tight">
              {["Google", "Microsoft", "Amazon", "Flipkart", "Infosys", "TCS"].map((c) => (
                <span key={c} className="hover:text-gray-400 transition-colors cursor-default">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-sky-50 text-sky-600 border border-sky-100 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
              <i className="fa-solid fa-sparkles" />
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              Everything you need to land the job
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm sm:text-base">
              From building to optimizing — we handle the hard parts so you can focus on the interview.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {[
              { icon: "fa-solid fa-pen-ruler", bg: "bg-sky-50 text-sky-600", title: "Resume Builder", desc: "Drag-and-drop builder with 50+ ATS-friendly templates. Export as PDF in one click." },
              { icon: "fa-solid fa-microchip", bg: "bg-violet-50 text-violet-500", title: "AI Analyzer", desc: "Upload any resume and get an instant ATS score, keyword gaps, and improvement tips." },
              { icon: "fa-solid fa-bullseye", bg: "bg-emerald-50 text-emerald-600", title: "Job Match", desc: "Paste a job description and see how well your resume matches — and what to fix." },
              { icon: "fa-solid fa-layer-group", bg: "bg-orange-50 text-orange-500", title: "50+ Templates", desc: "Clean, recruiter-approved designs for every industry from tech to finance." },
              { icon: "fa-solid fa-file-pdf", bg: "bg-red-50 text-red-500", title: "One-Click Export", desc: "Download your resume as a polished PDF, ready to send to any employer instantly." },
              { icon: "fa-solid fa-lock", bg: "bg-sky-50 text-sky-600", title: "Secure & Private", desc: "Your data is encrypted. We never share or sell your personal information." },
            ].map((f) => (
              <div key={f.title} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center text-base mb-4`}>
                  <i className={f.icon} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{f.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-500 group-hover:gap-3 transition-all">
                  Learn more <i className="fa-solid fa-arrow-right text-[10px]" />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="mx-4 sm:mx-6 bg-gray-900 rounded-3xl py-12 px-6 md:px-16 mb-14 md:mb-20">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            {[
              { num: "48%", label: "Higher interview call rate", icon: "fa-solid fa-arrow-trend-up", color: "text-sky-400" },
              { num: "2×", label: "Faster job offers on average", icon: "fa-solid fa-bolt", color: "text-amber-400" },
              { num: "10k+", label: "Resumes built and counting", icon: "fa-solid fa-users", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-1.5">
                <i className={`${s.icon} ${s.color} text-lg mb-1`} />
                <span className="text-5xl font-extrabold text-white tracking-tight">{s.num}</span>
                <p className="text-sm text-gray-400 max-w-[160px]">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 md:pb-20">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-sky-50 text-sky-600 border border-sky-100 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
              <i className="fa-solid fa-list-check" />
              How it works
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              Ready in 3 simple steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { step: "01", icon: "fa-solid fa-user-pen", title: "Fill Your Details", desc: "Enter your experience, education, and skills. Our AI helps write compelling bullet points." },
              { step: "02", icon: "fa-solid fa-wand-magic-sparkles", title: "AI Optimizes", desc: "We score your resume against ATS systems and suggest targeted improvements instantly." },
              { step: "03", icon: "fa-solid fa-rocket", title: "Download & Apply", desc: "Export a pixel-perfect PDF and start applying to jobs with confidence." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-xl mb-4 shadow-md shadow-sky-200/60">
                  <i className={s.icon} />
                </div>
                <span className="text-[10px] font-bold text-gray-300 tracking-widest uppercase mb-1">{s.step}</span>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 md:pb-20">
          <div className="bg-sky-500 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-8 right-24 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

            <div className="relative z-10 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Your dream job is one resume away.
              </h2>
              <p className="text-sky-100 text-sm sm:text-base">
                Start for free — no credit card required.
              </p>
            </div>

            <button className="relative z-10 inline-flex items-center gap-2 bg-white text-sky-600 font-bold text-sm px-7 py-3.5 rounded-xl hover:bg-sky-50 transition-colors shadow-lg whitespace-nowrap shrink-0">
              <i className="fa-solid fa-rocket" />
              Get Started Free
            </button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <a href="#" className="flex items-center  font-extrabold text-gray-900">
                <span className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white text-xs">
                  <i className="fa-solid fa-file-lines" />
                </span>
                <span className="ml-2"></span>
                MakeResume<span className="text-sky-500">.in</span>
              </a>

              <nav className="flex flex-wrap justify-center gap-5 text-sm text-gray-400 font-medium">
                {["Privacy", "Terms", "Blog", "Support", "Pricing"].map((l) => (
                  <a key={l} href="#" className="hover:text-gray-700 transition-colors">{l}</a>
                ))}
              </nav>

              <div className="flex items-center gap-2.5">
                {[
                  { icon: "fa-brands fa-x-twitter", label: "Twitter" },
                  { icon: "fa-brands fa-linkedin-in", label: "LinkedIn" },
                  { icon: "fa-brands fa-github", label: "GitHub" },
                ].map((s) => (
                  <a key={s.label} href="#" aria-label={s.label}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-sky-500 hover:text-sky-500 transition-colors">
                    <i className={`${s.icon} text-sm`} />
                  </a>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-gray-300 mt-8">
              © 2026 MakeResume.in — Built with <i className="fa-solid fa-heart text-red-400 mx-0.5" /> in India
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}