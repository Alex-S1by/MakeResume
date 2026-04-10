"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumePDF } from './downloadres';


// ─── Types ────────────────────────────────────────────────────────────────────
interface ContactData {
  firstName: string; lastName: string; email: string; phone: string;
  jobTitle: string; city: string; country: string; linkedin: string; website: string;
}
interface ExpEntry {
  id: number; company: string; position: string;
  startDate: string; endDate: string; current: boolean; description: string;
}
interface EduEntry {
  id: number; institution: string; degree: string; field: string;
  startDate: string; endDate: string; current: boolean; grade: string;
}
interface SkillEntry { id: number; name: string; level: number; }
interface ProjectEntry { id: number; title: string; description: string; link: string; }
interface CertEntry  { id: number; name: string; issuer: string; year: string; }
interface CustomSection { id: number; heading: string; content: string; }
interface Errors { [key: string]: string; }

type TemplateName = "classic" | "modern" | "minimal";
type ColorName = "blue" | "emerald" | "violet" | "rose" | "amber" | "slate";

interface TemplateConfig {
  id: TemplateName;
  name: string;
  tag: string;
  description: string;
}

interface ColorConfig {
  id: ColorName;
  name: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  headerBg: string;
  headerText: string;
  accent: string;
  skillBg: string;
  skillText: string;
  skillBorder: string;
}

interface ResumeData {
  contact: ContactData;
  summary: string;
  experience: ExpEntry[];
  education:  EduEntry[];
  skills:     SkillEntry[];
  projects:   ProjectEntry[];
  certs:      CertEntry[];
  custom:     CustomSection[];
}

// ─── Steps ───────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: "Contact",       icon: "fa-solid fa-address-card" },
  { id: 1, label: "Summary",       icon: "fa-solid fa-align-left"   },
  { id: 2, label: "Experience",    icon: "fa-solid fa-briefcase"    },
  { id: 3, label: "Education",     icon: "fa-solid fa-graduation-cap" },
  { id: 4, label: "Skills",        icon: "fa-solid fa-code"         },
  { id: 5, label: "Projects",      icon: "fa-solid fa-folder-open"  },
  { id: 6, label: "Certifications",icon: "fa-solid fa-certificate"  },
  { id: 7, label: "Custom",        icon: "fa-solid fa-puzzle-piece" },
  { id: 8, label: "Finalize",      icon: "fa-solid fa-rocket"       },
];

const SKILL_LABELS = ["Beginner","Elementary","Intermediate","Advanced","Expert"];

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES: TemplateConfig[] = [
  { id: "classic", name: "Classic", tag: "Traditional", description: "Clean, traditional layout" },
  { id: "modern", name: "Modern", tag: "Popular ✦", description: "Bold header with accent colors" },
  { id: "minimal", name: "Minimal", tag: "Clean", description: "Simple and elegant" },
];

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS: ColorConfig[] = [
  { 
    id: "blue", name: "Blue", 
    primary: "bg-sky-500", primaryLight: "bg-sky-50", primaryDark: "bg-sky-600",
    headerBg: "bg-gray-900", headerText: "text-white", accent: "text-sky-400",
    skillBg: "bg-sky-50", skillText: "text-sky-700", skillBorder: "border-sky-100"
  },
  { 
    id: "emerald", name: "Emerald", 
    primary: "bg-emerald-500", primaryLight: "bg-emerald-50", primaryDark: "bg-emerald-600",
    headerBg: "bg-emerald-900", headerText: "text-white", accent: "text-emerald-400",
    skillBg: "bg-emerald-50", skillText: "text-emerald-700", skillBorder: "border-emerald-100"
  },
  { 
    id: "violet", name: "Violet", 
    primary: "bg-violet-500", primaryLight: "bg-violet-50", primaryDark: "bg-violet-600",
    headerBg: "bg-violet-900", headerText: "text-white", accent: "text-violet-400",
    skillBg: "bg-violet-50", skillText: "text-violet-700", skillBorder: "border-violet-100"
  },
  { 
    id: "rose", name: "Rose", 
    primary: "bg-rose-500", primaryLight: "bg-rose-50", primaryDark: "bg-rose-600",
    headerBg: "bg-rose-900", headerText: "text-white", accent: "text-rose-400",
    skillBg: "bg-rose-50", skillText: "text-rose-700", skillBorder: "border-rose-100"
  },
  { 
    id: "amber", name: "Amber", 
    primary: "bg-amber-500", primaryLight: "bg-amber-50", primaryDark: "bg-amber-600",
    headerBg: "bg-amber-900", headerText: "text-white", accent: "text-amber-400",
    skillBg: "bg-amber-50", skillText: "text-amber-700", skillBorder: "border-amber-100"
  },
  { 
    id: "slate", name: "Slate", 
    primary: "bg-slate-600", primaryLight: "bg-slate-50", primaryDark: "bg-slate-700",
    headerBg: "bg-slate-800", headerText: "text-white", accent: "text-slate-300",
    skillBg: "bg-slate-100", skillText: "text-slate-700", skillBorder: "border-slate-200"
  },
];

// ─── Validation helpers ───────────────────────────────────────────────────────
const validateEmail = (v: string) =>
  v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address" : "";

const validatePhone = (v: string) =>
  v && !/^[+]?[\d\s\-().]{7,15}$/.test(v) ? "Enter a valid phone number" : "";

const validateDate = (v: string) =>
  v && !/^(0[1-9]|1[0-2])\/\d{4}$|^\d{4}$/.test(v.trim())
    ? "Use MM/YYYY or YYYY format" : "";

const validateYear = (v: string) =>
  v && !/^\d{4}$/.test(v.trim()) ? "Enter a 4-digit year" : "";

const validateURL = (v: string) =>
  v && !/^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/.*)?$/i.test(v)
    ? "Enter a valid URL" : "";

// ─── Score calc ───────────────────────────────────────────────────────────────
function calcScore(d: ResumeData): number {
  let s = 0;
  const c = d.contact;
  if (c.firstName && c.lastName) s += 10;
  if (c.email)    s += 10;
  if (c.phone)    s += 5;
  if (c.jobTitle) s += 5;
  if (c.city)     s += 5;
  if (c.linkedin) s += 5;
  if (d.summary.length > 80) s += 15;
  if (d.experience.length > 0) s += 15;
  if (d.education.length > 0)  s += 10;
if (d.skills.length >= 3)    s += 10;
  if (d.projects.length > 0)   s += 5;
  if (d.certs.length > 0)      s += 5;
  if (d.custom.length > 0)     s += 5;
  return Math.min(s, 100);
}

const defaultData: ResumeData = {
  contact: { firstName:"", lastName:"", email:"", phone:"", jobTitle:"", city:"", country:"India", linkedin:"", website:"" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certs: [],
  custom: [],
};

// ─── Sub-components ──────────────────────────────────��────────────────────────
function FieldWrap({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
        {label}{required && <span className="text-sky-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
          <i className="fa-solid fa-circle-exclamation text-[10px]" />{error}
        </p>
      )}
    </div>
  );
}

