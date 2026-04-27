"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; 

interface Resume {
  _id: string;
  title: string;
  template: string;
  color: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

// ─── ATS template list ───────────────────────────────────────────────────────
const ATS_TEMPLATES = [
  "chronological","functional","combination","executive","modern",
  "minimal","compact","elegant","classic","tech","centered",
];

function getAtsScore(template: string): number {
  const scores: Record<string, number> = {
    chronological:99,functional:86,combination:93,executive:97,modern:95,
    minimal:98,compact:94,elegant:96,classic:97,tech:92,colorband:80,
    gradient:78,vivid:75,centered:88,grid:82,sidebar:85,infographic:72,timeline:80,
  };
  return scores[template] ?? 85;
}

// ─── Color map ────────────────────────────────────────────────────────────────
const HC: Record<string,{p:string;l:string;d:string;b:string}> = {
  blue:    {p:"#0284c7",l:"#e0f2fe",d:"#0369a1",b:"#bae6fd"},
  emerald: {p:"#059669",l:"#d1fae5",d:"#047857",b:"#a7f3d0"},
  violet:  {p:"#7c3aed",l:"#ede9fe",d:"#6d28d9",b:"#ddd6fe"},
  rose:    {p:"#e11d48",l:"#ffe4e6",d:"#be123c",b:"#fecdd3"},
  amber:   {p:"#d97706",l:"#fef3c7",d:"#b45309",b:"#fde68a"},
  slate:   {p:"#475569",l:"#f1f5f9",d:"#334155",b:"#cbd5e1"},
  indigo:  {p:"#4f46e5",l:"#e0e7ff",d:"#4338ca",b:"#c7d2fe"},
  teal:    {p:"#0d9488",l:"#ccfbf1",d:"#0f766e",b:"#99f6e4"},
  orange:  {p:"#ea580c",l:"#ffedd5",d:"#c2410c",b:"#fed7aa"},
  neutral: {p:"#525252",l:"#f5f5f5",d:"#404040",b:"#d4d4d4"},
};
function getC(color: string) { return HC[color] ?? HC.blue; }

// ─── Full sample resume data ──────────────────────────────────────────────────


// ─── Tiny helpers shared across mini-renderers ────────────────────────────────
function ds(e: any) {
  if (!e.startDate && !e.endDate && !e.current) return "";
  return `${e.startDate}${e.startDate ? " – " : ""}${e.current ? "Present" : e.endDate}`;
}

// ─── Mini resume renderer (real layouts at real size, clipped) ────────────────
function MiniResume({ template, color, data }: { template: string; color: string; data: any }) {
  const c = getC(color);

  // Merge real DB data with SAMPLE fallbacks so empty fields never crash
  const D = {
    contact:    {    ...data?.contact },
    summary:    data?.summary || "",
    experience: data?.experience?.length  ? data.experience  : [],
    education:  data?.education?.length   ? data.education   : [],
    skillGroups:data?.skillGroups?.length ? data.skillGroups : [],
    projects:   data?.projects?.length    ? data.projects    : [],
    certs:      data?.certs?.length       ? data.certs       : [],
    custom:     data?.custom || [],
  };
  const name = `${D.contact.firstName || "Your"} ${D.contact.lastName || "Name"}`;

  // shared micro-styles
  const S = {
    page:   { background:"#fff", width:794, minHeight:600, fontFamily:"'Helvetica Neue',sans-serif", fontSize:9.5, color:"#374151", lineHeight:1.45, overflow:"hidden" } as React.CSSProperties,
    secLbl: { fontSize:7.5, fontWeight:800, textTransform:"uppercase" as const, letterSpacing:"0.12em", color:c.p, borderBottom:`1.5px solid ${c.b}`, paddingBottom:3, marginBottom:6, marginTop:12 },
    name:   { fontSize:20, fontWeight:800, color:"#111827" },
    job:    { fontSize:9.5, color:c.p, fontWeight:700, marginTop:3 },
    meta:   { fontSize:8, color:"#6b7280", marginTop:5 },
    eTitle: { fontSize:9.5, fontWeight:700, color:"#111827" },
    eOrg:   { fontSize:8.5, color:"#374151", fontWeight:600 },
    eDate:  { fontSize:7.5, color:"#9ca3af" },
    eDesc:  { fontSize:8, color:"#6b7280", lineHeight:1.4, marginTop:2 },
    blk:    { marginBottom:7 } as React.CSSProperties,
    pad:    { padding:"26px 32px 24px" } as React.CSSProperties,
    padN:   { padding:"0 32px 24px" } as React.CSSProperties,
    divider:{ borderBottom:`1.5px solid ${c.b}`, paddingBottom:10, marginBottom:4 },
  };

  const ContactLine = ({ white=false }: { white?: boolean }) => (
    <div style={{ display:"flex", flexWrap:"wrap", gap:"0 12px", marginTop:5, fontSize:7.5, color: white ? "rgba(255,255,255,0.75)" : "#6b7280" }}>
      <span>{D.contact.email}</span>
      <span>· {D.contact.phone}</span>
      <span>· {D.contact.city}, {D.contact.country}</span>
      <span>· {D.contact.linkedin}</span>
    </div>
  );

  const SecTitle = ({ t, white=false }: { t: string; white?: boolean }) => (
    <div style={{ ...S.secLbl, color: white ? "rgba(255,255,255,0.6)" : c.p, borderBottomColor: white ? "rgba(255,255,255,0.2)" : c.b }}>{t}</div>
  );

  const ExpItems = ({ white=false }: { white?: boolean }) => (
    <>
      {D.experience.map((e: any) => (
        <div key={e.id} style={S.blk}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ ...S.eTitle, color: white ? "#fff" : "#111827" }}>{e.position}</span>
            <span style={{ ...S.eDate, color: white ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>{ds(e)}</span>
          </div>
          <div style={{ ...S.eOrg, color: white ? "rgba(255,255,255,0.7)" : "#374151" }}>{e.company}</div>
          <div style={{ ...S.eDesc, color: white ? "rgba(255,255,255,0.55)" : "#6b7280" }}>{e.description}</div>
        </div>
      ))}
    </>
  );

  const EduItems = ({ white=false }: { white?: boolean }) => (
    <>
      {D.education.map((e: any) => (
        <div key={e.id} style={S.blk}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ ...S.eTitle, color: white ? "#fff" : "#111827" }}>{e.degree} in {e.field}</span>
            <span style={{ ...S.eDate, color: white ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>{ds(e)}</span>
          </div>
          <div style={{ ...S.eOrg, color: white ? "rgba(255,255,255,0.7)" : "#374151" }}>{e.institution}</div>
        </div>
      ))}
    </>
  );

  const SkillItems = ({ white=false }: { white?: boolean }) => (
    <>
      {D.skillGroups.map((g: any) => (
        <div key={g.id} style={{ display:"flex", gap:4, marginBottom:3, flexWrap:"wrap", fontSize:8.5 }}>
          <span style={{ fontWeight:700, color: white ? "rgba(255,255,255,0.85)" : c.p }}>{g.heading}:</span>
          <span style={{ color: white ? "rgba(255,255,255,0.65)" : "#6b7280" }}>{g.skills}</span>
        </div>
      ))}
    </>
  );

  const CertItems = ({ white=false }: { white?: boolean }) => (
    <>
      {D.certs.map((cert: any) => (
        <div key={cert.id} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
          <span style={{ fontSize:8.5, fontWeight:600, color: white ? "rgba(255,255,255,0.8)" : "#374151" }}>{cert.name}</span>
          <span style={{ ...S.eDate, color: white ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>{cert.issuer} · {cert.year}</span>
        </div>
      ))}
    </>
  );

  // ── Standard header (white bg) ──
  const StdHeader = () => (
    <div style={{ ...S.divider, ...S.pad, paddingBottom:10 }}>
      <div style={S.name}>{name}</div>
      <div style={S.job}>{D.contact.jobTitle}</div>
      <ContactLine />
    </div>
  );

  // ── Summary block ──
  const Summary = ({ white=false }: { white?: boolean }) => (
    <div style={{ marginBottom:6 }}>
      <SecTitle t="Professional Summary" white={white} />
      <div style={{ ...S.eDesc, color: white ? "rgba(255,255,255,0.6)" : "#6b7280" }}>{D.summary}</div>
    </div>
  );

  // ════════════════════════════════════════════════════
  // TEMPLATES
  // ════════════════════════════════════════════════════

  if (template === "chronological" || template === "functional" || template === "minimal") {
    return (
      <div style={{ ...S.page, fontFamily: template === "chronological" ? "Georgia,serif" : S.page.fontFamily }}>
        <div style={S.pad}>
          <div style={S.divider}>
            <div style={S.name}>{name}</div>
            <div style={S.job}>{D.contact.jobTitle}</div>
            <ContactLine />
          </div>
          {template === "functional"
            ? <><div style={{ marginBottom:6 }}><SecTitle t="Skills" /><SkillItems /></div><Summary /></>
            : <Summary />
          }
          <SecTitle t="Professional Experience" />
          <ExpItems />
          <SecTitle t="Education" />
          <EduItems />
          {template !== "functional" && <><SecTitle t="Skills" /><SkillItems /></>}
          <SecTitle t="Certifications" />
          <CertItems />
        </div>
      </div>
    );
  }

  if (template === "elegant") {
    return (
      <div style={{ ...S.page, fontFamily:"'Times New Roman',Times,serif" }}>
        <div style={S.pad}>
          <div style={{ borderLeft:`4px solid ${c.p}`, paddingLeft:14,  ...S.divider, borderBottom:"none" }}>
            <div style={S.name}>{name}</div>
            <div style={S.job}>{D.contact.jobTitle}</div>
            <ContactLine />
          </div>
          <Summary />
          <SecTitle t="Professional Experience" />
          <ExpItems />
          <SecTitle t="Education" />
          <EduItems />
          <SecTitle t="Skills" />
          <SkillItems />
          <SecTitle t="Certifications" />
          <CertItems />
        </div>
      </div>
    );
  }

  if (template === "classic") {
    return (
      <div style={{ ...S.page, fontFamily:"'Times New Roman',Times,serif" }}>
        <div style={{ ...S.pad, textAlign:"center", ...S.divider }}>
          <div style={{ ...S.name, letterSpacing:2, textTransform:"uppercase" }}>{name}</div>
          <div style={S.job}>{D.contact.jobTitle}</div>
          <ContactLine />
        </div>
        <div style={S.pad}>
          <Summary />
          <SecTitle t="Education" />
          <EduItems />
          <SecTitle t="Professional Experience" />
          <ExpItems />
          <SecTitle t="Skills" />
          <SkillItems />
           <SecTitle t="Certifications" />
          <CertItems />
        </div>
      </div>
    );
  }

  if (template === "compact") {
    return (
      <div style={{ ...S.page, fontSize:8.5, lineHeight:1.3 }}>
        <div style={{ ...S.pad, paddingTop:20, paddingBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", ...S.divider }}>
            <div>
              <div style={{ ...S.name, fontSize:16 }}>{name}</div>
              <div style={S.job}>{D.contact.jobTitle}</div>
            </div>
            <div style={{ textAlign:"right", fontSize:7.5, color:"#6b7280" }}>
              <div>{D.contact.email}</div>
              <div>{D.contact.phone}</div>
              <div>{D.contact.city}, {D.contact.country}</div>
            </div>
          </div>
          <Summary />
          <SecTitle t="Professional Experience" />
          <ExpItems />
          <SecTitle t="Education" />
          <EduItems />
          <SecTitle t="Skills" />
          <SkillItems />
           <SecTitle t="Certifications" />
          <CertItems />
        </div>
      </div>
    );
  }

  if (template === "executive") {
    return (
      <div style={{ ...S.page, fontFamily:"Georgia,serif" }}>
        <div style={{ ...S.pad, ...S.divider, borderBottomWidth:2 }}>
          <div style={{ ...S.name, fontSize:22, fontWeight:900 }}>{name}</div>
          <div style={S.job}>{D.contact.jobTitle}</div>
          <ContactLine />
        </div>
        <div style={S.pad}>
          <div style={{ fontStyle:"italic", fontSize:9.5, color:"#374151", lineHeight:1.6, marginBottom:10 }}>{D.summary}</div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:22 }}>
            <div>
              <SecTitle t="Professional Experience" />
              <ExpItems />
            </div>
            <div style={{ borderLeft:`1.5px solid ${c.b}`, paddingLeft:16 }}>
              <SecTitle t="Education" />
              <EduItems />
              <SecTitle t="Skills" />
              <SkillItems />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template === "combination") {
    return (
      <div style={S.page}>
        <StdHeader />
        <div style={S.pad}>
          <Summary />
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:22 }}>
            <div>
              <SecTitle t="Professional Experience" />
              <ExpItems />
            </div>
            <div style={{ borderLeft:`1.5px solid ${c.b}`, paddingLeft:16 }}>
              <SecTitle t="Skills" />
              <SkillItems />
              <SecTitle t="Education" />
              <EduItems />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template === "tech") {
    return (
      <div style={S.page}>
        <div style={{ background:c.l, ...S.pad, paddingBottom:12, borderBottom:`2px solid ${c.b}` }}>
          <div style={S.name}>{name}</div>
          <div style={S.job}>{D.contact.jobTitle}</div>
          <ContactLine />
        </div>
        <div style={S.pad}>
          <SecTitle t="Skills" />
          <SkillItems />
          <Summary />
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:22 }}>
            <div><SecTitle t="Experience" /><ExpItems /></div>
            <div style={{ borderLeft:`1.5px solid ${c.b}`, paddingLeft:16 }}>
              <SecTitle t="Education" /><EduItems />
              <SecTitle t="Certifications" /><CertItems />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template === "modern") {
    return (
      <div style={S.page}>
        <div style={{ background:"#1e293b", ...S.pad, paddingBottom:14, borderBottom:`2px solid ${c.b}` }}>
          <div style={{ ...S.name, color:"#fff" }}>{name}</div>
          <div style={{ ...S.job, color:c.p }}>{D.contact.jobTitle}</div>
          <ContactLine white />
        </div>
        <div style={S.pad}>
          <Summary />
          <SecTitle t="Professional Experience" />
          <ExpItems />
          <SecTitle t="Education" />
          <EduItems />
          <SecTitle t="Skills" />
          <SkillItems />
        </div>
      </div>
    );
  }

  if (template === "colorband") {
    return (
      <div style={S.page}>
        <div style={{ background:c.p, ...S.pad, paddingBottom:16 }}>
          <div style={{ ...S.name, color:"#fff" }}>{name}</div>
          <div style={{ ...S.job, color:"rgba(255,255,255,0.85)" }}>{D.contact.jobTitle}</div>
          <ContactLine white />
        </div>
        <div style={{ height:4, background:c.d }} />
        <div style={S.pad}>
          <Summary />
          <SecTitle t="Professional Experience" />
          <ExpItems />
          <SecTitle t="Education" />
          <EduItems />
          <SecTitle t="Skills" />
          <SkillItems />
        </div>
      </div>
    );
  }

  if (template === "gradient") {
    return (
      <div style={S.page}>
        <div style={{ background:`linear-gradient(135deg,${c.p} 0%,${c.d} 100%)`, ...S.pad, paddingBottom:14 }}>
          <div style={{ ...S.name, color:"#fff" }}>{name}</div>
          <div style={{ ...S.job, color:"rgba(255,255,255,0.9)" }}>{D.contact.jobTitle}</div>
          <ContactLine white />
        </div>
        <div style={{ background:c.l, padding:"6px 32px", borderBottom:`1px solid ${c.b}`, fontSize:7.5, color:c.d, display:"flex", gap:12 }}>
          <span>{D.contact.city}</span><span>{D.contact.linkedin}</span><span>{D.contact.website}</span>
        </div>
        <div style={S.pad}>
          <Summary />
          <SecTitle t="Experience" />
          <ExpItems />
          <SecTitle t="Education" />
          <EduItems />
          <SecTitle t="Skills" />
          <SkillItems />
        </div>
      </div>
    );
  }

  if (template === "vivid") {
    return (
      <div style={S.page}>
        <div style={{ display:"flex" }}>
          <div style={{ background:c.p, width:8, minHeight:120, flexShrink:0 }} />
          <div style={{ flex:1, ...S.pad, ...S.divider }}>
            <div style={{ ...S.name, fontSize:22, fontWeight:900 }}>{name}</div>
            <div style={{ ...S.job, textTransform:"uppercase", letterSpacing:1 }}>{D.contact.jobTitle}</div>
            <div style={{ height:2, background:c.l, margin:"8px 0 4px", borderRadius:2 }} />
            <ContactLine />
          </div>
        </div>
        <div style={S.pad}>
          <Summary />
          <SecTitle t="Professional Experience" />
          <ExpItems />
          <SecTitle t="Education" />
          <EduItems />
          <SecTitle t="Skills" />
          <SkillItems />
        </div>
      </div>
    );
  }

  if (template === "centered") {
    return (
      <div style={S.page}>
        <div style={{ ...S.pad, textAlign:"center", ...S.divider, paddingBottom:14 }}>
          <div style={{ ...S.name, fontSize:22, letterSpacing:2, textTransform:"uppercase", borderBottom:`3px solid ${c.p}`, display:"inline-block", paddingBottom:5, marginBottom:6 }}>{name}</div>
          <div style={{ ...S.job, letterSpacing:1, textTransform:"uppercase" }}>{D.contact.jobTitle}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 6px", marginTop:10, justifyContent:"center" }}>
            {[D.contact.email, D.contact.phone, D.contact.city].map((v: string) => (
              <span key={v} style={{ background:c.l, color:c.d, border:`1px solid ${c.b}`, borderRadius:20, padding:"2px 10px", fontSize:7.5, fontWeight:600 }}>{v}</span>
            ))}
          </div>
        </div>
        <div style={S.pad}>
          <div style={{ marginBottom:6, textAlign:"center" }}>
            <div style={{ ...S.secLbl, textAlign:"center", borderBottom:"none" }}>Professional Summary</div>
            <div style={{ ...S.eDesc, textAlign:"center", maxWidth:560, margin:"0 auto" }}>{D.summary}</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 28px" }}>
            <div><SecTitle t="Experience" /><ExpItems /></div>
            <div style={{ borderLeft:`2px solid ${c.b}`, paddingLeft:22 }}>
              <SecTitle t="Education" /><EduItems />
              <SecTitle t="Certifications" /><CertItems />
            </div>
          </div>
          <SecTitle t="Skills" />
          <SkillItems />
        </div>
      </div>
    );
  }

  if (template === "sidebar") {
    return (
      <div style={{ ...S.page, display:"flex" }}>
        <div style={{ width:190, flexShrink:0, background:c.d, color:"#fff", padding:"24px 16px", display:"flex", flexDirection:"column" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.15)", border:"2px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff", marginBottom:12 }}>
            {D.contact.firstName[0]}
          </div>
          <div style={{ fontSize:14, fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:3 }}>{name}</div>
          <div style={{ fontSize:8, color:"rgba(255,255,255,0.65)", fontWeight:600, marginBottom:14, textTransform:"uppercase", letterSpacing:0.8 }}>{D.contact.jobTitle}</div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.15)", paddingTop:10, marginBottom:14, fontSize:7.5 }}>
            {[D.contact.email, D.contact.phone, `${D.contact.city}, ${D.contact.country}`, D.contact.linkedin].map((v: string) => (
              <div key={v} style={{ color:"rgba(255,255,255,0.65)", marginBottom:4, wordBreak:"break-all" }}>{v}</div>
            ))}
          </div>
          <div style={{ fontSize:7.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(255,255,255,0.45)", marginBottom:5 }}>Skills</div>
          <SkillItems white />
          <div style={{ marginTop:10, fontSize:7.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(255,255,255,0.45)", marginBottom:5 }}>Certs</div>
          <CertItems white />
        </div>
        <div style={{ flex:1, padding:"24px 22px" }}>
          <Summary />
          <SecTitle t="Professional Experience" />
          <ExpItems />
          <SecTitle t="Education" />
          <EduItems />
        </div>
      </div>
    );
  }

  if (template === "grid") {
    return (
      <div style={S.page}>
        <div style={{ background:c.p, ...S.pad, paddingBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
            <div>
              <div style={{ ...S.name, color:"#fff" }}>{name}</div>
              <div style={{ ...S.job, color:"rgba(255,255,255,0.85)" }}>{D.contact.jobTitle}</div>
            </div>
            <div style={{ textAlign:"right", fontSize:7.5, color:"rgba(255,255,255,0.75)" }}>
              <div>{D.contact.email}</div>
              <div>{D.contact.phone}</div>
              <div>{D.contact.city}, {D.contact.country}</div>
            </div>
          </div>
        </div>
        <div style={{ height:4, background:c.d }} />
        <div style={S.pad}>
          <Summary />
          <SecTitle t="Experience" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
            {D.experience.slice(0,2).map((e: any) => (
              <div key={e.id} style={{ background:c.l, border:`1px solid ${c.b}`, borderLeft:`3px solid ${c.p}`, borderRadius:6, padding:"8px 10px" }}>
                <div style={{ fontSize:9, fontWeight:700, color:c.d }}>{e.position}</div>
                <div style={{ fontSize:8, color:"#374151" }}>{e.company}</div>
                <div style={{ fontSize:7.5, color:"#9ca3af" }}>{ds(e)}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <SecTitle t="Skills" />
              <SkillItems />
            </div>
            <div>
              <SecTitle t="Education" />
              <EduItems />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template === "infographic") {
    return (
      <div style={S.page}>
        <div style={{ background:`linear-gradient(120deg,${c.d} 0%,${c.p} 60%,${c.b} 100%)`, ...S.pad, paddingBottom:16 }}>
          <div style={{ ...S.name, fontSize:24, color:"#fff", fontWeight:900 }}>{name}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.9)", fontWeight:700, marginTop:5, textTransform:"uppercase", letterSpacing:1.2 }}>{D.contact.jobTitle}</div>
          <div style={{ height:1.5, background:"rgba(255,255,255,0.2)", margin:"10px 0 8px" }} />
          <div style={{ display:"flex", flexWrap:"wrap", gap:"3px 16px", fontSize:7.5, color:"rgba(255,255,255,0.8)" }}>
            <span>{D.contact.email}</span><span>{D.contact.phone}</span><span>{D.contact.city}</span>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:`2px solid ${c.b}` }}>
          {[
            { icon:"💼", val:`${D.experience.length} Roles`, lbl:"Experience" },
            { icon:"🎓", val:`${D.education.length} Degrees`, lbl:"Education" },
            { icon:"⚡", val:`${D.skillGroups.reduce((n:number,g:any)=>n+g.skills.split(",").length,0)} Skills`, lbl:"Skills" },
            { icon:"🏆", val:`${D.certs.length} Certs`, lbl:"Awards" },
          ].map((s,i)=>(
            <div key={i} style={{ textAlign:"center", padding:"10px 4px", borderRight:`1px solid ${c.b}`, background:i%2===0?"#fff":c.l }}>
              <div style={{ fontSize:14, marginBottom:2 }}>{s.icon}</div>
              <div style={{ fontSize:9, fontWeight:800, color:"#111827" }}>{s.val}</div>
              <div style={{ fontSize:7, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.4 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div style={S.pad}>
          <Summary />
          <SecTitle t="Skills & Proficiency" />
          {D.skillGroups.map((g: any) => (
            <div key={g.id} style={{ marginBottom:5 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:8.5, fontWeight:600, color:"#374151" }}>{g.heading}</span>
                <span style={{ fontSize:7.5, color:"#9ca3af" }}>Advanced</span>
              </div>
              <div style={{ height:5, background:c.b, borderRadius:3 }}>
                <div style={{ height:"100%", width:"80%", background:c.p, borderRadius:3 }} />
              </div>
            </div>
          ))}
          <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:"0 24px", marginTop:4 }}>
            <div><SecTitle t="Experience" /><ExpItems /></div>
            <div><SecTitle t="Education" /><EduItems /><SecTitle t="Certifications" /><CertItems /></div>
          </div>
        </div>
      </div>
    );
  }

  if (template === "timeline") {
    return (
      <div style={S.page}>
        <div style={{ ...S.pad, ...S.divider }}>
          <div style={{ ...S.name, fontSize:22, fontWeight:900 }}>{name}</div>
          <div style={{ ...S.job, textTransform:"uppercase", letterSpacing:0.8 }}>{D.contact.jobTitle}</div>
          <ContactLine />
        </div>
        <div style={S.pad}>
          <Summary />
          <SecTitle t="Career Timeline" />
          <div style={{ position:"relative", paddingLeft:30, marginTop:6 }}>
            <div style={{ position:"absolute", left:8, top:4, bottom:4, width:2, background:`linear-gradient(to bottom,${c.p},${c.b})`, borderRadius:1 }} />
            {D.experience.map((e: any, i: number) => (
              <div key={e.id} style={{ position:"relative", marginBottom:10 }}>
                <div style={{ position:"absolute", left:-26, top:3, width:10, height:10, borderRadius:"50%", background:i===0?c.p:"#fff", border:`2px solid ${c.p}` }} />
                <div style={{ background:i===0?c.l:"#f9fafb", border:`1px solid ${i===0?c.b:"#e5e7eb"}`, borderLeft:`3px solid ${c.p}`, borderRadius:6, padding:"7px 10px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:9.5, fontWeight:700, color:i===0?c.d:"#111827" }}>{e.position}</span>
                    <span style={{ fontSize:7.5, color:"#9ca3af" }}>{ds(e)}</span>
                  </div>
                  <div style={{ fontSize:8.5, color:"#374151", fontWeight:600 }}>{e.company}</div>
                  <div style={{ fontSize:8, color:"#6b7280", marginTop:2, lineHeight:1.4 }}>{e.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px", marginTop:4 }}>
            <div><SecTitle t="Education" /><EduItems /></div>
            <div><SecTitle t="Skills" /><SkillItems /></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback → chronological
  return (
    <div style={S.page}>
      <div style={S.pad}>
        <div style={S.divider}>
          <div style={S.name}>{name}</div>
          <div style={S.job}>{D.contact.jobTitle}</div>
          <ContactLine />
        </div>
        <Summary />
        <SecTitle t="Professional Experience" />
        <ExpItems />
        <SecTitle t="Education" />
        <EduItems />
        <SecTitle t="Skills" />
        <SkillItems />
      </div>
    </div>
  );
}

// ─── Card thumbnail wrapper ───────────────────────────────────────────────────
function ResumeThumbnail({ template, color, data }: { template: string; color: string; data: any }) {
  const PREVIEW_W = 794;  // resume always renders at this fixed px width
  const THUMB_H   = 240;  // card thumbnail height in px

   const router = useRouter();

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.38); // safe default until measured

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      if (w > 0) setScale(w / PREVIEW_W);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    // Outer clip container — 100% card width, fixed height
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        height: THUMB_H,
        overflow: "hidden",
        position: "relative",
        background: "#f8fafc",
        borderBottom: "1px solid #f1f5f9",
        flexShrink: 0,
      }}
    >
      {/* Inner resume div: always 794px wide, scaled down to fill clip box */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: PREVIEW_W,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <MiniResume template={template} color={color} data={data} />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [resumes,       setResumes]       = useState<Resume[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
   const router = useRouter();

  useEffect(() => {
    if (status === "authenticated")   fetchResumes();
    else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res  = await fetch("/api/resumes", { credentials:"include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch {
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    try {
      setDeleteLoading(id);
      const res = await fetch(`/api/resumes/${id}`, { method:"DELETE" });
      if (!res.ok) throw new Error();
      setResumes(resumes.filter(r => r._id !== id));
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setDeleteLoading(null);
    }
  };

  const openPreview = (resume: Resume) => {
   
  localStorage.setItem("resume_draft",    JSON.stringify(resume.data));
  localStorage.setItem("resume_template", resume.template);
  localStorage.setItem("resume_color",    resume.color);
   router.push('/preview');
};

const openBuilder = (resume: Resume) => {
 
  localStorage.setItem("resume_draft",    JSON.stringify(resume.data));
  localStorage.setItem("resume_template", resume.template);
  localStorage.setItem("resume_color",    resume.color);
  router.push('/builder');
};

  const getColorHex = (c: string) => HC[c]?.p ?? "#0284c7";

  // ── Loading ──
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar session={null} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-sky-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="mt-4 text-gray-600 font-medium">Loading your resumes…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family:'Plus Jakarta Sans',sans-serif; }

        .resume-card {
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .resume-card::before {
          content:'';
          position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,var(--color) 0%,transparent 100%);
          opacity:0;transition:opacity 0.3s ease;
        }
        .resume-card:hover { transform:translateY(-8px); box-shadow:0 20px 40px rgba(0,0,0,0.1); }
        .resume-card:hover::before { opacity:1; }

        .badge-ats      { background:linear-gradient(135deg,#f0fdf4,#dbeafe); color:#16a34a; }
        .badge-creative { background:linear-gradient(135deg,#fffbeb,#fef3c7); color:#d97706; }

        .btn-action { transition:all 0.2s ease; }
        .btn-action:hover:not(:disabled) { transform:scale(1.05); }
        .btn-action:active:not(:disabled){ transform:scale(0.95); }

        .empty-state-icon { animation:float 3s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

        .stagger-in { animation:fadeUp 0.5s ease-out forwards; opacity:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .resume-list-item:nth-child(1){animation-delay:.05s}
        .resume-list-item:nth-child(2){animation-delay:.12s}
        .resume-list-item:nth-child(3){animation-delay:.19s}
        .resume-list-item:nth-child(4){animation-delay:.26s}
        .resume-list-item:nth-child(5){animation-delay:.33s}
        .resume-list-item:nth-child(6){animation-delay:.40s}
      `}</style>

      <Navbar session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* ── Header ── */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">My Resumes</h1>
            <p className="text-gray-500 text-lg mt-2">
              {status === "authenticated"
                ? `${resumes.length} resume${resumes.length !== 1 ? "s" : ""} in your collection`
                : "Sign in to view your resumes"}
            </p>
          </div>
          {status === "authenticated" && (
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <i className="fa-solid fa-plus text-sm" />
              Create New Resume
            </Link>
          )}
        </div>

        {/* ── Not authed ── */}
        {status === "unauthenticated" ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 mb-6">
              <i className="fa-solid fa-lock text-3xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your resumes</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Create and manage professional resumes with our powerful builder.</p>
            <button
              onClick={() => signIn("google")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-900 font-bold rounded-xl transition-all"
            >
              <i className="fa-brands fa-google text-red-500" /> Sign in with Google
            </button>
          </div>

        ) : resumes.length === 0 ? (
          /* ── Empty ── */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 mb-8">
              <i className="fa-solid fa-file-lines text-5xl text-sky-500 empty-state-icon" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No resumes yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Create your first professional resume with 18+ templates.</p>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-lg rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-sparkles" /> Create Your First Resume
            </Link>
          </div>

        ) : (
          /* ── Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => {
              const isATS = ATS_TEMPLATES.includes(resume.template);
              const hex   = getColorHex(resume.color);

              return (
                <div
                  key={resume._id}
                  className="resume-list-item stagger-in"
                  style={{ "--color": hex } as any}
                >
                  <div className="resume-card bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col h-full">

                    {/* ── Real preview ── */}
                    <ResumeThumbnail template={resume.template} color={resume.color} data={resume.data} />

                    {/* ── Info ── */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* title + name */}
                      <div className="mb-3">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{resume.title}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {resume.data?.contact?.firstName || "Your"} {resume.data?.contact?.lastName || "Resume"}
                        </p>
                      </div>

                      {/* badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className={`${isATS ? "badge-ats" : "badge-creative"} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                          <i className={`${isATS ? "fa-solid fa-shield-check" : "fa-solid fa-palette"} mr-1`} />
                          {isATS ? `${getAtsScore(resume.template)}% ATS` : "Creative"}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                          {resume.template}
                        </span>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                          style={{ background: hex }}
                        >
                          {resume.color}
                        </span>
                      </div>

                      {/* date */}
                      <p className="text-xs text-gray-400 mb-4">
                        <i className="fa-regular fa-clock mr-1" />
                        Updated {new Date(resume.updatedAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                      </p>

                      {/* actions */}
                      <div className="flex gap-2 mt-auto">
                        
                        <button
                          onClick={() => openPreview(resume)}
                          className="btn-action flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-lg text-sm transition-colors"
                        >
                          <i className="fa-solid fa-eye text-xs" /> View
                        </button>
                         <button
                          onClick={() => openBuilder(resume)}
                          className="btn-action flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
                        >
                          <i className="fa-solid fa-pen text-xs" /> Edit
                        </button>
                        <button
                          onClick={() => deleteResume(resume._id)}
                          disabled={deleteLoading === resume._id}
                          className="btn-action px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading === resume._id
                            ? <i className="fa-solid fa-spinner fa-spin text-xs" />
                            : <i className="fa-solid fa-trash text-xs" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ session }: { session: any }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <a href="/" className="flex items-center font-extrabold text-lg tracking-tight text-gray-900">
          <span className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white text-sm">
            <i className="fa-solid fa-file-lines" />
          </span>
          <span className="ml-2">MakeResume<span className="text-sky-500">.in</span></span>
        </a>

        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <img src={session.user.image} alt="profile" className="w-9 h-9 rounded-full border border-gray-200" />
              )}
              <span className="text-sm font-semibold text-gray-800 hidden sm:block">{session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl:"/", redirect:true })}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
            >
              <i className="fa-brands fa-google text-red-500 text-sm" />
              <span>Continue with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}