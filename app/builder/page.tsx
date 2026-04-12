"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import toast from "react-hot-toast";

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

// ─── NEW: Grouped Skills ──────────────────────────────────────────────────────
interface SkillGroup {
  id: number;
  heading: string;   // e.g. "Languages", "Frontend", "Tools"
  skills: string;    // comma-separated, e.g. "JavaScript, TypeScript, Python"
}

interface ProjectEntry { id: number; title: string; description: string; link: string; }
interface CertEntry    { id: number; name: string; issuer: string; year: string; }
interface CustomSection { id: number; heading: string; content: string; }
interface Errors { [key: string]: string; }

type TemplateName = "classic" | "modern" | "minimal";
type ColorName = "blue" | "emerald" | "violet" | "rose" | "amber" | "slate";

interface TemplateConfig { id: TemplateName; name: string; tag: string; description: string; }
interface ColorConfig {
  id: ColorName; name: string;
  primary: string; primaryLight: string; primaryDark: string;
  headerBg: string; headerText: string; accent: string;
  skillBg: string; skillText: string; skillBorder: string;
  hex: string; hexLight: string; hexBorder: string; hexTag: string; hexTagT: string;
}

interface ResumeData {
  contact: ContactData; summary: string;
  experience: ExpEntry[]; education: EduEntry[];
  skillGroups: SkillGroup[];           // ← replaces flat skills[]
  projects: ProjectEntry[]; certs: CertEntry[]; custom: CustomSection[];
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

// ─── Default skill groups — ATS-structured ────────────────────────────────────
const DEFAULT_SKILL_GROUPS: SkillGroup[] = [
  { id: 1, heading: "Languages",  skills: "JavaScript, TypeScript, Python" },
  { id: 2, heading: "Frontend",   skills: "React, Next.js, Tailwind CSS" },
  { id: 3, heading: "Backend",    skills: "Node.js, Express, REST APIs" },
  { id: 4, heading: "Database",   skills: "MongoDB, PostgreSQL, SQL" },
  { id: 5, heading: "Tools",      skills: "Git, Docker, VS Code" },
  { id: 6, heading: "Soft Skills",skills: "Communication, Leadership, Agile" },
];

// Popular quick-add presets per category
const SKILL_PRESETS: Record<string, string[]> = {
  "Languages":     ["JavaScript","TypeScript","Python","Java","Go","Rust","C++","PHP","Ruby","Swift","Kotlin","C#"],
  "Frontend":      ["React","Next.js","Vue.js","Angular","Tailwind CSS","SCSS","Redux","Vite","Figma","Storybook"],
  "Backend":       ["Node.js","Express","FastAPI","Django","Spring Boot","Laravel","GraphQL","REST APIs","gRPC"],
  "Database":      ["MongoDB","PostgreSQL","MySQL","SQLite","Redis","Prisma","Supabase","Firebase"],
  "Tools":         ["Git","Docker","Kubernetes","CI/CD","AWS","GCP","Azure","Linux","Jira","Postman"],
  "Soft Skills":   ["Communication","Leadership","Problem Solving","Teamwork","Agile","Scrum","Mentoring"],
  "Mobile":        ["React Native","Flutter","Swift","Kotlin","Expo","iOS","Android"],
  "Data & AI":     ["Machine Learning","TensorFlow","PyTorch","Pandas","NumPy","SQL","Tableau","Power BI"],
  "DevOps":        ["Docker","Kubernetes","CI/CD","Terraform","Ansible","Jenkins","GitHub Actions","Nginx"],
  "Design":        ["Figma","Adobe XD","Photoshop","Illustrator","Canva","UI/UX","Wireframing","Prototyping"],
};

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES: TemplateConfig[] = [
  { id: "classic", name: "Classic", tag: "Traditional", description: "Clean, traditional layout" },
  { id: "modern",  name: "Modern",  tag: "Popular ✦",   description: "Bold header with accent colors" },
  { id: "minimal", name: "Minimal", tag: "Clean",        description: "Simple and elegant" },
];

const COLORS: ColorConfig[] = [
  { id:"blue",    name:"Blue",    primary:"bg-sky-500",     primaryLight:"bg-sky-50",    primaryDark:"bg-sky-600",    headerBg:"bg-gray-900",    headerText:"text-white", accent:"text-sky-400",    skillBg:"bg-sky-50",    skillText:"text-sky-700",    skillBorder:"border-sky-100",    hex:"#0284c7", hexLight:"#e0f2fe", hexBorder:"#bae6fd", hexTag:"#f0f9ff", hexTagT:"#0369a1" },
  { id:"emerald", name:"Emerald", primary:"bg-emerald-500", primaryLight:"bg-emerald-50",primaryDark:"bg-emerald-600",headerBg:"bg-emerald-900", headerText:"text-white", accent:"text-emerald-400",skillBg:"bg-emerald-50",skillText:"text-emerald-700",skillBorder:"border-emerald-100",hex:"#059669", hexLight:"#d1fae5", hexBorder:"#a7f3d0", hexTag:"#ecfdf5", hexTagT:"#047857" },
  { id:"violet",  name:"Violet",  primary:"bg-violet-500",  primaryLight:"bg-violet-50", primaryDark:"bg-violet-600", headerBg:"bg-violet-900",  headerText:"text-white", accent:"text-violet-400", skillBg:"bg-violet-50", skillText:"text-violet-700", skillBorder:"border-violet-100", hex:"#7c3aed", hexLight:"#ede9fe", hexBorder:"#ddd6fe", hexTag:"#f5f3ff", hexTagT:"#6d28d9" },
  { id:"rose",    name:"Rose",    primary:"bg-rose-500",    primaryLight:"bg-rose-50",   primaryDark:"bg-rose-600",   headerBg:"bg-rose-900",    headerText:"text-white", accent:"text-rose-400",   skillBg:"bg-rose-50",   skillText:"text-rose-700",   skillBorder:"border-rose-100",   hex:"#e11d48", hexLight:"#ffe4e6", hexBorder:"#fecdd3", hexTag:"#fff1f2", hexTagT:"#be123c" },
  { id:"amber",   name:"Amber",   primary:"bg-amber-500",   primaryLight:"bg-amber-50",  primaryDark:"bg-amber-600",  headerBg:"bg-amber-900",   headerText:"text-white", accent:"text-amber-400",  skillBg:"bg-amber-50",  skillText:"text-amber-700",  skillBorder:"border-amber-100",  hex:"#d97706", hexLight:"#fef3c7", hexBorder:"#fde68a", hexTag:"#fffbeb", hexTagT:"#b45309" },
  { id:"slate",   name:"Slate",   primary:"bg-slate-600",   primaryLight:"bg-slate-50",  primaryDark:"bg-slate-700",  headerBg:"bg-slate-800",   headerText:"text-white", accent:"text-slate-300",  skillBg:"bg-slate-100", skillText:"text-slate-700",  skillBorder:"border-slate-200",  hex:"#475569", hexLight:"#f1f5f9", hexBorder:"#cbd5e1", hexTag:"#f8fafc", hexTagT:"#334155" },
];

// ─── Validation helpers ───────────────────────────────────────────────────────
const validateEmail = (v: string) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address" : "";
const validatePhone = (v: string) => v && !/^[+]?[\d\s\-().]{7,15}$/.test(v) ? "Enter a valid phone number" : "";
const validateDate  = (v: string) => v && !/^(0[1-9]|1[0-2])\/\d{4}$|^\d{4}$/.test(v.trim()) ? "Use MM/YYYY or YYYY format" : "";
const validateYear  = (v: string) => v && !/^\d{4}$/.test(v.trim()) ? "Enter a 4-digit year" : "";
const validateURL   = (v: string) => v && !/^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/.*)?$/i.test(v) ? "Enter a valid URL" : "";

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
  const totalSkills = d.skillGroups.reduce((n, g) => n + g.skills.split(",").filter(s=>s.trim()).length, 0);
  if (totalSkills >= 3) s += 10;
  if (d.projects.length > 0) s += 5;
  if (d.certs.length > 0)    s += 5;
  if (d.custom.length > 0)   s += 5;
  return Math.min(s, 100);
}