function Input({ label, placeholder, value, onChange, type="text", icon, required, error }: {
  label: string; placeholder: string; value: string; onChange:(v:string)=>void;
  type?: string; icon?: string; required?: boolean; error?: string;
}) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"><i className={icon}/></span>}
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full bg-white border ${error ? "border-red-300 focus:ring-red-300" : "border-gray-200 focus:ring-sky-400"} rounded-xl ${icon ? "pl-9" : "px-3"} px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
        />
        {error && <i className="fa-solid fa-circle-exclamation absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs" />}
      </div>
    </FieldWrap>
  );
}

function Textarea({ label, placeholder, value, onChange, rows=4 }: {
  label: string; placeholder: string; value: string; onChange:(v:string)=>void; rows?: number;
}) {
  return (
    <FieldWrap label={label}>
      <textarea rows={rows} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none transition-all"
      />
    </FieldWrap>
  );
}

function Card({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-6 pb-4 border-b border-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
          <i className={`${icon} text-sky-500 text-sm`} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{title}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle, onClick, btnLabel }: {
  icon: string; title: string; subtitle: string; onClick: ()=>void; btnLabel: string;
}) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 mx-auto mb-4 flex items-center justify-center">
        <i className={`${icon} text-sky-300 text-2xl`} />
      </div>
      <p className="font-bold text-gray-700 text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-5">{subtitle}</p>
      <button onClick={onClick} className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
        <i className="fa-solid fa-plus text-[10px]" />{btnLabel}
      </button>
    </div>
  );
}