const defaultData: ResumeData = {
  contact: { firstName:"", lastName:"", email:"", phone:"", jobTitle:"", city:"", country:"India", linkedin:"", website:"" },
  summary: "",
  experience: [], education: [],
  skillGroups: DEFAULT_SKILL_GROUPS,
  projects: [], certs: [], custom: [],
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function FieldWrap({ label, required, error, children }: { label:string; required?:boolean; error?:string; children:React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
        {label}{required && <span className="text-sky-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5"><i className="fa-solid fa-circle-exclamation text-[10px]"/>{error}</p>}
    </div>
  );
}

function Input({ label, placeholder, value, onChange, type="text", icon, required, error }: {
  label:string; placeholder:string; value:string; onChange:(v:string)=>void;
  type?:string; icon?:string; required?:boolean; error?:string;
}) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"><i className={icon}/></span>}
        <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
          className={`w-full bg-white border ${error?"border-red-300 focus:ring-red-300":"border-gray-200 focus:ring-sky-400"} rounded-xl ${icon?"pl-9":"px-3"} px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
        />
        {error && <i className="fa-solid fa-circle-exclamation absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs"/>}
      </div>
    </FieldWrap>
  );
}

function Textarea({ label, placeholder, value, onChange, rows=4 }: { label:string; placeholder:string; value:string; onChange:(v:string)=>void; rows?:number }) {
  return (
    <FieldWrap label={label}>
      <textarea rows={rows} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none transition-all"
      />
    </FieldWrap>
  );
}

function Card({ children, className="" }: { children:React.ReactNode; className?:string }) {
  return <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>{children}</div>;
}

function CardHeader({ icon, title, subtitle }: { icon:string; title:string; subtitle:string }) {
  return (
    <div className="px-6 pt-6 pb-4 border-b border-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
          <i className={`${icon} text-sky-500 text-sm`}/>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{title}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle, onClick, btnLabel }: { icon:string; title:string; subtitle:string; onClick:()=>void; btnLabel:string }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 mx-auto mb-4 flex items-center justify-center">
        <i className={`${icon} text-sky-300 text-2xl`}/>
      </div>
      <p className="font-bold text-gray-700 text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-5">{subtitle}</p>
      <button onClick={onClick} className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
        <i className="fa-solid fa-plus text-[10px]"/>{btnLabel}
      </button>
    </div>
  );
}

function AddMoreBtn({ onClick, label }: { onClick:()=>void; label:string }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-sky-400 text-gray-400 hover:text-sky-500 text-xs font-bold py-3 rounded-xl transition-all mt-3">
      <i className="fa-solid fa-plus text-[10px]"/>{label}
    </button>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>(defaultData);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{[k:string]:boolean}>({});
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("modern");
  const [selectedColor, setSelectedColor] = useState<ColorName>("blue");
  // Track which skill group's preset panel is open
  const [openPreset, setOpenPreset] = useState<number|null>(null);

  const currentColor = COLORS.find(c=>c.id===selectedColor) || COLORS[0];
  const score = calcScore(data);

  const setC = (k: keyof ContactData, v: string) =>
    setData(d => ({ ...d, contact: { ...d.contact, [k]: v } }));

  const blurValidate = (field: string, value: string) => {
    setTouched(t=>({...t,[field]:true}));
    let err = "";
    if (field==="email") err=validateEmail(value);
    if (field==="phone") err=validatePhone(value);
    if (field==="linkedin"||field==="website") err=validateURL(value);
    setErrors(e=>({...e,[field]:err}));
  };
  const blurDate = (key:string,value:string)=>{setTouched(t=>({...t,[key]:true}));setErrors(e=>({...e,[key]:validateDate(value)}));};
  const blurYear = (key:string,value:string)=>{setTouched(t=>({...t,[key]:true}));setErrors(e=>({...e,[key]:validateYear(value)}));};

  const addExp = () => setData(d=>({...d,experience:[...d.experience,{id:Date.now(),company:"",position:"",startDate:"",endDate:"",current:false,description:""}]}));
  const updExp = (id:number,k:keyof ExpEntry,v:any) => setData(d=>({...d,experience:d.experience.map(e=>e.id===id?{...e,[k]:v}:e)}));
  const delExp = (id:number) => setData(d=>({...d,experience:d.experience.filter(e=>e.id!==id)}));

  const addEdu = () => setData(d=>({...d,education:[...d.education,{id:Date.now(),institution:"",degree:"",field:"",startDate:"",endDate:"",current:false,grade:""}]}));
  const updEdu = (id:number,k:keyof EduEntry,v:any) => setData(d=>({...d,education:d.education.map(e=>e.id===id?{...e,[k]:v}:e)}));
  const delEdu = (id:number) => setData(d=>({...d,education:d.education.filter(e=>e.id!==id)}));

  // ─── Skill Group CRUD ──────────────────────────────────────────────────────
  const addSkillGroup = () =>
    setData(d=>({...d,skillGroups:[...d.skillGroups,{id:Date.now(),heading:"",skills:""}]}));

  const updSkillGroup = (id:number, k:keyof SkillGroup, v:string) =>
    setData(d=>({...d,skillGroups:d.skillGroups.map(g=>g.id===id?{...g,[k]:v}:g)}));

  const delSkillGroup = (id:number) =>
    setData(d=>({...d,skillGroups:d.skillGroups.filter(g=>g.id!==id)}));

  // Add a skill chip to an existing group
  const addSkillToGroup = (groupId:number, skill:string) => {
    setData(d=>({...d,skillGroups:d.skillGroups.map(g=>{
      if(g.id!==groupId) return g;
      const current = g.skills.split(",").map(s=>s.trim()).filter(Boolean);
      if(current.includes(skill)) return g;
      return {...g, skills: current.length>0 ? current.join(", ")+", "+skill : skill};
    })}));
  };

  const removeSkillFromGroup = (groupId:number, skill:string) => {
    setData(d=>({...d,skillGroups:d.skillGroups.map(g=>{
      if(g.id!==groupId) return g;
      const updated = g.skills.split(",").map(s=>s.trim()).filter(s=>s&&s!==skill);
      return {...g, skills: updated.join(", ")};
    })}));
  };

  const addProject = () => setData(d=>({...d,projects:[...d.projects,{id:Date.now(),title:"",description:"",link:""}]}));
  const updProject = (id:number,k:keyof ProjectEntry,v:string) => setData(d=>({...d,projects:d.projects.map(p=>p.id===id?{...p,[k]:v}:p)}));
  const delProject = (id:number) => setData(d=>({...d,projects:d.projects.filter(p=>p.id!==id)}));

  const addCert = () => setData(d=>({...d,certs:[...d.certs,{id:Date.now(),name:"",issuer:"",year:""}]}));
  const updCert = (id:number,k:keyof CertEntry,v:string) => setData(d=>({...d,certs:d.certs.map(c=>c.id===id?{...c,[k]:v}:c)}));
  const delCert = (id:number) => setData(d=>({...d,certs:d.certs.filter(c=>c.id!==id)}));

  const addCustom = () => setData(d=>({...d,custom:[...d.custom,{id:Date.now(),heading:"",content:""}]}));
  const updCustom = (id:number,k:keyof CustomSection,v:string) => setData(d=>({...d,custom:d.custom.map(c=>c.id===id?{...c,[k]:v}:c)}));
  const delCustom = (id:number) => setData(d=>({...d,custom:d.custom.filter(c=>c.id!==id)}));

  const saveDraft = () => {
    try {
      const toastId = toast.loading("Saving draft...");
      localStorage.setItem("resume_draft", JSON.stringify(data));
      localStorage.setItem("resume_template", selectedTemplate);
      localStorage.setItem("resume_color", selectedColor);
      toast.success("Draft saved!", { id: toastId });
    } catch { toast.error("Failed to save draft"); }
  };

  const deleteDraft = () => {
    toast((t) => (
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <span>Delete your draft? This cannot be undone.</span>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{
            localStorage.removeItem("resume_draft");
            localStorage.removeItem("resume_template");
            localStorage.removeItem("resume_color");
            setData(defaultData);setSelectedTemplate("modern");setSelectedColor("blue");setStep(0);
            toast.success("Draft deleted");toast.dismiss(t.id);
          }} style={{background:"#e11d48",color:"#fff",padding:"4px 10px",borderRadius:6}}>Delete</button>
          <button onClick={()=>toast.dismiss(t.id)} style={{background:"#e5e7eb",padding:"4px 10px",borderRadius:6}}>Cancel</button>
        </div>
      </div>
    ));
  };

  const saveandpreview = () => { saveDraft(); window.location.href = "/preview"; };
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const saved = localStorage.getItem("resume_draft");
    if(saved){try{setData(JSON.parse(saved));}catch{}}
  },[]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP CONTENT
  // ═══════════════════════════════════════════════════════════════════════════
  const renderStep = () => {
    switch(step) {

      case 0: return (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader icon="fa-solid fa-user" title="Personal Information" subtitle="Basic details that appear at the top of your resume"/>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" placeholder="Rahul" value={data.contact.firstName} onChange={v=>setC("firstName",v)} icon="fa-solid fa-user" required error={!data.contact.firstName&&touched["firstName"]?"First name is required":""}/>
              <Input label="Last Name" placeholder="Sharma" value={data.contact.lastName} onChange={v=>setC("lastName",v)} icon="fa-solid fa-user"/>
              <div onBlur={()=>blurValidate("email",data.contact.email)}>
                <Input label="Email" placeholder="rahul@example.com" value={data.contact.email} onChange={v=>setC("email",v)} type="email" icon="fa-solid fa-envelope" required error={errors.email}/>
              </div>
              <div onBlur={()=>blurValidate("phone",data.contact.phone)}>
                <Input label="Phone" placeholder="+91 98765 43210" value={data.contact.phone} onChange={v=>setC("phone",v)} icon="fa-solid fa-phone" error={errors.phone}/>
              </div>
              <Input label="Desired Job Title" placeholder="Software Engineer" value={data.contact.jobTitle} onChange={v=>setC("jobTitle",v)} icon="fa-solid fa-briefcase"/>
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" placeholder="Mumbai" value={data.contact.city} onChange={v=>setC("city",v)} icon="fa-solid fa-location-dot"/>
                <Input label="Country" placeholder="India" value={data.contact.country} onChange={v=>setC("country",v)}/>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader icon="fa-solid fa-link" title="Online Presence" subtitle="Add your LinkedIn and portfolio to boost visibility"/>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onBlur={()=>blurValidate("linkedin",data.contact.linkedin)}>
                <Input label="LinkedIn" placeholder="linkedin.com/in/rahulsharma" value={data.contact.linkedin} onChange={v=>setC("linkedin",v)} icon="fa-brands fa-linkedin" error={errors.linkedin}/>
              </div>
              <div onBlur={()=>blurValidate("website",data.contact.website)}>
                <Input label="Portfolio / Website" placeholder="rahulsharma.dev" value={data.contact.website} onChange={v=>setC("website",v)} icon="fa-solid fa-globe" error={errors.website}/>
              </div>
            </div>
          </Card>
        </div>
      );

      case 1: return (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader icon="fa-solid fa-align-left" title="Professional Summary" subtitle="A 2–4 sentence pitch that recruiters read first"/>
            <div className="p-6">
              <Textarea label="Summary" placeholder="Results-driven Software Engineer with 3+ years of experience building scalable web apps using React and Node.js. Passionate about clean code and great user experiences. Looking for a senior role at a product-first company." value={data.summary} onChange={v=>setData(d=>({...d,summary:v}))} rows={6}/>
              <div className="flex justify-between mt-2">
                <span className={`text-[11px] font-medium ${data.summary.length<80?"text-amber-500":data.summary.length<300?"text-emerald-500":"text-sky-500"}`}>
                  {data.summary.length<80?"Too short — aim for at least 80 characters":data.summary.length<300?"Good length ✓":"Great detail ✓"}
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
                  <i className="fa-solid fa-check text-sky-400 mt-0.5 shrink-0"/>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

      case 2: return (
        <div className="flex flex-col gap-4">
          {data.experience.length===0 ? (
            <Card><EmptyState icon="fa-solid fa-briefcase" title="No experience added" subtitle="Add your work history, starting with the most recent role." onClick={addExp} btnLabel="Add Experience"/></Card>
          ) : data.experience.map((exp,i)=>(
            <Card key={exp.id}>
              <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 text-[10px] font-extrabold flex items-center justify-center">{i+1}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Work Experience</span>
                </div>
                <button onClick={()=>delExp(exp.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-trash text-xs"/>
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Job Title" placeholder="Software Engineer" value={exp.position} onChange={v=>updExp(exp.id,"position",v)} icon="fa-solid fa-user-tie"/>
                <Input label="Company" placeholder="Google" value={exp.company} onChange={v=>updExp(exp.id,"company",v)} icon="fa-solid fa-building"/>
                <div onBlur={()=>blurDate(`exp_start_${exp.id}`,exp.startDate)}>
                  <Input label="Start Date (MM/YYYY)" placeholder="01/2022" value={exp.startDate} onChange={v=>updExp(exp.id,"startDate",v)} icon="fa-solid fa-calendar" error={errors[`exp_start_${exp.id}`]}/>
                </div>
                <div>
                  <div onBlur={()=>!exp.current&&blurDate(`exp_end_${exp.id}`,exp.endDate)}>
                    <Input label="End Date (MM/YYYY)" placeholder={exp.current?"Present":"12/2024"} value={exp.current?"":exp.endDate} onChange={v=>updExp(exp.id,"endDate",v)} icon="fa-solid fa-calendar-check" error={!exp.current?errors[`exp_end_${exp.id}`]:""}/>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" checked={exp.current} onChange={e=>{updExp(exp.id,"current",e.target.checked);if(e.target.checked)updExp(exp.id,"endDate","");}} className="accent-sky-500 w-3.5 h-3.5 rounded"/>
                    <span className="text-xs text-gray-500 font-medium">I currently work here</span>
                  </label>
                </div>
              </div>
              <div className="px-6 pb-6">
                <Textarea label="Key Responsibilities & Achievements" placeholder={"• Led a team of 5 engineers to deliver a new checkout system, reducing cart abandonment by 18%\n• Built REST APIs serving 2M+ daily requests"} value={exp.description} onChange={v=>updExp(exp.id,"description",v)} rows={4}/>
              </div>
            </Card>
          ))}
          {data.experience.length>0 && <AddMoreBtn onClick={addExp} label="Add Another Position"/>}
        </div>
      );

      case 3: return (
        <div className="flex flex-col gap-4">
          {data.education.length===0 ? (
            <Card><EmptyState icon="fa-solid fa-graduation-cap" title="No education added" subtitle="Add your degrees, diplomas, and academic background." onClick={addEdu} btnLabel="Add Education"/></Card>
          ) : data.education.map((edu,i)=>(
            <Card key={edu.id}>
              <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 text-[10px] font-extrabold flex items-center justify-center">{i+1}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Education</span>
                </div>
                <button onClick={()=>delEdu(edu.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-trash text-xs"/>
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Institution" placeholder="IIT Bombay" value={edu.institution} onChange={v=>updEdu(edu.id,"institution",v)} icon="fa-solid fa-school"/>
                <Input label="Degree" placeholder="B.Tech / MBA / BCA" value={edu.degree} onChange={v=>updEdu(edu.id,"degree",v)} icon="fa-solid fa-graduation-cap"/>
                <Input label="Field of Study" placeholder="Computer Science" value={edu.field} onChange={v=>updEdu(edu.id,"field",v)} icon="fa-solid fa-book"/>
                <Input label="Grade / CGPA / Percentage" placeholder="8.5 CGPA or 85%" value={edu.grade} onChange={v=>updEdu(edu.id,"grade",v)} icon="fa-solid fa-star"/>
                <div onBlur={()=>blurYear(`edu_start_${edu.id}`,edu.startDate)}>
                  <Input label="Start Year" placeholder="2019" value={edu.startDate} onChange={v=>updEdu(edu.id,"startDate",v)} icon="fa-solid fa-calendar" error={errors[`edu_start_${edu.id}`]}/>
                </div>
                <div>
                  <div onBlur={()=>!edu.current&&blurYear(`edu_end_${edu.id}`,edu.endDate)}>
                    <Input label="End Year" placeholder={edu.current?"Present":"2023 or Expected 2025"} value={edu.current?"":edu.endDate} onChange={v=>updEdu(edu.id,"endDate",v)} icon="fa-solid fa-calendar-check" error={!edu.current?errors[`edu_end_${edu.id}`]:""}/>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" checked={edu.current} onChange={e=>{updEdu(edu.id,"current",e.target.checked);if(e.target.checked)updEdu(edu.id,"endDate","");}} className="accent-sky-500 w-3.5 h-3.5 rounded"/>
                    <span className="text-xs text-gray-500 font-medium">I am currently studying here</span>
                  </label>
                </div>
              </div>
            </Card>
          ))}
          {data.education.length>0 && <AddMoreBtn onClick={addEdu} label="Add Another Degree"/>}
        </div>
      );

      // ═══ SKILLS — Grouped, ATS-structured ═══════════════════════════════════
      case 4: return (
        <div className="flex flex-col gap-4">

          {/* Info banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-shield-check text-emerald-500"/>ATS-Optimised Skill Format
            </p>
            <p className="text-[11px] text-emerald-600 leading-relaxed">
              Group your skills by category. ATS scanners and recruiters prefer structured skill sections over a flat comma list.
              Each group renders on the resume as <span className="font-bold">Category: Skill1, Skill2, Skill3</span>
            </p>
          </div>

          {/* Skill groups */}
          {data.skillGroups.map((group, gi) => {
            const chips = group.skills.split(",").map(s=>s.trim()).filter(Boolean);
            const presetKey = Object.keys(SKILL_PRESETS).find(k=>k.toLowerCase()===group.heading.toLowerCase()) || null;
            const presetSkills = presetKey ? SKILL_PRESETS[presetKey] : Object.values(SKILL_PRESETS).flat().filter((s,i,a)=>a.indexOf(s)===i);
            const isOpen = openPreset === group.id;

            return (
              <Card key={group.id}>
                {/* Group header */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
                      <i className="fa-solid fa-layer-group text-sky-500 text-[10px]"/>
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Skill Group {gi+1}</span>
                  </div>
                  <button onClick={()=>delSkillGroup(group.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-trash text-xs"/>
                  </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  {/* Heading input */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Category Heading</label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {["Languages","Frontend","Backend","Database","Tools","Mobile","Data & AI","DevOps","Design","Soft Skills"].map(preset=>(
                        <button key={preset} onClick={()=>updSkillGroup(group.id,"heading",preset)}
                          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${group.heading===preset?"border-sky-400 bg-sky-50 text-sky-600":"border-gray-200 bg-white text-gray-500 hover:border-sky-300 hover:text-sky-500"}`}
                        >{preset}</button>
                      ))}
                    </div>
                    <input
                      placeholder="Or type a custom heading…"
                      value={group.heading}
                      onChange={e=>updSkillGroup(group.id,"heading",e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Skills input */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Skills <span className="text-gray-400 font-normal normal-case">(comma-separated)</span></label>
                    <input
                      placeholder="e.g. React, Next.js, Tailwind CSS"
                      value={group.skills}
                      onChange={e=>updSkillGroup(group.id,"skills",e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Skill chips preview */}
                  {chips.length > 0 && (
                    <div>
                      <p className="text-[11px] text-gray-400 mb-2">Preview — click a chip to remove:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {chips.map((sk,si)=>(
                          <span key={si} onClick={()=>removeSkillFromGroup(group.id,sk)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all group"
                            title="Click to remove"
                          >
                            {sk}<i className="fa-solid fa-xmark text-[9px] opacity-50 group-hover:opacity-100"/>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick-add toggle */}
                  <div>
                    <button onClick={()=>setOpenPreset(isOpen?null:group.id)}
                      className="flex items-center gap-2 text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      <i className={`fa-solid ${isOpen?"fa-chevron-up":"fa-bolt"} text-amber-400 text-[10px]`}/>
                      {isOpen?"Hide quick-add":"Quick-add popular skills"}
                    </button>
                    {isOpen && (
                      <div className="mt-2 flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        {(presetSkills).slice(0,20).map(s=>{
                          const already = chips.includes(s);
                          return (
                            <button key={s} onClick={()=>!already&&addSkillToGroup(group.id,s)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${already?"border-sky-400 bg-sky-50 text-sky-600 cursor-default":"border-gray-200 bg-white text-gray-600 hover:border-sky-300 hover:text-sky-500 cursor-pointer"}`}
                            >
                              {already?<><i className="fa-solid fa-check text-[8px] mr-1"/>{s}</>:`+ ${s}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ATS preview line */}
                  {group.heading && chips.length>0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-mono">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Resume preview</p>
                      <p className="text-[12px] text-gray-700">
                        <span className="font-bold text-gray-900">{group.heading}:</span>{" "}
                        <span className="text-gray-600">{chips.join(", ")}</span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          <AddMoreBtn onClick={addSkillGroup} label="Add Skill Group"/>

          {/* ATS tip */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <i className="fa-solid fa-lightbulb text-amber-400 mt-0.5 shrink-0"/>
            <div>
              <p className="text-[11px] font-bold text-amber-700 mb-1">Why grouped skills score higher</p>
              <p className="text-[11px] text-amber-600 leading-relaxed">
                ATS systems match keywords against job descriptions by category. Having <span className="font-bold">Frontend: React, Next.js</span> is more scannable than a flat list — and recruiters spot your strengths in 6 seconds.
              </p>
            </div>
          </div>
        </div>
      );

      case 5: return (
        <div className="flex flex-col gap-4">
          {data.projects.length===0 ? (
            <Card><EmptyState icon="fa-solid fa-folder-open" title="No projects added" subtitle="Showcase your best work, side projects, or open source contributions." onClick={addProject} btnLabel="Add Project"/></Card>
          ) : data.projects.map((proj,i)=>(
            <Card key={proj.id}>
              <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 text-[10px] font-extrabold flex items-center justify-center">{i+1}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Project</span>
                </div>
                <button onClick={()=>delProject(proj.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-trash text-xs"/>
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <Input label="Project Title" placeholder="e.g. E-commerce Platform, Portfolio Website" value={proj.title} onChange={v=>updProject(proj.id,"title",v)} icon="fa-solid fa-cube"/>
                <Textarea label="Description" placeholder="Describe what the project does, technologies used, and your role/contributions." value={proj.description} onChange={v=>updProject(proj.id,"description",v)} rows={3}/>
                <Input label="Project Link (Optional)" placeholder="https://github.com/username/project or live URL" value={proj.link} onChange={v=>updProject(proj.id,"link",v)} icon="fa-solid fa-link"/>
              </div>
            </Card>
          ))}
          {data.projects.length>0 && <AddMoreBtn onClick={addProject} label="Add Another Project"/>}
        </div>
      );

      case 6: return (
        <div className="flex flex-col gap-4">
          {data.certs.length===0 ? (
            <Card><EmptyState icon="fa-solid fa-certificate" title="No certifications added" subtitle="Add AWS, Google, Coursera, or any other certification." onClick={addCert} btnLabel="Add Certification"/></Card>
          ) : (
            <Card>
              <CardHeader icon="fa-solid fa-certificate" title="Certifications" subtitle="Professional credentials and online course certificates"/>
              <div className="p-6 flex flex-col gap-4">
                {data.certs.map((cert,i)=>(
                  <div key={cert.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_36px] gap-3 items-end">
                    <Input label={i===0?"Certificate Name":""} placeholder="AWS Cloud Practitioner" value={cert.name} onChange={v=>updCert(cert.id,"name",v)} icon="fa-solid fa-award"/>
                    <Input label={i===0?"Issuing Organisation":""} placeholder="Amazon Web Services" value={cert.issuer} onChange={v=>updCert(cert.id,"issuer",v)} icon="fa-solid fa-building"/>
                    <div onBlur={()=>blurYear(`cert_${cert.id}`,cert.year)}>
                      <Input label={i===0?"Year":""} placeholder="2024" value={cert.year} onChange={v=>updCert(cert.id,"year",v)} error={errors[`cert_${cert.id}`]}/>
                    </div>
                    <button onClick={()=>delCert(cert.id)} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors shrink-0">
                      <i className="fa-solid fa-trash text-xs"/>
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6"><AddMoreBtn onClick={addCert} label="Add Another Certification"/></div>
            </Card>
          )}
        </div>
      );

      case 7: return (
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-r from-violet-50 to-white border border-violet-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-violet-700 mb-1 flex items-center gap-2"><i className="fa-solid fa-puzzle-piece text-violet-400"/>Custom Sections</p>
            <p className="text-xs text-violet-500">Add anything extra — Projects, Languages, Hobbies, Publications, Awards, Volunteering, etc.</p>
          </div>
          {data.custom.length===0 ? (
            <Card><EmptyState icon="fa-solid fa-puzzle-piece" title="No custom sections yet" subtitle="Create any section you need — Projects, Awards, Languages, and more." onClick={addCustom} btnLabel="Add Custom Section"/></Card>
          ) : data.custom.map((sec,i)=>(
            <Card key={sec.id}>
              <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 text-[10px] font-extrabold flex items-center justify-center">{i+1}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Section</span>
                </div>
                <button onClick={()=>delCustom(sec.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-trash text-xs"/>
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <Input label="Section Heading" placeholder="e.g. Projects, Languages, Awards, Hobbies…" value={sec.heading} onChange={v=>updCustom(sec.id,"heading",v)} icon="fa-solid fa-heading"/>
                <Textarea label="Section Content" placeholder={"Describe this section in detail.\n\nFor languages:\n• English — Fluent\n• Hindi — Native"} value={sec.content} onChange={v=>updCustom(sec.id,"content",v)} rows={5}/>
              </div>
            </Card>
          ))}
          {data.custom.length>0 && <AddMoreBtn onClick={addCustom} label="Add Another Section"/>}
        </div>
      );

      case 8: return (
        <div className="flex flex-col gap-4">
          <Card>
            <div className="p-8 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Your Resume Score</p>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke={score>=80?"#22c55e":score>=50?"#0ea5e9":"#f59e0b"} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${score} ${100-score}`}/>
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

          <Card>
            <CardHeader icon="fa-solid fa-list-check" title="Completion Checklist" subtitle="Check off every item for the best results"/>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {label:"Full name added",       done:!!(data.contact.firstName&&data.contact.lastName)},
                {label:"Valid email address",   done:!!data.contact.email&&!validateEmail(data.contact.email)},
                {label:"Phone number",          done:!!data.contact.phone},
                {label:"Job title",             done:!!data.contact.jobTitle},
                {label:"City / Location",       done:!!data.contact.city},
                {label:"LinkedIn profile",      done:!!data.contact.linkedin},
                {label:"Professional summary",  done:data.summary.length>80},
                {label:"1+ work experience",    done:data.experience.length>0},
                {label:"Education added",       done:data.education.length>0},
                {label:"3+ skills added",       done:data.skillGroups.reduce((n,g)=>n+g.skills.split(",").filter(s=>s.trim()).length,0)>=3},
                {label:"Projects added",        done:data.projects.length>0},
                {label:"Certifications",        done:data.certs.length>0},
                {label:"Custom section",        done:data.custom.length>0},
              ].map(item=>(
                <div key={item.label} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${item.done?"bg-emerald-50":"bg-gray-50"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${item.done?"bg-emerald-500":"bg-gray-200"}`}>
                    <i className={`fa-solid text-white text-[9px] ${item.done?"fa-check":"fa-minus"}`}/>
                  </div>
                  <span className={`text-xs font-medium ${item.done?"text-emerald-700":"text-gray-400"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader icon="fa-solid fa-layout" title="Pick a Template" subtitle="Choose a design that fits your industry"/>
            <div className="p-6 grid grid-cols-3 gap-3">
              {TEMPLATES.map(t=>(
                <button key={t.id} onClick={()=>setSelectedTemplate(t.id)}
                  className={`rounded-xl border-2 cursor-pointer transition-all p-3 text-center ${selectedTemplate===t.id?"border-sky-500 bg-sky-50":"border-gray-200 hover:border-gray-300 bg-white"}`}
                >
                  <div className={`h-20 rounded-lg mb-3 flex flex-col justify-end items-center pb-2 gap-1 ${t.id==="classic"?"bg-gray-100":t.id==="modern"?"bg-sky-100":"bg-gray-50"}`}>
                    {t.id==="classic"&&(<><div className="h-2 w-12 bg-gray-400 rounded-sm mb-1"/><div className="h-1 w-10 bg-gray-300 rounded-full"/><div className="h-1 w-8 bg-gray-300 rounded-full"/></>)}
                    {t.id==="modern"&&(<><div className="h-4 w-full bg-gray-700 rounded-t-lg -mb-1"/><div className="h-1 w-8 bg-gray-200 rounded-full mt-2"/><div className="h-1 w-6 bg-gray-200 rounded-full"/></>)}
                    {t.id==="minimal"&&(<><div className="h-1.5 w-10 bg-gray-300 rounded-full"/><div className="h-0.5 w-12 bg-gray-200 mt-1"/><div className="h-1 w-8 bg-gray-200 rounded-full"/></>)}
                  </div>
                  <p className="text-xs font-bold text-gray-700">{t.name}</p>
                  <p className={`text-[10px] mt-0.5 ${selectedTemplate===t.id?"text-sky-500 font-bold":"text-gray-400"}`}>{t.tag}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader icon="fa-solid fa-palette" title="Choose a Color" subtitle="Personalize your resume with your favorite accent color"/>
            <div className="p-6">
              <div className="grid grid-cols-6 gap-3">
                {COLORS.map(color=>(
                  <button key={color.id} onClick={()=>setSelectedColor(color.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedColor===color.id?"border-gray-900 bg-gray-50":"border-gray-200 hover:border-gray-300 bg-white"}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${color.primary} ${selectedColor===color.id?"ring-2 ring-offset-2 ring-gray-900":""}`}/>
                    <span className={`text-[10px] font-semibold ${selectedColor===color.id?"text-gray-900":"text-gray-500"}`}>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      );
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LIVE PREVIEW — grouped skills rendered as "Category: Skill1, Skill2"
  // ═══════════════════════════════════════════════════════════════════════════
  const ds = (e:{startDate:string;endDate:string;current:boolean}) =>
    `${e.startDate}${e.startDate?" – ":""}${e.current?"Present":e.endDate}`;

  const cp  = currentColor.hex;
  const cl  = currentColor.hexLight;
  const cb  = currentColor.hexBorder;
  const ct  = currentColor.hexTag;
  const ctt = currentColor.hexTagT;

  const secHeadStyle = (serif=false): React.CSSProperties => ({
    fontSize:8, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.13em",
    color:cp, borderBottom:`1.5px solid ${cb}`, paddingBottom:3, marginBottom:6, marginTop:12,
    fontFamily: serif?"Georgia,serif":undefined,
  });

  const entryTitle: React.CSSProperties = {fontWeight:700,fontSize:10.5,color:"#111827"};
  const entrySub:   React.CSSProperties = {fontSize:9.5,fontWeight:600,color:"#374151",marginTop:1};
  const entryDate:  React.CSSProperties = {fontSize:8.5,color:"#9ca3af",whiteSpace:"nowrap"};
  const entryBody:  React.CSSProperties = {fontSize:9.5,color:"#6b7280",lineHeight:1.65,marginTop:2,whiteSpace:"pre-line"};

  const PreviewContacts = ({white=false}:{white?:boolean}) => {
    const tc = white?"rgba(255,255,255,0.8)":"#9ca3af";
    const ic: React.CSSProperties = {marginRight:3,fontSize:7};
    return (
      <div style={{display:"flex",flexWrap:"wrap",gap:"0 12px",marginTop:6}}>
        {data.contact.email&&<span style={{fontSize:8.5,color:tc}}><i className="fa-solid fa-envelope" style={ic}/>{data.contact.email}</span>}
        {data.contact.phone&&<span style={{fontSize:8.5,color:tc}}><i className="fa-solid fa-phone" style={ic}/>{data.contact.phone}</span>}
        {data.contact.city &&<span style={{fontSize:8.5,color:tc}}><i className="fa-solid fa-location-dot" style={ic}/>{data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</span>}
      </div>
    );
  };

  const PreviewSummary = ({serif=false}:{serif?:boolean}) => !data.summary ? null : (
    <div>
      <div style={secHeadStyle(serif)}>Professional Summary</div>
      <p style={{...entryBody,marginTop:0}}>{data.summary}</p>
    </div>
  );

  const PreviewExp = ({serif=false}:{serif?:boolean}) => !data.experience.length ? null : (
    <div>
      <div style={secHeadStyle(serif)}>Experience</div>
      {data.experience.map(e=>(
        <div key={e.id} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <span style={entryTitle}>{e.position||"Position"}</span>
            <span style={entryDate}>{ds(e)}</span>
          </div>
          <div style={entrySub}>{e.company}</div>
          {e.description&&<div style={entryBody}>{e.description}</div>}
        </div>
      ))}
    </div>
  );

  const PreviewEdu = ({serif=false}:{serif?:boolean}) => !data.education.length ? null : (
    <div>
      <div style={secHeadStyle(serif)}>Education</div>
      {data.education.map(e=>(
        <div key={e.id} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <span style={entryTitle}>{e.degree}{e.field?` in ${e.field}`:""}</span>
            <span style={entryDate}>{ds(e)}</span>
          </div>
          <div style={entrySub}>{e.institution}</div>
        </div>
      ))}
    </div>
  );

  // ─── NEW: Grouped skills preview ──────────────────────────────────────────
  const PreviewSkills = ({serif=false,white=false}:{serif?:boolean;white?:boolean}) => {
    const activeGroups = data.skillGroups.filter(g=>g.heading&&g.skills.trim());
    if(!activeGroups.length) return null;
    return (
      <div>
        <div style={secHeadStyle(serif)}>Skills</div>
        <div style={{display:"flex",flexDirection:"column",gap:3,marginTop:2}}>
          {activeGroups.map(g=>{
            const chips = g.skills.split(",").map(s=>s.trim()).filter(Boolean);
            return (
              <div key={g.id} style={{fontSize:9.5,color:white?"rgba(255,255,255,0.8)":"#374151",lineHeight:1.7,display:"flex",gap:4,flexWrap:"wrap",alignItems:"baseline"}}>
                <span style={{fontWeight:700,color:white?"rgba(255,255,255,0.95)":cp,minWidth:0,flexShrink:0}}>{g.heading}:</span>
                <span style={{color:white?"rgba(255,255,255,0.7)":"#6b7280"}}>{chips.join(", ")}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const PreviewProjects = ({serif=false}:{serif?:boolean}) => !data.projects.length ? null : (
    <div>
      <div style={secHeadStyle(serif)}>Projects</div>
      {data.projects.map(p=>(
        <div key={p.id} style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"baseline",gap:6}}>
            <span style={entryTitle}>{p.title||"Project"}</span>
            {p.link&&<a href={p.link} target="_blank" rel="noreferrer" style={{fontSize:8.5,color:cp,textDecoration:"none",fontWeight:600}}>↗</a>}
          </div>
          {p.description&&<div style={entryBody}>{p.description}</div>}
        </div>
      ))}
    </div>
  );

  const PreviewCerts = ({serif=false}:{serif?:boolean}) => !data.certs.length ? null : (
    <div>
      <div style={secHeadStyle(serif)}>Certifications</div>
      {data.certs.map(c=>(
        <div key={c.id} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={entrySub}>{c.name}</span>
          <span style={entryDate}>{c.issuer}{c.year?` · ${c.year}`:""}</span>
        </div>
      ))}
    </div>
  );

  const PreviewCustom = ({serif=false}:{serif?:boolean}) => (
    <>{data.custom.filter(c=>c.heading).map(c=>(
      <div key={c.id}>
        <div style={secHeadStyle(serif)}>{c.heading}</div>
        <p style={{...entryBody,marginTop:0}}>{c.content}</p>
      </div>
    ))}</>
  );

  const previewName = `${data.contact.firstName||"First"} ${data.contact.lastName||"Last"}`;

  const ClassicPreview = () => (
    <div style={{fontFamily:"Georgia,serif",fontSize:11,color:"#374151",padding:"20px 22px 22px"}}>
      <div style={{textAlign:"center",borderBottom:`2px solid ${cb}`,paddingBottom:10,marginBottom:0}}>
        <div style={{fontSize:18,fontWeight:800,color:"#111827",letterSpacing:-0.3}}>{previewName}</div>
        {data.contact.jobTitle&&<div style={{fontSize:10,color:cp,fontWeight:700,marginTop:2}}>{data.contact.jobTitle}</div>}
        <PreviewContacts/>
      </div>
      <PreviewSummary serif/><PreviewExp serif/><PreviewEdu serif/>
      <PreviewSkills serif/><PreviewProjects serif/><PreviewCerts serif/><PreviewCustom serif/>
    </div>
  );

  const ModernPreview = () => (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:11,color:"#374151"}}>
      <div style={{background:"#1e293b",padding:"18px 22px 16px"}}>
        <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{previewName}</div>
        {data.contact.jobTitle&&<div style={{fontSize:10,color:cp,fontWeight:700,marginTop:2}}>{data.contact.jobTitle}</div>}
        <PreviewContacts white/>
      </div>
      <div style={{padding:"0 22px 20px"}}>
        <PreviewSummary/><PreviewExp/><PreviewEdu/>
        <PreviewSkills/><PreviewProjects/><PreviewCerts/><PreviewCustom/>
      </div>
    </div>
  );

  const MinimalPreview = () => (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:11,color:"#374151",padding:"20px 22px 22px"}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:18,fontWeight:300,color:"#111827",letterSpacing:1.2,textTransform:"uppercase"}}>{previewName}</div>
        {data.contact.jobTitle&&<div style={{fontSize:10,color:cp,fontWeight:600,letterSpacing:0.5,marginTop:3}}>{data.contact.jobTitle}</div>}
        <div style={{height:1,background:cb,margin:"8px 0 0"}}/><PreviewContacts/>
      </div>
      <PreviewSummary/><PreviewExp/><PreviewEdu/>
      <PreviewSkills/><PreviewProjects/><PreviewCerts/><PreviewCustom/>
    </div>
  );

  const Preview = () => {
    if(selectedTemplate==="classic") return <ClassicPreview/>;
    if(selectedTemplate==="modern")  return <ModernPreview/>;
    return <MinimalPreview/>;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>

      <div className="min-h-screen bg-gray-50/80" style={{fontFamily:"'Plus Jakarta Sans', sans-serif"}}>
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
            <a href="/" className="flex items-center font-extrabold text-gray-900 text-base">
              <span className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white text-sm"><i className="fa-solid fa-file-lines"/></span>
              <span className="ml-2"/>MakeResume<span className="text-sky-500">.in</span>
            </a>
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
              <div className={`w-2 h-2 rounded-full transition-colors ${score>=80?"bg-emerald-400":score>=50?"bg-sky-400":"bg-amber-400"}`}/>
              <span className="text-xs font-bold text-gray-600">Score: <span className={score>=80?"text-emerald-600":score>=50?"text-sky-600":"text-amber-600"}>{score}/100</span></span>
            </div>
            <div className=" flex items-center sm:gap-2 gap-1 ">
              <button onClick={deleteDraft} className="text-xs font-semibold text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                <i className="fa-solid fa-trash text-[11px]"/>Delete Draft
              </button>
              <button onClick={saveDraft} className="text-xs font-semibold text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                <i className="fa-solid fa-floppy-disk text-[11px]"/>Save Draft
              </button>
            </div>
          </div>
        </header>

        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto">
              {STEPS.map(s=>(
                <button key={s.id} onClick={()=>setStep(s.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-4 text-[11px] font-bold whitespace-nowrap border-b-2 transition-all shrink-0 ${step===s.id?"border-sky-500 text-sky-600":step>s.id?"border-emerald-400 text-emerald-500":"border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  <i className={`${s.icon} text-[10px]`}/>{s.label}
                  {step>s.id&&<i className="fa-solid fa-check text-[8px] ml-0.5"/>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-6">
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
                    {["Your contact details — so recruiters know how to reach you.",
                      "A 2–4 sentence pitch. Recruiters read this first.",
                      "Your work history — list the most recent role first.",
                      "Your academic background and degrees.",
                      "Group skills by category for ATS and recruiter readability.",
                      "Showcase your best personal and professional projects.",
                      "Professional certifications and credentials.",
                      "Add any extra sections — projects, languages, awards, etc.",
                      "Review your resume, pick a template, and download."][step]}
                  </p>
                </div>
                <span className="hidden sm:block text-xs text-gray-300 font-medium shrink-0">{step+1} / {STEPS.length}</span>
              </div>

              {renderStep()}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <i className="fa-solid fa-arrow-left text-xs"/> Back
                </button>
                {step<STEPS.length-1 ? (
                  <button onClick={()=>setStep(s=>Math.min(STEPS.length-1,s+1))}
                    className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-sky-200 hover:shadow-md">
                    Next: {STEPS[step+1].label} <i className="fa-solid fa-arrow-right text-xs"/>
                  </button>
                ) : (
                  <button onClick={saveandpreview} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm">
                    <i className="fa-solid fa-download text-xs"/> Preview & Download
                  </button>
                )}
              </div>
            </div>

            {/* PREVIEW SIDE */}
            <div>
              <div className="sticky top-[120px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fa-solid fa-eye text-sky-400"/>Live Preview
                  </span>
                  <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${score>=80?"bg-emerald-50 text-emerald-600":score>=50?"bg-sky-50 text-sky-600":"bg-amber-50 text-amber-600"}`}>
                    <i className="fa-solid fa-chart-simple text-[9px]"/>{score}/100
                  </div>
                </div>
                <div ref={previewRef} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <Preview/>
                </div>
                <div className="mt-2 flex items-center justify-between px-1">
                  <span className="text-[10px] text-gray-400 font-medium capitalize">{selectedTemplate} template</span>
                  <div className="flex items-center gap-1.5">
                    <span style={{width:10,height:10,borderRadius:"50%",background:cp,display:"inline-block"}}/>
                    <span className="text-[10px] text-gray-400 font-medium capitalize">{selectedColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}