function AddMoreBtn({ onClick, label }: { onClick: ()=>void; label: string }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-sky-400 text-gray-400 hover:text-sky-500 text-xs font-bold py-3 rounded-xl transition-all mt-3">
      <i className="fa-solid fa-plus text-[10px]" />{label}
    </button>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>(defaultData);
  const [errors, setErrors] = useState<Errors>({});
const [previewOpen, setPreviewOpen] = useState(false);
  const [touched, setTouched] = useState<{[k:string]:boolean}>({});
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("modern");
  const [selectedColor, setSelectedColor] = useState<ColorName>("blue");

  const currentColor = COLORS.find(c => c.id === selectedColor) || COLORS[0];

  const score = calcScore(data);
  const setC = (k: keyof ContactData, v: string) =>
    setData(d => ({ ...d, contact: { ...d.contact, [k]: v } }));

  // ── Validate contact on blur ──────────────────────────────────────────────
  const blurValidate = (field: string, value: string) => {
    setTouched(t => ({ ...t, [field]: true }));
    let err = "";
    if (field === "email") err = validateEmail(value);
    if (field === "phone") err = validatePhone(value);
    if (field === "linkedin" || field === "website") err = validateURL(value);
    setErrors(e => ({ ...e, [field]: err }));
  };

  const blurDate = (key: string, value: string) => {
    setTouched(t => ({ ...t, [key]: true }));
    setErrors(e => ({ ...e, [key]: validateDate(value) }));
  };

  const blurYear = (key: string, value: string) => {
    setTouched(t => ({ ...t, [key]: true }));
    setErrors(e => ({ ...e, [key]: validateYear(value) }));
  };

  // ── Experience ────────────────────────────────────────────────────────────
  const addExp = () => setData(d => ({ ...d, experience: [...d.experience, { id: Date.now(), company:"", position:"", startDate:"", endDate:"", current:false, description:"" }] }));
  const updExp = (id: number, k: keyof ExpEntry, v: any) => setData(d => ({ ...d, experience: d.experience.map(e => e.id===id ? {...e,[k]:v} : e) }));
  const delExp = (id: number) => setData(d => ({ ...d, experience: d.experience.filter(e => e.id!==id) }));

  // ── Education ─────────────────────────────────────────────────────────────
  const addEdu = () => setData(d => ({ ...d, education: [...d.education, { id: Date.now(), institution:"", degree:"", field:"", startDate:"", endDate:"", current:false, grade:"" }] }));
  const updEdu = (id: number, k: keyof EduEntry, v: any) => setData(d => ({ ...d, education: d.education.map(e => e.id===id ? {...e,[k]:v} : e) }));
  const delEdu = (id: number) => setData(d => ({ ...d, education: d.education.filter(e => e.id!==id) }));

// ── Skills ────────────────────────────────────────────────────────────────
  const addSkill = () => setData(d => ({ ...d, skills: [...d.skills, { id: Date.now(), name:"", level:3 }] }));
  const updSkill = (id: number, k: keyof SkillEntry, v: any) => setData(d => ({ ...d, skills: d.skills.map(s => s.id===id ? {...s,[k]:v} : s) }));
  const delSkill = (id: number) => setData(d => ({ ...d, skills: d.skills.filter(s => s.id!==id) }));

  // ── Projects ──────────────────────────────────────────────────────────────
  const addProject = () => setData(d => ({ ...d, projects: [...d.projects, { id: Date.now(), title:"", description:"", link:"" }] }));
  const updProject = (id: number, k: keyof ProjectEntry, v: string) => setData(d => ({ ...d, projects: d.projects.map(p => p.id===id ? {...p,[k]:v} : p) }));
  const delProject = (id: number) => setData(d => ({ ...d, projects: d.projects.filter(p => p.id!==id) }));

  // ── Certs ─────────────────────────────────────────────────────────────────
  const addCert = () => setData(d => ({ ...d, certs: [...d.certs, { id: Date.now(), name:"", issuer:"", year:"" }] }));
  const updCert = (id: number, k: keyof CertEntry, v: string) => setData(d => ({ ...d, certs: d.certs.map(c => c.id===id ? {...c,[k]:v} : c) }));
  const delCert = (id: number) => setData(d => ({ ...d, certs: d.certs.filter(c => c.id!==id) }));

  // ── Custom ────────────────────────────────────────────────────────────────
  const addCustom = () => setData(d => ({ ...d, custom: [...d.custom, { id: Date.now(), heading:"", content:"" }] }));
  const updCustom = (id: number, k: keyof CustomSection, v: string) => setData(d => ({ ...d, custom: d.custom.map(c => c.id===id ? {...c,[k]:v} : c) }));
  const delCustom = (id: number) => setData(d => ({ ...d, custom: d.custom.filter(c => c.id!==id) }));


  const saveDraft = () => {
  try {
    localStorage.setItem("resume_draft", JSON.stringify(data));
    localStorage.setItem("resume_template", selectedTemplate);
localStorage.setItem("resume_color", selectedColor);
    // Optional: Add a small toast or alert
    alert("Draft saved successfully! ✅");
  } catch (err) {
    console.error("Failed to save draft", err);
  }
};





const deleteDraft = () => {
  // Ask for confirmation before deleting
  if (window.confirm("Are you sure you want to delete your draft? This cannot be undone.")) {
    try {
      // 1. Remove items from Local Storage
      localStorage.removeItem("resume_draft");
      localStorage.removeItem("resume_template");
      localStorage.removeItem("resume_color");

      // 2. Reset the component state to default values
      setData(defaultData);
      setSelectedTemplate("modern");
      setSelectedColor("blue");
      setStep(0); // Optional: Send user back to the first step

      alert("Draft deleted successfully! 🗑️");
    } catch (err) {
      console.error("Failed to delete draft", err);
    }
  }
};

const saveandpreview=()=>{

    saveDraft()
    window.location.href = "/preview";
}



// ... inside ResumeBuilder component ...
const previewRef = useRef<HTMLDivElement>(null);




useEffect(() => {
  const saved = localStorage.getItem("resume_draft");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      setData(parsed);
    } catch (e) {
      console.error("Failed to parse draft");
    }
  }
}, []);


  // ═══════════════════════════════════════════════════════════════════════════
  // STEP CONTENT
  // ═══════════════════════════════════════════════════════════════════════════
  const renderStep = () => {
    switch (step) {

      // ── 0. CONTACT ────────────────────────────────────────────────────────
      case 0: return (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader icon="fa-solid fa-user" title="Personal Information" subtitle="Basic details that appear at the top of your resume" />
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" placeholder="Rahul" value={data.contact.firstName}
                onChange={v => setC("firstName",v)} icon="fa-solid fa-user" required
                error={!data.contact.firstName && touched["firstName"] ? "First name is required" : ""}
              />
              <Input label="Last Name" placeholder="Sharma" value={data.contact.lastName}
                onChange={v => setC("lastName",v)} icon="fa-solid fa-user"
              />
              <div onBlur={() => blurValidate("email", data.contact.email)}>
                <Input label="Email" placeholder="rahul@example.com" value={data.contact.email}
                  onChange={v => setC("email",v)} type="email" icon="fa-solid fa-envelope" required
                  error={errors.email}
                />
              </div>
              <div onBlur={() => blurValidate("phone", data.contact.phone)}>
                <Input label="Phone" placeholder="+91 98765 43210" value={data.contact.phone}
                  onChange={v => setC("phone",v)} icon="fa-solid fa-phone"
                  error={errors.phone}
                />
              </div>
              <Input label="Desired Job Title" placeholder="Software Engineer" value={data.contact.jobTitle}
                onChange={v => setC("jobTitle",v)} icon="fa-solid fa-briefcase"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" placeholder="Mumbai" value={data.contact.city} onChange={v => setC("city",v)} icon="fa-solid fa-location-dot" />
                <Input label="Country" placeholder="India" value={data.contact.country} onChange={v => setC("country",v)} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader icon="fa-solid fa-link" title="Online Presence" subtitle="Add your LinkedIn and portfolio to boost visibility" />
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onBlur={() => blurValidate("linkedin", data.contact.linkedin)}>
                <Input label="LinkedIn" placeholder="linkedin.com/in/rahulsharma" value={data.contact.linkedin}
                  onChange={v => setC("linkedin",v)} icon="fa-brands fa-linkedin"
                  error={errors.linkedin}
                />
              </div>
              <div onBlur={() => blurValidate("website", data.contact.website)}>
                <Input label="Portfolio / Website" placeholder="rahulsharma.dev" value={data.contact.website}
                  onChange={v => setC("website",v)} icon="fa-solid fa-globe"
                  error={errors.website}
                />
              </div>
            </div>
          </Card>
        </div>
      );

      // ── 1. SUMMARY ────────────────────────────────────────────────────────
      case 1: return (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader icon="fa-solid fa-align-left" title="Professional Summary" subtitle="A 2–4 sentence pitch that recruiters read first" />
            <div className="p-6">
              <Textarea
                label="Summary"
                placeholder="Results-driven Software Engineer with 3+ years of experience building scalable web apps using React and Node.js. Passionate about clean code and great user experiences. Looking for a senior role at a product-first company."
                value={data.summary}
                onChange={v => setData(d => ({ ...d, summary: v }))}
                rows={6}
              />
              <div className="flex justify-between mt-2">
                <span className={`text-[11px] font-medium ${data.summary.length < 80 ? "text-amber-500" : data.summary.length < 300 ? "text-emerald-500" : "text-sky-500"}`}>
                  {data.summary.length < 80 ? "Too short — aim for at least 80 characters" : data.summary.length < 300 ? "Good length ✓" : "Great detail ✓"}
                </span>
                <span className="text-[11px] text-gray-300">{data.summary.length} chars</span>
              </div>
            </div>
          </Card>
          <div className="bg-gradient-to-r from-sky-50 to-white border border-sky-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-sky-700 mb-3 flex items-center gap-2"><i className="fa-solid fa-lightbulb text-amber-400"/>Writing Tips</p>
            <ul className="flex flex-col gap-2">
              {["Start with years of experience + role (e.g. '5+ years as Full Stack Dev')",
                "Mention your top 2–3 core skills or domain expertise",
                "Add one measurable achievement if possible",
                "End with what kind of opportunity you're seeking"].map((t,i)=>(
                <li key={i} className="text-[11px] text-sky-700 flex items-start gap-2">
                  <i className="fa-solid fa-check text-sky-400 mt-0.5 shrink-0"/>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

      // ── 2. EXPERIENCE ─────────────────────────────────────────────────────
      case 2: return (
        <div className="flex flex-col gap-4">
          {data.experience.length === 0 ? (
            <Card>
              <EmptyState icon="fa-solid fa-briefcase" title="No experience added" subtitle="Add your work history, starting with the most recent role." onClick={addExp} btnLabel="Add Experience" />
            </Card>
          ) : (
            data.experience.map((exp, i) => (
              <Card key={exp.id}>
                <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 text-[10px] font-extrabold flex items-center justify-center">{i+1}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Work Experience</span>
                  </div>
                  <button onClick={() => delExp(exp.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-trash text-xs"/>
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Job Title" placeholder="Software Engineer" value={exp.position} onChange={v => updExp(exp.id,"position",v)} icon="fa-solid fa-user-tie" />
                  <Input label="Company" placeholder="Google" value={exp.company} onChange={v => updExp(exp.id,"company",v)} icon="fa-solid fa-building" />
                  <div onBlur={() => blurDate(`exp_start_${exp.id}`, exp.startDate)}>
                    <Input label="Start Date (MM/YYYY)" placeholder="01/2022" value={exp.startDate} onChange={v => updExp(exp.id,"startDate",v)} icon="fa-solid fa-calendar"
                      error={errors[`exp_start_${exp.id}`]}
                    />
                  </div>
                  <div>
                    <div onBlur={() => !exp.current && blurDate(`exp_end_${exp.id}`, exp.endDate)}>
                      <Input label="End Date (MM/YYYY)" placeholder={exp.current ? "Present" : "12/2024"}
                        value={exp.current ? "" : exp.endDate}
                        onChange={v => updExp(exp.id,"endDate",v)}
                        icon="fa-solid fa-calendar-check"
                        error={!exp.current ? errors[`exp_end_${exp.id}`] : ""}
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input type="checkbox" checked={exp.current} onChange={e => { updExp(exp.id,"current",e.target.checked); if(e.target.checked) updExp(exp.id,"endDate",""); }} className="accent-sky-500 w-3.5 h-3.5 rounded"/>
                      <span className="text-xs text-gray-500 font-medium">I currently work here</span>
                    </label>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <Textarea label="Key Responsibilities & Achievements" placeholder={"• Led a team of 5 engineers to deliver a new checkout system, reducing cart abandonment by 18%\n• Built REST APIs serving 2M+ daily requests"} value={exp.description} onChange={v => updExp(exp.id,"description",v)} rows={4} />
                </div>
              </Card>
            ))
          )}
          {data.experience.length > 0 && <AddMoreBtn onClick={addExp} label="Add Another Position" />}
        </div>
      );

      // ── 3. EDUCATION ──────────────────────────────────────────────────────
      case 3: return (
        <div className="flex flex-col gap-4">
          {data.education.length === 0 ? (
            <Card>
              <EmptyState icon="fa-solid fa-graduation-cap" title="No education added" subtitle="Add your degrees, diplomas, and academic background." onClick={addEdu} btnLabel="Add Education" />
            </Card>
          ) : (
            data.education.map((edu, i) => (
              <Card key={edu.id}>
                <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 text-[10px] font-extrabold flex items-center justify-center">{i+1}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Education</span>
                  </div>
                  <button onClick={() => delEdu(edu.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-trash text-xs"/>
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Institution" placeholder="IIT Bombay" value={edu.institution} onChange={v => updEdu(edu.id,"institution",v)} icon="fa-solid fa-school" />
                  <Input label="Degree" placeholder="B.Tech / MBA / BCA" value={edu.degree} onChange={v => updEdu(edu.id,"degree",v)} icon="fa-solid fa-graduation-cap" />
                  <Input label="Field of Study" placeholder="Computer Science" value={edu.field} onChange={v => updEdu(edu.id,"field",v)} icon="fa-solid fa-book" />
                  <div onBlur={() => blurValidate(`grade_${edu.id}`, edu.grade)}>
                    <Input label="Grade / CGPA / Percentage" placeholder="8.5 CGPA or 85%" value={edu.grade} onChange={v => updEdu(edu.id,"grade",v)} icon="fa-solid fa-star" />
                  </div>
                  <div onBlur={() => blurYear(`edu_start_${edu.id}`, edu.startDate)}>
                    <Input label="Start Year" placeholder="2019" value={edu.startDate} onChange={v => updEdu(edu.id,"startDate",v)} icon="fa-solid fa-calendar"
                      error={errors[`edu_start_${edu.id}`]}
                    />
                  </div>
                  <div>
                    <div onBlur={() => !edu.current && blurYear(`edu_end_${edu.id}`, edu.endDate)}>
                      <Input label="End Year" placeholder={edu.current ? "Present" : "2023 or Expected 2025"}
                        value={edu.current ? "" : edu.endDate}
                        onChange={v => updEdu(edu.id,"endDate",v)}
                        icon="fa-solid fa-calendar-check"
                        error={!edu.current ? errors[`edu_end_${edu.id}`] : ""}
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input type="checkbox" checked={edu.current} onChange={e => { updEdu(edu.id,"current",e.target.checked); if(e.target.checked) updEdu(edu.id,"endDate",""); }} className="accent-sky-500 w-3.5 h-3.5 rounded"/>
                      <span className="text-xs text-gray-500 font-medium">I am currently studying here</span>
                    </label>
                  </div>
                </div>
              </Card>
            ))
          )}
          {data.education.length > 0 && <AddMoreBtn onClick={addEdu} label="Add Another Degree" />}
        </div>
      );

      // ── 4. SKILLS ─────────────────────────────────────────────────────────
      case 4: return (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader icon="fa-solid fa-code" title="Skills" subtitle="Rate your proficiency — 5 dots = Expert" />
            <div className="p-6">
              {data.skills.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4 mb-2">No skills yet. Add some below or use quick-add chips.</p>
              )}
              <div className="flex flex-col gap-2 mb-4">
                {data.skills.map(skill => (
                  <div key={skill.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 group">
                    <i className="fa-solid fa-hashtag text-gray-300 text-xs shrink-0"/>
                    <input placeholder="e.g. React, Python, Figma…" value={skill.name}
                      onChange={e => updSkill(skill.id,"name",e.target.value)}
                      className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none min-w-0"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => updSkill(skill.id,"level",n)}
                          className={`w-4 h-4 rounded-full transition-all ${skill.level >= n ? "bg-sky-500 scale-110" : "bg-gray-200 hover:bg-sky-200"}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 w-16 text-right hidden sm:block shrink-0">{SKILL_LABELS[skill.level-1]}</span>
                    <button onClick={() => delSkill(skill.id)} className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-red-50 text-red-400 flex items-center justify-center transition-all shrink-0">
                      <i className="fa-solid fa-xmark text-[9px]"/>
                    </button>
                  </div>
                ))}
              </div>
              <AddMoreBtn onClick={addSkill} label="Add Skill" />
            </div>
          </Card>

          <Card>
            <div className="px-6 pt-5 pb-4 border-b border-gray-50 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-400 text-sm"/>
              <span className="text-xs font-bold text-gray-700">Quick-Add Popular Skills</span>
            </div>
            <div className="p-5 flex flex-wrap gap-2">
              {["JavaScript","TypeScript","Python","React","Node.js","Next.js","SQL","Figma","Git","AWS","Docker","Java","Go","Communication","Leadership","Problem Solving","Teamwork","Agile"].map(s => (
                <button key={s}
                  onClick={() => { if(!data.skills.find(sk => sk.name===s)) setData(d => ({ ...d, skills:[...d.skills,{id:Date.now(),name:s,level:3}] })); }}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${data.skills.find(sk=>sk.name===s) ? "border-sky-400 bg-sky-50 text-sky-600" : "border-gray-200 bg-white text-gray-600 hover:border-sky-300 hover:text-sky-500"}`}
                >
                  {data.skills.find(sk=>sk.name===s) ? <><i className="fa-solid fa-check text-[9px] mr-1"/>{s}</> : `+ ${s}`}
                </button>
              ))}
            </div>
          </Card>
        </div>
      );

// ── 5. PROJECTS ─────────────────────────────────────────────────────────
      case 5: return (
        <div className="flex flex-col gap-4">
          {data.projects.length === 0 ? (
            <Card>
              <EmptyState icon="fa-solid fa-folder-open" title="No projects added" subtitle="Showcase your best work, side projects, or open source contributions." onClick={addProject} btnLabel="Add Project" />
            </Card>
          ) : (
            data.projects.map((proj, i) => (
              <Card key={proj.id}>
                <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 text-[10px] font-extrabold flex items-center justify-center">{i+1}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Project</span>
                  </div>
                  <button onClick={() => delProject(proj.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-trash text-xs"/>
                  </button>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <Input
                    label="Project Title"
                    placeholder="e.g. E-commerce Platform, Portfolio Website"
                    value={proj.title}
                    onChange={v => updProject(proj.id,"title",v)}
                    icon="fa-solid fa-cube"
                  />
                  <Textarea
                    label="Description"
                    placeholder="Describe what the project does, technologies used, and your role/contributions."
                    value={proj.description}
                    onChange={v => updProject(proj.id,"description",v)}
                    rows={3}
                  />
                  <Input
                    label="Project Link (Optional)"
                    placeholder="https://github.com/username/project or live URL"
                    value={proj.link}
                    onChange={v => updProject(proj.id,"link",v)}
                    icon="fa-solid fa-link"
                  />
                </div>
              </Card>
            ))
          )}
          {data.projects.length > 0 && <AddMoreBtn onClick={addProject} label="Add Another Project" />}
        </div>
      );

      // ── 6. CERTIFICATIONS ─────────────────────────────────────────────────
      case 6: return (
        <div className="flex flex-col gap-4">
          {data.certs.length === 0 ? (
            <Card>
              <EmptyState icon="fa-solid fa-certificate" title="No certifications added" subtitle="Add AWS, Google, Coursera, or any other certification." onClick={addCert} btnLabel="Add Certification" />
            </Card>
          ) : (
            <Card>
              <CardHeader icon="fa-solid fa-certificate" title="Certifications" subtitle="Professional credentials and online course certificates" />
              <div className="p-6 flex flex-col gap-4">
                {data.certs.map((cert, i) => (
                  <div key={cert.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_36px] gap-3 items-end">
                    <Input label={i===0?"Certificate Name":""} placeholder="AWS Cloud Practitioner" value={cert.name} onChange={v => updCert(cert.id,"name",v)} icon="fa-solid fa-award" />
                    <Input label={i===0?"Issuing Organisation":""} placeholder="Amazon Web Services" value={cert.issuer} onChange={v => updCert(cert.id,"issuer",v)} icon="fa-solid fa-building" />
                    <div onBlur={() => blurYear(`cert_${cert.id}`, cert.year)}>
                      <Input label={i===0?"Year":""} placeholder="2024" value={cert.year} onChange={v => updCert(cert.id,"year",v)}
                        error={errors[`cert_${cert.id}`]}
                      />
                    </div>
                    <button onClick={() => delCert(cert.id)} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors shrink-0">
                      <i className="fa-solid fa-trash text-xs"/>
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <AddMoreBtn onClick={addCert} label="Add Another Certification" />
              </div>
            </Card>
          )}
          {data.certs.length > 0 && data.certs.length === 0 && null}
        </div>
      );

// ── 7. CUSTOM ─────────────────────────────────────────────────────────
      case 7: return (
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-r from-violet-50 to-white border border-violet-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-violet-700 mb-1 flex items-center gap-2"><i className="fa-solid fa-puzzle-piece text-violet-400"/>Custom Sections</p>
            <p className="text-xs text-violet-500">Add anything extra — Projects, Languages, Hobbies, Publications, Awards, Volunteering, etc.</p>
          </div>

          {data.custom.length === 0 ? (
            <Card>
              <EmptyState icon="fa-solid fa-puzzle-piece" title="No custom sections yet" subtitle="Create any section you need — Projects, Awards, Languages, and more." onClick={addCustom} btnLabel="Add Custom Section" />
            </Card>
          ) : (
            data.custom.map((sec, i) => (
              <Card key={sec.id}>
                <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 text-[10px] font-extrabold flex items-center justify-center">{i+1}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Section</span>
                  </div>
                  <button onClick={() => delCustom(sec.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-trash text-xs"/>
                  </button>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <Input
                    label="Section Heading"
                    placeholder="e.g. Projects, Languages, Awards, Hobbies…"
                    value={sec.heading}
                    onChange={v => updCustom(sec.id,"heading",v)}
                    icon="fa-solid fa-heading"
                  />
                  <Textarea
                    label="Section Content"
                    placeholder={"Describe this section in detail.\n\nFor projects:\n• Project Name — Short description, tech used, impact\n• Another Project — …\n\nFor languages:\n• English — Fluent\n• Hindi — Native"}
                    value={sec.content}
                    onChange={v => updCustom(sec.id,"content",v)}
                    rows={5}
                  />
                </div>
              </Card>
            ))
          )}
          {data.custom.length > 0 && <AddMoreBtn onClick={addCustom} label="Add Another Section" />}
        </div>
      );

// ── 8. FINALIZE ───────────────────────────────────────────────────────
      case 8: return (
        <div className="flex flex-col gap-4">
          {/* Score ring */}
          <Card>
            <div className="p-8 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Your Resume Score</p>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9155" fill="none"
                    stroke={score>=80?"#22c55e":score>=50?"#0ea5e9":"#f59e0b"}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${score} ${100-score}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-gray-900">{score}</span>
                  <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
                </div>
              </div>
              <p className={`text-sm font-bold ${score>=80?"text-emerald-500":score>=50?"text-sky-500":"text-amber-500"}`}>
                {score>=80?"Excellent! Ready to impress.":score>=50?"Good — a few more tweaks!":"Needs improvement"}
              </p>
            </div>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader icon="fa-solid fa-list-check" title="Completion Checklist" subtitle="Check off every item for the best results" />
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: "Full name added", done: !!(data.contact.firstName && data.contact.lastName) },
                { label: "Valid email address", done: !!data.contact.email && !validateEmail(data.contact.email) },
                { label: "Phone number", done: !!data.contact.phone },
                { label: "Job title / Desired role", done: !!data.contact.jobTitle },
                { label: "City / Location", done: !!data.contact.city },
                { label: "LinkedIn profile", done: !!data.contact.linkedin },
                { label: "Professional summary", done: data.summary.length > 80 },
                { label: "1+ work experience", done: data.experience.length > 0 },
                { label: "Education added", done: data.education.length > 0 },
{ label: "3+ skills added", done: data.skills.length >= 3 },
                { label: "Projects added", done: data.projects.length > 0 },
                { label: "Certifications", done: data.certs.length > 0 },
                { label: "Custom section", done: data.custom.length > 0 },
              ].map(item => (
                <div key={item.label} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${item.done?"bg-emerald-50":"bg-gray-50"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${item.done?"bg-emerald-500":"bg-gray-200"}`}>
                    <i className={`fa-solid text-white text-[9px] ${item.done?"fa-check":"fa-minus"}`}/>
                  </div>
                  <span className={`text-xs font-medium ${item.done?"text-emerald-700":"text-gray-400"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

{/* Template picker */}
          <Card>
            <CardHeader icon="fa-solid fa-layout" title="Pick a Template" subtitle="Choose a design that fits your industry" />
            <div className="p-6 grid grid-cols-3 gap-3">
              {TEMPLATES.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`rounded-xl border-2 cursor-pointer transition-all p-3 text-center ${selectedTemplate === t.id ? "border-sky-500 bg-sky-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                >
                  <div className={`h-20 rounded-lg mb-3 flex flex-col justify-end items-center pb-2 gap-1 ${
                    t.id === "classic" ? "bg-gray-100" : t.id === "modern" ? "bg-sky-100" : "bg-gray-50"
                  }`}>
                    {t.id === "classic" && (
                      <>
                        <div className="h-2 w-12 bg-gray-400 rounded-sm mb-1"/>
                        <div className="h-1 w-10 bg-gray-300 rounded-full"/>
                        <div className="h-1 w-8 bg-gray-300 rounded-full"/>
                      </>
                    )}
                    {t.id === "modern" && (
                      <>
                        <div className="h-4 w-full bg-gray-700 rounded-t-lg -mb-1"/>
                        <div className="h-1 w-8 bg-gray-200 rounded-full mt-2"/>
                        <div className="h-1 w-6 bg-gray-200 rounded-full"/>
                      </>
                    )}
                    {t.id === "minimal" && (
                      <>
                        <div className="h-1.5 w-10 bg-gray-300 rounded-full"/>
                        <div className="h-0.5 w-12 bg-gray-200 mt-1"/>
                        <div className="h-1 w-8 bg-gray-200 rounded-full"/>
                      </>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-700">{t.name}</p>
                  <p className={`text-[10px] mt-0.5 ${selectedTemplate === t.id ? "text-sky-500 font-bold" : "text-gray-400"}`}>{t.tag}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Color picker */}
          <Card>
            <CardHeader icon="fa-solid fa-palette" title="Choose a Color" subtitle="Personalize your resume with your favorite accent color" />
            <div className="p-6">
              <div className="grid grid-cols-6 gap-3">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedColor === color.id 
                        ? "border-gray-900 bg-gray-50" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${color.primary} ${selectedColor === color.id ? "ring-2 ring-offset-2 ring-gray-900" : ""}`}/>
                    <span className={`text-[10px] font-semibold ${selectedColor === color.id ? "text-gray-900" : "text-gray-500"}`}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Download */}
          <Card>
            <div className="p-6">
              <PDFDownloadLink 
  document={
    <ResumePDF 
      data={data} 
      template={selectedTemplate} // Pass modern, classic, or minimal
      color={selectedColor}       // Pass blue, emerald, etc.
    />
  } 
  fileName={`${data.contact.firstName || 'Resume'}_CV.pdf`}
  style={{ textDecoration: 'none' }}
>
  {({ loading }) => (
    <button className={`w-full inline-flex items-center justify-center gap-2 ${currentColor.primary} text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm`}>
      <i className="fa-solid fa-download"/>
      {loading ? "Generating PDF..." : "Download High-Res PDF"}
    </button>
  )}
</PDFDownloadLink>
            </div>
          </Card>
        </div>
      );
    }
  };

// ═══════════════════════════════════════════════════════════════════════════
  // LIVE PREVIEW - Supports 3 templates with color customization
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Color mapping for dynamic accent classes
  const accentTextClass = {
    blue: "text-sky-600", emerald: "text-emerald-600", violet: "text-violet-600",
    rose: "text-rose-600", amber: "text-amber-600", slate: "text-slate-600"
  }[selectedColor];

  const accentBorderClass = {
    blue: "border-sky-500", emerald: "border-emerald-500", violet: "border-violet-500",
    rose: "border-rose-500", amber: "border-amber-500", slate: "border-slate-500"
  }[selectedColor];

  const Preview = () => {
    // ─── CLASSIC TEMPLATE ──────────────────────────────────────────────────
    if (selectedTemplate === "classic") {
      return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-[11px] overflow-hidden" style={{ fontFamily:"'Times New Roman', serif" }}>
          <div className="px-5 py-5">
            {/* Header - centered, classic style */}
            <div className="text-center border-b-2 pb-3 mb-4" style={{ borderColor: currentColor.id === "blue" ? "#0ea5e9" : currentColor.id === "emerald" ? "#10b981" : currentColor.id === "violet" ? "#8b5cf6" : currentColor.id === "rose" ? "#f43f5e" : currentColor.id === "amber" ? "#f59e0b" : "#64748b" }}>
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
                {data.contact.firstName || "First"} {data.contact.lastName || "Last"}
              </h2>
              {data.contact.jobTitle && <p className={`text-xs mt-1 font-medium ${accentTextClass}`}>{data.contact.jobTitle}</p>}
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-2 text-gray-600 text-[10px]">
                {data.contact.email &&  <span> <i className="fa-solid fa-envelope text-[9px]"/> {data.contact.email}</span>}
                {data.contact.phone && <span><i className="fa-solid fa-phone text-[9px]"/> {data.contact.phone}</span>}
                {data.contact.city && <span><i className="fa-solid fa-location-dot text-[9px]"/> {data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {data.summary && <ClassicSection title="Professional Summary" color={selectedColor}><p className="text-[10px] text-gray-700 leading-relaxed">{data.summary}</p></ClassicSection>}
              {data.experience.length > 0 && (
                <ClassicSection title="Experience" color={selectedColor}>
                  {data.experience.map(e => (
                    <div key={e.id} className="mb-2 last:mb-0">
                      <div className="flex justify-between items-baseline">
                        <p className={`font-bold text-[11px] ${accentTextClass}`}>{e.position || "Position"}</p>
                        <span className="text-[9px] text-gray-500">{e.startDate}{e.startDate?" – ":""}{e.current?"Present":e.endDate}</span>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-800 "> At {e.company}</p>
                      {e.description && <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{e.description}</p>}
                    </div>
                  ))}
                </ClassicSection>
              )}
              {data.education.length > 0 && (
                <ClassicSection title="Education" color={selectedColor}>
                  {data.education.map(e => (
                    <div key={e.id} className="mb-2 last:mb-0">
                      <div className="flex justify-between items-baseline">
                        <p className={`font-bold text-[11px] ${accentTextClass}`}>{e.degree}{e.field?` in ${e.field}`:""}</p>
                        <span className="text-[9px] text-gray-500">{e.startDate}{e.startDate?" – ":""}{e.current?"Present":e.endDate}</span>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-800">{e.institution}</p>
                      {e.grade && <p className="text-[10px] text-gray-500">Grade: {e.grade}</p>}
                    </div>
                  ))}
                </ClassicSection>
              )}
              {data.skills.length > 0 && (
                <ClassicSection title="Skills" color={selectedColor}>
                  <p className="text-[10px] text-gray-700">{data.skills.map(s => s.name).join(" • ")}</p>
                </ClassicSection>
              )}
              {data.projects.length > 0 && (
                <ClassicSection title="Projects" color={selectedColor}>
                  {data.projects.map(p => (
                    <div key={p.id} className="mb-2 last:mb-0">
                      <div className="flex items-baseline gap-2">
                        <p className="font-bold text-[11px] text-gray-900">{p.title || "Project"}</p>
                        {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className={`text-[9px] ${accentTextClass} hover:underline`}>[Link]</a>}
                      </div>
                      {p.description && <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{p.description}</p>}
                    </div>
                  ))}
                </ClassicSection>
              )}
              {data.certs.length > 0 && (
                <ClassicSection title="Certifications" color={selectedColor}>
                  {data.certs.map(c => (
                    <div key={c.id} className="text-[10px] mb-1 last:mb-0">
                      <span className="font-semibold text-gray-800">{c.name}</span>
                      <span className="text-gray-500"> — {c.issuer}{c.year?`, ${c.year}`:""}</span>
                    </div>
                  ))}
                </ClassicSection>
              )}
              {data.custom.filter(c => c.heading).map(c => (
                <ClassicSection key={c.id} title={c.heading} color={selectedColor}>
                  <p className="text-[10px] text-gray-700 leading-relaxed whitespace-pre-line">{c.content}</p>
                </ClassicSection>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ─── MODERN TEMPLATE ───────────────────────────────────────────────────
    if (selectedTemplate === "modern") {
      return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-[11px] overflow-hidden" style={{ fontFamily:"Georgia, serif" }}>
          <div className={`${currentColor.headerBg} px-5 py-5 ${currentColor.headerText}`}>
            <h2 className="font-bold text-base leading-tight tracking-tight">
              {data.contact.firstName || "First"}{" "}{data.contact.lastName || "Last"}
            </h2>
            {data.contact.jobTitle && <p className={`${currentColor.accent} text-xs mt-0.5 font-medium`}>{data.contact.jobTitle}</p>}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2.5 text-gray-400 text-[10px]">
              {data.contact.email && <span className="flex items-center gap-1"><i className="fa-solid fa-envelope text-[9px]"/>{data.contact.email}</span>}
              {data.contact.phone && <span className="flex items-center gap-1"><i className="fa-solid fa-phone text-[9px]"/>{data.contact.phone}</span>}
              {data.contact.city && <span className="flex items-center gap-1"><i className="fa-solid fa-location-dot text-[9px]"/>{data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</span>}
              {data.contact.linkedin && <span className="flex items-center gap-1"><i className="fa-brands fa-linkedin text-[9px]"/>LinkedIn</span>}
              {data.contact.website && <span className="flex items-center gap-1"><i className="fa-solid fa-globe text-[9px]"/>Portfolio</span>}
            </div>
          </div>

          <div className="px-5 py-4 flex flex-col gap-3.5">
            {data.summary && <ModernSection title="Summary" color={selectedColor}><p className="text-[10px] text-gray-600 leading-relaxed">{data.summary}</p></ModernSection>}
            {data.experience.length > 0 && (
              <ModernSection title="Experience" color={selectedColor}>
                {data.experience.map(e => (
                  <div key={e.id} className="mb-2 last:mb-0">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <p className={`font-bold text-[11px] ${accentTextClass}`}>{e.position || "Position"}</p>
                      <span className="text-[9px] text-gray-400">{e.startDate}{e.startDate?" – ":""}{e.current?"Present":e.endDate}</span>
                    </div>
                    <p className="text-[10px] font-semibold" >{e.company}</p>
                    {e.description && <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{e.description}</p>}
                  </div>
                ))}
              </ModernSection>
            )}
            {data.education.length > 0 && (
              <ModernSection title="Education" color={selectedColor}>
                {data.education.map(e => (
                  <div key={e.id} className="mb-2 last:mb-0">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <p className={`font-bold text-[11px] ${accentTextClass}`}>{e.degree}{e.field?` in ${e.field}`:""}</p>
                      <span className="text-[9px] text-gray-400">{e.startDate}{e.startDate?" – ":""}{e.current?"Present":e.endDate}</span>
                    </div>
                    <p className="text-[10px] font-semibold" >{e.institution}</p>
                    {e.grade && <p className="text-[10px] text-gray-400">Grade: {e.grade}  GPA</p>}
                  </div>
                ))}
              </ModernSection>
            )}
            {data.skills.length > 0 && (
              <ModernSection title="Skills" color={selectedColor}>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map(s => (
                    <span key={s.id} className={`${currentColor.skillBg} ${currentColor.skillText} border ${currentColor.skillBorder} px-2 py-0.5 rounded-md text-[10px] font-medium`}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </ModernSection>
            )}
            {data.projects.length > 0 && (
              <ModernSection title="Projects" color={selectedColor}>
                {data.projects.map(p => (
                  <div key={p.id} className="mb-2 last:mb-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="font-bold text-[11px] text-gray-900">{p.title || "Project"}</p>
                      {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className={`text-[9px] ${accentTextClass} hover:underline`}><i className="fa-solid fa-external-link text-[8px] mr-0.5"/>Link</a>}
                    </div>
                    {p.description && <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{p.description}</p>}
                  </div>
                ))}
              </ModernSection>
            )}
            {data.certs.length > 0 && (
              <ModernSection title="Certifications" color={selectedColor}>
                {data.certs.map(c => (
                  <div key={c.id} className="flex justify-between text-[10px] mb-1 last:mb-0">
                    <span className="font-semibold text-gray-800">{c.name}   </span>
                    <span className="font-semibold text-gray-600"> {c.issuer}</span>
                    <span className="text-gray-400">{c.year?` · ${c.year}`:""}</span>
                  </div>
                ))}
              </ModernSection>
            )}
            {data.custom.filter(c => c.heading).map(c => (
              <ModernSection key={c.id} title={c.heading} color={selectedColor}>
                <p className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-line">{c.content}</p>
              </ModernSection>
            ))}
          </div>
        </div>
      );
    }

    // ─── MINIMAL TEMPLATE ──────────────────────────────────────────────────
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-[11px] overflow-hidden" style={{ fontFamily:"'Helvetica Neue', sans-serif" }}>
        <div className="px-5 py-5">
          {/* Header - minimal, left aligned */}
          <div className={`pb-3 mb-4 border-b ${accentBorderClass}`}>
            <h2 className="text-base font-light text-gray-900 tracking-wide">
              {data.contact.firstName || "FName"} {data.contact.lastName || "LName"}
            </h2>
            {data.contact.jobTitle && <p className={`text-[10px]  mt-1  ${accentTextClass}`}>{data.contact.jobTitle}</p>}
            <div className="flex flex-wrap gap-x-2  mt-1 text-gray-400 text-[9px]">
              {data.contact.email && <span><i className="fa-solid fa-envelope text-[9px]"/> {data.contact.email}</span>}
              {data.contact.phone && <span>|</span>}
              {data.contact.phone && <span> <i className="fa-solid fa-phone text-[9px]"/> {data.contact.phone}</span>}
              {data.contact.city && <span>|</span>}
              {data.contact.city && <span> <i className="fa-solid fa-location-dot text-[9px]"/> {data.contact.city}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {data.summary && <MinimalSection title="About" color={selectedColor}><p className="text-[10px] text-gray-600 leading-relaxed">{data.summary}</p></MinimalSection>}
            {data.experience.length > 0 && (
              <MinimalSection title="Experience" color={selectedColor}>
                {data.experience.map(e => (
                  <div key={e.id} className="mb-3 last:mb-0">
                    <p className={`text-[11px] font-medium ${accentTextClass}`}>{e.position || "Position"}</p>
                    <p className="text-[10px] text-gray-600 ">{e.company} <span className="text-gray-400">• {e.startDate}{e.startDate?" – ":""}{e.current?"Present":e.endDate}</span></p>
                    {e.description && <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{e.description}</p>}
                  </div>
                ))}
              </MinimalSection>
            )}
            {data.education.length > 0 && (
              <MinimalSection title="Education" color={selectedColor}>
                {data.education.map(e => (
                  <div key={e.id} className="mb-2 last:mb-0">
                    <p className="text-[11px] font-medium text-gray-800">{e.degree}{e.field?`, ${e.field}`:""}</p>
                    <p className={`text-[10px] ${accentTextClass}`}>{e.institution} <span className="text-gray-400">• {e.current?"Present":e.endDate}</span></p>
                  </div>
                ))}
              </MinimalSection>
            )}
            {data.skills.length > 0 && (
              <MinimalSection title="Skills" color={selectedColor}>
                <p className="text-[10px] text-gray-600">{data.skills.map(s => s.name).join(", ")}</p>
              </MinimalSection>
            )}
            {data.projects.length > 0 && (
              <MinimalSection title="Projects" color={selectedColor}>
                {data.projects.map(p => (
                  <div key={p.id} className="mb-2 last:mb-0">
                    <p className="text-[11px] font-medium text-gray-800">{p.title || "Project"}{p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className={`text-[9px] ml-1 ${accentTextClass} hover:underline`}>[Link]</a>}</p>
                    {p.description && <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{p.description}</p>}
                  </div>
                ))}
              </MinimalSection>
            )}
            {data.certs.length > 0 && (
              <MinimalSection title="Certifications" color={selectedColor}>
                {data.certs.map(c => (
                  <p key={c.id} className="text-[10px] text-gray-600 mb-0.5 last:mb-0">{c.name} — {c.issuer}{c.year?` (${c.year})`:""}</p>
                ))}
              </MinimalSection>
            )}
            {data.custom.filter(c => c.heading).map(c => (
              <MinimalSection key={c.id} title={c.heading} color={selectedColor}>
                <p className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-line">{c.content}</p>
              </MinimalSection>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Section components for each template
  const ClassicSection = ({ title, children }: { title: string; color: ColorName; children: React.ReactNode }) => (
    <div>
      <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider pb-0.5 mb-1.5 border-b border-gray-300">{title}</h4>
      {children}
    </div>
  );

  const ModernSection = ({ title, children }: { title: string; color: ColorName; children: React.ReactNode }) => (
    <div>
      <h4 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest pb-1 mb-1.5 border-b border-gray-100">{title}</h4>
      {children}
    </div>
  );

  const MinimalSection = ({ title, children }: { title: string; color: ColorName; children: React.ReactNode }) => (
    <div>
      <h4 className={`text-[9px] font-semibold uppercase tracking-widest mb-1.5 border-gray-100`}>{title}</h4>
      {children}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>

      <div className="min-h-screen bg-gray-50/80" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>

        {/* ── TOPNAV ── */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
            <a href="/" className="flex items-center gap-2 font-extrabold text-gray-900 text-base">
              <span className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white text-sm">
                <i className="fa-solid fa-file-lines"/>
              </span>
              MakeResume<span className="text-sky-500">.in</span>
            </a>

            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
              <div className={`w-2 h-2 rounded-full transition-colors ${score>=80?"bg-emerald-400":score>=50?"bg-sky-400":"bg-amber-400"}`}/>
              <span className="text-xs font-bold text-gray-600">Score: <span className={score>=80?"text-emerald-600":score>=50?"text-sky-600":"text-amber-600"}>{score}/100</span></span>
            </div>

            <button className="lg:hidden inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 border border-sky-200 bg-sky-50 px-3 py-1.5 rounded-xl"
              onClick={() => setPreviewOpen(p => !p)}>
              <i className={`fa-solid text-[10px] ${previewOpen?"fa-eye-slash":"fa-eye"}`}/>
              {previewOpen?"Hide":"Preview"}
            </button>

            <div className="hidden sm:flex items-center gap-2">
                <button onClick={deleteDraft} className="text-xs font-semibold text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                <i className="fa-solid fa-floppy-disk text-[11px]"/>Delete Draft
              </button>

              <button onClick={saveDraft} className="text-xs font-semibold text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                <i className="fa-solid fa-floppy-disk text-[11px]"/>Save Draft
              </button>
             
            </div>
          </div>
        </header>

        {/* ── STEP TABS ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto">
              {STEPS.map(s => (
                <button key={s.id} onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-4 text-[11px] font-bold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                    step===s.id ? "border-sky-500 text-sky-600"
                    : step>s.id ? "border-emerald-400 text-emerald-500"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <i className={`${s.icon} text-[10px]`}/>
                  {s.label}
                  {step>s.id && <i className="fa-solid fa-check text-[8px] ml-0.5"/>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-6">

            {/* FORM SIDE */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                      <i className={`${STEPS[step].icon} text-sky-500 text-sm`}/>
                    </span>
                    {STEPS[step].label}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 ml-10">
                    {[
                      "Your contact details — so recruiters know how to reach you.",
                      "A 2–4 sentence pitch. Recruiters read this first.",
                      "Your work history — list the most recent role first.",
                      "Your academic background and degrees.",
                      "Technical and soft skills with proficiency levels.",
                      "Professional certifications and credentials.",
                      "Add any extra sections — projects, languages, awards, etc.",
                      "Review your resume, pick a template, and download.",
                    ][step]}
                  </p>
                </div>
                <span className="hidden sm:block text-xs text-gray-300 font-medium shrink-0">
                  {step+1} / {STEPS.length}
                </span>
              </div>

              {renderStep()}

              {/* Nav */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => setStep(s => Math.max(0,s-1))} disabled={step===0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <i className="fa-solid fa-arrow-left text-xs"/> Back
                </button>
                {step < STEPS.length-1 ? (
                  <button onClick={() => setStep(s => Math.min(STEPS.length-1,s+1))}
                    className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-sky-200 hover:shadow-md">
                    Next: {STEPS[step+1].label} <i className="fa-solid fa-arrow-right text-xs"/>
                  </button>
                ) : (
                  <button  onClick={saveandpreview} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm">
                    <i className="fa-solid fa-download text-xs"/> Preview & Download
                  </button>
                )}
              </div>
            </div>

            {/* PREVIEW SIDE */}
            <div >
              <div className="sticky top-[120px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fa-solid fa-eye text-sky-400"/>Live Preview
                  </span>
                  <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${score>=80?"bg-emerald-50 text-emerald-600":score>=50?"bg-sky-50 text-sky-600":"bg-amber-50 text-amber-600"}`}>
                    <i className="fa-solid fa-chart-simple text-[9px]"/>{score}/100
                  </div>
                </div>
                <div ref={previewRef} className="print-container">
      <Preview />
    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
