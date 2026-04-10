"use client";

import { useState } from "react";
import {
  Document, Page, Text, View, StyleSheet, Link,
} from "@react-pdf/renderer";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ContactData {
  firstName: string; lastName: string; email: string; phone: string;
  jobTitle: string; city: string; country: string; linkedin: string; website: string;
}
export interface ExpEntry {
  id: number; company: string; position: string;
  startDate: string; endDate: string; current: boolean; description: string;
}
export interface EduEntry {
  id: number; institution: string; degree: string; field: string;
  startDate: string; endDate: string; current: boolean; grade: string;
}
export interface SkillEntry { id: number; name: string; level: number; }
export interface ProjectEntry { id: number; title: string; description: string; link: string; }
export interface CertEntry  { id: number; name: string; issuer: string; year: string; }
export interface CustomSection { id: number; heading: string; content: string; }

export interface ResumeData {
  contact: ContactData;
  summary: string;
  experience: ExpEntry[];
  education:  EduEntry[];
  skills:     SkillEntry[];
  projects:   ProjectEntry[];
  certs:      CertEntry[];
  custom:     CustomSection[];
}

export type TemplateName =
  | "modern" | "classic" | "minimal"
  | "executive" | "creative" | "sidebar" | "bold";

export type ColorName =
  | "blue" | "emerald" | "violet" | "rose" | "amber"
  | "slate" | "indigo" | "teal" | "orange" | "neutral";

// ─── Color palette ────────────────────────────────────────────────────────────
export const HTML_COLORS: Record<ColorName, {
  primary: string; light: string; dark: string;
  header: string; accent: string; border: string; sidebar: string;
}> = {
  blue:     { primary:"#0ea5e9", light:"#f0f9ff", dark:"#0284c7", header:"#0c1a2e", accent:"#38bdf8", border:"#bae6fd", sidebar:"#0f2744" },
  emerald: { primary:"#10b981", light:"#ecfdf5", dark:"#059669", header:"#052e16", accent:"#34d399", border:"#a7f3d0", sidebar:"#064e3b" },
  violet:  { primary:"#8b5cf6", light:"#f5f3ff", dark:"#7c3aed", header:"#1e0a3c", accent:"#a78bfa", border:"#ddd6fe", sidebar:"#2e1065" },
  rose:    { primary:"#f43f5e", light:"#fff1f2", dark:"#e11d48", header:"#3b0012", accent:"#fb7185", border:"#fecdd3", sidebar:"#4c0519" },
  amber:   { primary:"#f59e0b", light:"#fffbeb", dark:"#d97706", header:"#1c0a00", accent:"#fbbf24", border:"#fde68a", sidebar:"#451a03" },
  slate:   { primary:"#64748b", light:"#f8fafc", dark:"#475569", header:"#0f172a", accent:"#94a3b8", border:"#cbd5e1", sidebar:"#1e293b" },
  indigo:  { primary:"#6366f1", light:"#eef2ff", dark:"#4f46e5", header:"#1e1b4b", accent:"#a5b4fc", border:"#c7d2fe", sidebar:"#312e81" },
  teal:    { primary:"#14b8a6", light:"#f0fdfa", dark:"#0d9488", header:"#042f2e", accent:"#2dd4bf", border:"#99f6e4", sidebar:"#134e4a" },
  orange:  { primary:"#f97316", light:"#fff7ed", dark:"#ea580c", header:"#1c0700", accent:"#fb923c", border:"#fed7aa", sidebar:"#431407" },
  neutral: { primary:"#404040", light:"#fafafa", dark:"#262626", header:"#171717", accent:"#737373", border:"#d4d4d4", sidebar:"#262626" },
};

export const TEMPLATE_META: Record<TemplateName, { label: string; description: string; icon: string }> = {
  modern:    { label:"Modern",    description:"Dark header, clean lines",    icon:"fa-solid fa-layer-group" },
  classic:   { label:"Classic",   description:"Centered, traditional serif", icon:"fa-solid fa-scroll" },
  minimal:   { label:"Minimal",   description:"Left-border accent, airy",    icon:"fa-solid fa-minus" },
  executive: { label:"Executive", description:"Double column, professional", icon:"fa-solid fa-briefcase" },
  creative:  { label:"Creative",  description:"Colorful top band + icons",   icon:"fa-solid fa-palette" },
  sidebar:   { label:"Sidebar",   description:"Dark sidebar with content",   icon:"fa-solid fa-sidebar" },
  bold:      { label:"Bold",      description:"Full-width banner, strong",   icon:"fa-solid fa-bold" },
};

export const COLOR_META: Record<ColorName, { label: string; hex: string }> = {
  blue:     { label:"Sky Blue",    hex:"#0ea5e9" },
  emerald: { label:"Emerald",     hex:"#10b981" },
  violet:  { label:"Violet",      hex:"#8b5cf6" },
  rose:    { label:"Rose",        hex:"#f43f5e" },
  amber:   { label:"Amber",       hex:"#f59e0b" },
  slate:   { label:"Slate",       hex:"#64748b" },
  indigo:  { label:"Indigo",      hex:"#6366f1" },
  teal:    { label:"Teal",        hex:"#14b8a6" },
  orange:  { label:"Orange",      hex:"#f97316" },
  neutral: { label:"Neutral",     hex:"#404040" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dStr(e: { startDate:string; endDate:string; current:boolean }) {
  if (!e.startDate && !e.current && !e.endDate) return "";
  return `${e.startDate}${e.startDate ? " – " : ""}${e.current ? "Present" : e.endDate}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// ResumePDF — react-pdf export
// ═════════════════════════════════════════════════════════════════════════════
const PDF_COLORS: Record<ColorName, { p:string; l:string; d:string; h:string; a:string }> = {
  blue:     { p:"#0ea5e9", l:"#e0f2fe", d:"#0284c7", h:"#0c1a2e", a:"#38bdf8" },
  emerald: { p:"#10b981", l:"#d1fae5", d:"#059669", h:"#052e16", a:"#34d399" },
  violet:  { p:"#8b5cf6", l:"#ede9fe", d:"#7c3aed", h:"#1e0a3c", a:"#a78bfa" },
  rose:    { p:"#f43f5e", l:"#ffe4e6", d:"#e11d48", h:"#3b0012", a:"#fb7185" },
  amber:   { p:"#f59e0b", l:"#fef3c7", d:"#d97706", h:"#1c0a00", a:"#fbbf24" },
  slate:   { p:"#64748b", l:"#f1f5f9", d:"#475569", h:"#0f172a", a:"#94a3b8" },
  indigo:  { p:"#6366f1", l:"#e0e7ff", d:"#4f46e5", h:"#1e1b4b", a:"#a5b4fc" },
  teal:    { p:"#14b8a6", l:"#ccfbf1", d:"#0d9488", h:"#042f2e", a:"#2dd4bf" },
  orange:  { p:"#f97316", l:"#ffedd5", d:"#ea580c", h:"#1c0700", a:"#fb923c" },
  neutral: { p:"#404040", l:"#f5f5f5", d:"#262626", h:"#171717", a:"#737373" },
};

export function ResumePDF({ data, template="modern", color="blue" }: {
  data: ResumeData; template: TemplateName; color: ColorName;
}) {
  const c = PDF_COLORS[color]  || PDF_COLORS.blue;
  

  const s = StyleSheet.create({
    page: { backgroundColor:"#fff", paddingTop:36, paddingBottom:36, paddingHorizontal:40, fontFamily:"Helvetica", fontSize:9, color:"#374151" },
    darkHeader: { backgroundColor:c.h, marginTop:-36, marginLeft:-40, marginRight:-40, paddingTop:24, paddingBottom:18, paddingHorizontal:40, marginBottom:14 },
    name: { fontSize:18, fontFamily:"Helvetica-Bold", color:"#fff", letterSpacing:0.5 },
    nameCenter: { fontSize:18, fontFamily:"Helvetica-Bold", color:"#111827", textAlign:"center", textTransform:"uppercase", letterSpacing:1.5 },
    nameDark: { fontSize:22, fontFamily:"Helvetica-Bold", color:"#fff" },
    title: { fontSize:9, color:c.a, marginTop:3, fontFamily:"Helvetica-Bold" },
    titleDark: { fontSize:9, color:"#111827", textAlign:"center", marginTop:2 },
    contacts: { flexDirection:"row", flexWrap:"wrap", gap:8, marginTop:6 },
    contactItem: { fontSize:8, color:"#9ca3af" },
    contactItemDark: { fontSize:8, color:"#6b7280" },
    section: { marginBottom:10 },
    secTitle: { fontSize:8, fontFamily:"Helvetica-Bold", textTransform:"uppercase", letterSpacing:1.2, color:"#9ca3af", borderBottomWidth:0.5, borderBottomColor:"#f3f4f6", paddingBottom:3, marginBottom:6 },
    secTitleColored: { fontSize:8, fontFamily:"Helvetica-Bold", textTransform:"uppercase", letterSpacing:1.2, color:c.p, paddingBottom:3, marginBottom:6 },
    secTitleClassic: { fontSize:9, fontFamily:"Helvetica-Bold", textTransform:"uppercase", letterSpacing:1, color:"#374151", borderBottomWidth:0.75, borderBottomColor:"#d1d5db", paddingBottom:3, marginBottom:6 },
    entryTitle: { fontSize:9.5, fontFamily:"Helvetica-Bold", color:c.p },
    entryOrg: { fontSize:9, fontFamily:"Helvetica-Bold", color:"#374151" },
    entryDate: { fontSize:8, color:"#9ca3af" },
    entryRow: { flexDirection:"row", justifyContent:"space-between" },
    entryDesc: { fontSize:8.5, color:"#6b7280", lineHeight:1.5, marginTop:2 },
    entryBlock: { marginBottom:7 },
    skillsRow: { flexDirection:"row", flexWrap:"wrap", gap:4 },
    skillPill: { backgroundColor:c.l, paddingVertical:2, paddingHorizontal:6, borderRadius:4, fontSize:8, color:c.d },
    certRow: { flexDirection:"row", justifyContent:"space-between", marginBottom:3 },
    certName: { fontSize:8.5, fontFamily:"Helvetica-Bold", color:"#374151" },
    certMeta: { fontSize:8, color:"#9ca3af" },
    // Sidebar layout
    sidebarWrap: { flexDirection:"row", marginTop:-36, marginLeft:-40, marginRight:-40, marginBottom:0, minHeight:"100%" },
    sidebarLeft: { backgroundColor:c.h, width:160, paddingTop:24, paddingBottom:24, paddingLeft:16, paddingRight:14 },
    sidebarRight: { flex:1, paddingTop:24, paddingLeft:18, paddingRight:20, paddingBottom:24 },
    sidebarName: { fontSize:13, fontFamily:"Helvetica-Bold", color:"#fff", lineHeight:1.3 },
    sidebarTitle: { fontSize:8, color:c.a, marginTop:3 },
    sidebarSecTitle: { fontSize:7, fontFamily:"Helvetica-Bold", textTransform:"uppercase", letterSpacing:1, color:c.a, borderBottomWidth:0.5, borderBottomColor:"#ffffff30", paddingBottom:2, marginBottom:5, marginTop:10 },
    sidebarText: { fontSize:8, color:"#d1d5db", lineHeight:1.5 },
    sidebarSkillPill: { backgroundColor:"#ffffff15", borderRadius:3, paddingVertical:2, paddingHorizontal:5, fontSize:7.5, color:"#e5e7eb", marginBottom:2 },
    // Executive two-col
    execWrap: { flexDirection:"row", gap:16 },
    execLeft: { flex:2 },
    execRight: { flex:1 },
  });

  const ST = ({ title, style }: { title:string; style?:any }) => (
    <Text style={style || s.secTitle}>{title}</Text>
  );

  const Contacts = ({ textStyle }: { textStyle: any }) => (
    <View style={s.contacts}>
      {data.contact.email    && <Text style={textStyle}>{data.contact.email}</Text>}
      {data.contact.phone    && <Text style={textStyle}>· {data.contact.phone}</Text>}
      {data.contact.city     && <Text style={textStyle}>· {data.contact.city}{data.contact.country ? `, ${data.contact.country}` : ""}</Text>}
      {data.contact.linkedin && <Text style={textStyle}>· {data.contact.linkedin}</Text>}
      {data.contact.website  && <Text style={textStyle}>· {data.contact.website}</Text>}
    </View>
  );

  const fullName = `${data.contact.firstName || "First"} ${data.contact.lastName || "Last"}`;

  const ExpSection = ({ secStyle }: { secStyle?: any }) => (
    <>
      {data.experience.length > 0 && (
        <View style={s.section}>
          <ST title="Experience" style={secStyle} />
          {data.experience.map(exp => (
            <View key={exp.id} style={s.entryBlock}>
              <View style={s.entryRow}>
                <Text style={s.entryTitle}>{exp.position || "Position"}</Text>
                <Text style={s.entryDate}>{dStr(exp)}</Text>
              </View>
              <Text style={s.entryOrg}>{exp.company}</Text>
              {exp.description ? <Text style={s.entryDesc}>{exp.description}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </>
  );

  const EduSection = ({ secStyle }: { secStyle?: any }) => (
    <>
      {data.education.length > 0 && (
        <View style={s.section}>
          <ST title="Education" style={secStyle} />
          {data.education.map(edu => (
            <View key={edu.id} style={s.entryBlock}>
              <View style={s.entryRow}>
                <Text style={s.entryTitle}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</Text>
                <Text style={s.entryDate}>{dStr(edu)}</Text>
              </View>
              <Text style={s.entryOrg}>{edu.institution}</Text>
              {edu.grade ? <Text style={s.entryDate}>Grade: {edu.grade}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </>
  );

  const SkillsSection = ({ secStyle, plain }: { secStyle?: any; plain?: boolean }) => (
    <>
      {data.skills.length > 0 && (
        <View style={s.section}>
          <ST title="Skills" style={secStyle} />
          {plain
            ? <Text style={s.entryDesc}>{data.skills.map(sk => sk.name).join("  ·  ")}</Text>
            : <View style={s.skillsRow}>{data.skills.map(sk => <Text key={sk.id} style={s.skillPill}>{sk.name}</Text>)}</View>}
        </View>
      )}
    </>
  );

  const CertsSection = ({ secStyle }: { secStyle?: any }) => (
    <>
      {data.certs.length > 0 && (
        <View style={s.section}>
          <ST title="Certifications" style={secStyle} />
          {data.certs.map(cert => (
            <View key={cert.id} style={s.certRow}>
              <Text style={s.certName}>{cert.name}</Text>
              <Text style={s.certMeta}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );

  const ProjectsSection = ({ secStyle }: { secStyle?: any }) => (
    <>
      {data.projects.length > 0 && (
        <View style={s.section}>
          <ST title="Projects" style={secStyle} />
          {data.projects.map(p => (
            <View key={p.id} style={s.entryBlock}>
              <View style={s.entryRow}>
                <Text style={{ ...s.entryOrg, fontSize:9.5 }}>{p.title || "Project"}</Text>
                {p.link ? <Link src={p.link} style={{ fontSize:8, color:c.p }}>Link</Link> : null}
              </View>
              {p.description ? <Text style={s.entryDesc}>{p.description}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </>
  );

  const CustomSections = ({ secStyle }: { secStyle?: any }) => (
    <>
      {data.custom.filter(cx => cx.heading).map(cx => (
        <View key={cx.id} style={s.section}>
          <ST title={cx.heading} style={secStyle} />
          <Text style={s.entryDesc}>{cx.content}</Text>
        </View>
      ))}
    </>
  );

  const SummarySection = ({ secStyle }: { secStyle?: any }) => (
    <>
      {data.summary && (
        <View style={s.section}>
          <ST title="Summary" style={secStyle} />
          <Text style={s.entryDesc}>{data.summary}</Text>
        </View>
      )}
    </>
  );

  // ── SIDEBAR layout (special two-column) ───────────────────────────────────
  if (template === "sidebar") {
    return (
      <Document>
        <Page size="A4" style={{ ...s.page, paddingTop:0, paddingLeft:0, paddingRight:0, paddingBottom:0 }}>
          <View style={s.sidebarWrap}>
            <View style={s.sidebarLeft}>
              <Text style={s.sidebarName}>{fullName}</Text>
              {data.contact.jobTitle && <Text style={s.sidebarTitle}>{data.contact.jobTitle}</Text>}
              <Text style={s.sidebarSecTitle}>Contact</Text>
              {data.contact.email    && <Text style={s.sidebarText}>{data.contact.email}</Text>}
              {data.contact.phone    && <Text style={s.sidebarText}>{data.contact.phone}</Text>}
              {data.contact.city     && <Text style={s.sidebarText}>{data.contact.city}{data.contact.country ? `, ${data.contact.country}` : ""}</Text>}
              {data.contact.linkedin && <Text style={s.sidebarText}>{data.contact.linkedin}</Text>}
              {data.contact.website  && <Text style={s.sidebarText}>{data.contact.website}</Text>}
              {data.skills.length > 0 && (
                <>
                  <Text style={s.sidebarSecTitle}>Skills</Text>
                  {data.skills.map(sk => <Text key={sk.id} style={s.sidebarSkillPill}>{sk.name}</Text>)}
                </>
              )}
              {data.certs.length > 0 && (
                <>
                  <Text style={s.sidebarSecTitle}>Certifications</Text>
                  {data.certs.map(cert => <Text key={cert.id} style={s.sidebarText}>{cert.name}{cert.year ? ` (${cert.year})` : ""}</Text>)}
                </>
              )}
            </View>
            <View style={s.sidebarRight}>
              <SummarySection />
              <ExpSection />
              <EduSection />
              <ProjectsSection />
              <CustomSections />
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // ── EXECUTIVE two-column ──────────────────────────────────────────────────
  if (template === "executive") {
    return (
      <Document>
        <Page size="A4" style={s.page}>
          <View style={{ borderBottomWidth:2, borderBottomColor:c.p, paddingBottom:10, marginBottom:14 }}>
            <Text style={{ fontSize:20, fontFamily:"Helvetica-Bold", color:"#111827", letterSpacing:0.5 }}>{fullName}</Text>
            {data.contact.jobTitle && <Text style={{ fontSize:9.5, color:c.p, marginTop:2 }}>{data.contact.jobTitle}</Text>}
            <Contacts textStyle={s.contactItemDark} />
          </View>
          <View style={s.execWrap}>
            <View style={s.execLeft}>
              <SummarySection secStyle={s.secTitleClassic} />
              <ExpSection secStyle={s.secTitleClassic} />
              <ProjectsSection secStyle={s.secTitleClassic} />
              <CustomSections secStyle={s.secTitleClassic} />
            </View>
            <View style={s.execRight}>
              <EduSection secStyle={s.secTitleColored} />
              <SkillsSection secStyle={s.secTitleColored} plain />
              <CertsSection secStyle={s.secTitleColored} />
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // ── All other single-column templates ─────────────────────────────────────
  const secStyle = template === "classic" ? s.secTitleClassic : template === "minimal" ? s.secTitleColored : s.secTitle;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* MODERN — dark header */}
        {template === "modern" && (
          <View style={s.darkHeader}>
            <Text style={s.name}>{fullName}</Text>
            {data.contact.jobTitle && <Text style={s.title}>{data.contact.jobTitle}</Text>}
            <Contacts textStyle={s.contactItem} />
          </View>
        )}
        {/* CLASSIC — centered */}
        {template === "classic" && (
          <View style={{ alignItems:"center", borderBottomWidth:2, borderBottomColor:c.p, paddingBottom:10, marginBottom:14 }}>
            <Text style={s.nameCenter}>{fullName}</Text>
            {data.contact.jobTitle && <Text style={s.titleDark}>{data.contact.jobTitle}</Text>}
            <Contacts textStyle={s.contactItemDark} />
          </View>
        )}
        {/* MINIMAL — left border */}
        {template === "minimal" && (
          <View style={{ borderLeftWidth:3, borderLeftColor:c.p, paddingLeft:10, marginBottom:14 }}>
            <Text style={{ fontSize:18, fontFamily:"Helvetica-Bold", color:"#111827", fontWeight:300 }}>{fullName}</Text>
            {data.contact.jobTitle && <Text style={{ fontSize:9, color:c.p, marginTop:2 }}>{data.contact.jobTitle}</Text>}
            <Contacts textStyle={s.contactItemDark} />
          </View>
        )}
        {/* CREATIVE — full-width color band */}
        {template === "creative" && (
          <View style={{ backgroundColor:c.p, marginTop:-36, marginLeft:-40, marginRight:-40, paddingTop:22, paddingBottom:22, paddingHorizontal:40, marginBottom:14 }}>
            <Text style={{ fontSize:22, fontFamily:"Helvetica-Bold", color:"#fff", letterSpacing:0.5 }}>{fullName}</Text>
            {data.contact.jobTitle && <Text style={{ fontSize:9.5, color:"#ffffff99", marginTop:3 }}>{data.contact.jobTitle}</Text>}
            <Contacts textStyle={{ ...s.contactItem, color:"#ffffffcc" }} />
          </View>
        )}
        {/* BOLD — large name, thick accent line */}
        {template === "bold" && (
          <View style={{ marginBottom:14 }}>
            <Text style={{ fontSize:26, fontFamily:"Helvetica-Bold", color:"#111827", letterSpacing:-0.5 }}>{fullName}</Text>
            {data.contact.jobTitle && <Text style={{ fontSize:10, color:c.p, marginTop:2, fontFamily:"Helvetica-Bold" }}>{data.contact.jobTitle}</Text>}
            <View style={{ height:3, backgroundColor:c.p, marginTop:8, marginBottom:8 }}/>
            <Contacts textStyle={s.contactItemDark} />
          </View>
        )}

        <SummarySection secStyle={secStyle} />
        <ExpSection secStyle={secStyle} />
        <EduSection secStyle={secStyle} />
        <SkillsSection secStyle={secStyle} plain={template === "classic" || template === "minimal"} />
        <ProjectsSection secStyle={secStyle} />
        <CertsSection secStyle={secStyle} />
        <CustomSections secStyle={secStyle} />
      </Page>
    </Document>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// ResumeFullPreview — full A4 HTML preview with slim toolbar
// ═════════════════════════════════════════════════════════════════════════════
export function ResumeFullPreview({
  data,
  template: initTemplate = "modern",
  color: initColor = "blue",
  onDownload,
}: {
  data: ResumeData;
  template?: TemplateName;
  color?: ColorName;
  onDownload?: (template: TemplateName, color: ColorName) => void;
}) {
  const [template, setTemplate] = useState<TemplateName>(initTemplate);
  const [color, setColor]       = useState<ColorName>(initColor);
  const [tmplOpen, setTmplOpen] = useState(false);
  const [clrOpen, setClrOpen]   = useState(false);
  const c = HTML_COLORS[color];

  function dH(e: { startDate:string; endDate:string; current:boolean }) {
    if (!e.startDate && !e.current && !e.endDate) return "";
    return `${e.startDate}${e.startDate ? " – " : ""}${e.current ? "Present" : e.endDate}`;
  }

  // ── Shared mini-components ─────────────────────────────────────────────────
  const SecTitle = ({ t, style }: { t: string; style: React.CSSProperties }) => (
    <div style={{ fontSize:8.5, fontWeight:800, textTransform:"uppercase" as const, letterSpacing:"0.12em", marginBottom:7, ...style }}>{t}</div>
  );

  const EntryBlock = ({ children }: { children: React.ReactNode }) => (
    <div style={{ marginBottom:9 }}>{children}</div>
  );

  const EntryRow = ({ left, right }: { left: React.ReactNode; right: string }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div style={{ flex:1 }}>{left}</div>
      {right && <span style={{ fontSize:8.5, color:"#9ca3af", whiteSpace:"nowrap" as const, marginLeft:8 }}>{right}</span>}
    </div>
  );

  // Section styles per template
  const secStyle = (): React.CSSProperties => {
    if (template === "minimal")   return { color:c.primary, borderBottom:"none" };
    if (template === "classic")   return { color:"#374151", borderBottom:"1px solid #d1d5db", paddingBottom:3 };
    if (template === "sidebar")   return { color:c.accent, borderBottom:`1px solid ${c.primary}44`, paddingBottom:2 };
    if (template === "executive") return { color:"#374151", borderBottom:`1px solid ${c.primary}`, paddingBottom:3 };
    if (template === "creative")  return { color:c.dark, borderBottom:`2px solid ${c.primary}22` };
    if (template === "bold")      return { color:c.primary, borderBottom:"none" };
    return { color:"#9ca3af", borderBottom:"1px solid #f3f4f6", paddingBottom:3 }; // modern
  };

  const entryTitleColor = template === "sidebar" ? c.accent : c.primary;

  // ── Section renders ────────────────────────────────────────────────────────
  const SummaryBlock = () => !data.summary ? null : (
    <div style={{ marginBottom:14 }}>
      <SecTitle t={template === "minimal" ? "About" : "Professional Summary"} style={secStyle()} />
      <p style={{ fontSize:10, color:"#6b7280", lineHeight:1.6, margin:0 }}>{data.summary}</p>
    </div>
  );

  const ExpBlock = ({ ss }: { ss?: React.CSSProperties }) => data.experience.length === 0 ? null : (
    <div style={{ marginBottom:14 }}>
      <SecTitle t="Experience" style={ss || secStyle()} />
      {data.experience.map((exp,i) => (
        <EntryBlock key={exp.id}>
          <EntryRow left={<span style={{ fontWeight:700, color:entryTitleColor, fontSize:11 }}>{exp.position || "Position"}</span>} right={dH(exp)} />
          <div style={{ fontSize:10, fontWeight:700, color:"#374151" }}>{exp.company}</div>
          {exp.description && <div style={{ fontSize:10, color:"#6b7280", marginTop:3, lineHeight:1.6, whiteSpace:"pre-line" as const }}>{exp.description}</div>}
        </EntryBlock>
      ))}
    </div>
  );

  const EduBlock = ({ ss }: { ss?: React.CSSProperties }) => data.education.length === 0 ? null : (
    <div style={{ marginBottom:14 }}>
      <SecTitle t="Education" style={ss || secStyle()} />
      {data.education.map(edu => (
        <EntryBlock key={edu.id}>
          <EntryRow left={<span style={{ fontWeight:700, color:entryTitleColor, fontSize:11 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span>} right={dH(edu)} />
          <div style={{ fontSize:10, fontWeight:700, color:"#374151" }}>{edu.institution}</div>
          {edu.grade && <div style={{ fontSize:9, color:"#9ca3af" }}>Grade: {edu.grade}</div>}
        </EntryBlock>
      ))}
    </div>
  );

  const SkillsBlock = ({ ss, plain }: { ss?: React.CSSProperties; plain?: boolean }) => data.skills.length === 0 ? null : (
    <div style={{ marginBottom:14 }}>
      <SecTitle t="Skills" style={ss || secStyle()} />
      {plain
        ? <div style={{ fontSize:10, color:"#6b7280", lineHeight:1.8 }}>{data.skills.map(sk => sk.name).join("  ·  ")}</div>
        : <div style={{ display:"flex", flexWrap:"wrap" as const, gap:5 }}>
            {data.skills.map(sk => (
              <span key={sk.id} style={{ background:c.light, color:c.dark, border:`1px solid ${c.border}`, borderRadius:4, padding:"2px 8px", fontSize:9, fontWeight:600 }}>{sk.name}</span>
            ))}
          </div>}
    </div>
  );

  const ProjectsBlock = ({ ss }: { ss?: React.CSSProperties }) => data.projects.length === 0 ? null : (
    <div style={{ marginBottom:14 }}>
      <SecTitle t="Projects" style={ss || secStyle()} />
      {data.projects.map(p => (
        <EntryBlock key={p.id}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
            <span style={{ fontWeight:700, fontSize:10.5, color:"#111827" }}>{p.title || "Project"}</span>
            {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize:9, color:c.primary, textDecoration:"none" }}>↗ Link</a>}
          </div>
          {p.description && <div style={{ fontSize:10, color:"#6b7280", marginTop:3, lineHeight:1.6 }}>{p.description}</div>}
        </EntryBlock>
      ))}
    </div>
  );

  const CertsBlock = ({ ss }: { ss?: React.CSSProperties }) => data.certs.length === 0 ? null : (
    <div style={{ marginBottom:14 }}>
      <SecTitle t="Certifications" style={ss || secStyle()} />
      {data.certs.map(cert => (
        <div key={cert.id} style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:4 }}>
          <span style={{ fontWeight:700, color:"#111827" }}>{cert.name}</span>
          <span style={{ color:"#9ca3af" }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</span>
        </div>
      ))}
    </div>
  );

  const CustomBlocks = ({ ss }: { ss?: React.CSSProperties }) => (
    <>
      {data.custom.filter(cx => cx.heading).map(cx => (
        <div key={cx.id} style={{ marginBottom:14 }}>
          <SecTitle t={cx.heading} style={ss || secStyle()} />
          <p style={{ fontSize:10, color:"#6b7280", lineHeight:1.6, margin:0, whiteSpace:"pre-line" as const }}>{cx.content}</p>
        </div>
      ))}
    </>
  );

  const ContactRow = ({ clr="white" }: { clr?: "white"|"dark"|"muted" }) => {
    const textColor = clr==="white" ? "#ffffffaa" : clr==="muted" ? "#9ca3af" : "#6b7280";
    return (
      <div style={{ display:"flex", flexWrap:"wrap" as const, gap:"0 14px", marginTop:8 }}>
        {data.contact.email    && <span style={{ fontSize:9, color:textColor }}><i className="fa-solid fa-envelope" style={{ marginRight:4, fontSize:8 }}/>{data.contact.email}</span>}
        {data.contact.phone    && <span style={{ fontSize:9, color:textColor }}><i className="fa-solid fa-phone" style={{ marginRight:4, fontSize:8 }}/>{data.contact.phone}</span>}
        {data.contact.city     && <span style={{ fontSize:9, color:textColor }}><i className="fa-solid fa-location-dot" style={{ marginRight:4, fontSize:8 }}/>{data.contact.city}{data.contact.country ? `, ${data.contact.country}` : ""}</span>}
        {data.contact.linkedin && <span style={{ fontSize:9, color:textColor }}><i className="fa-brands fa-linkedin" style={{ marginRight:4, fontSize:8 }}/>{data.contact.linkedin}</span>}
        {data.contact.website  && <span style={{ fontSize:9, color:textColor }}><i className="fa-solid fa-globe" style={{ marginRight:4, fontSize:8 }}/>{data.contact.website}</span>}
      </div>
    );
  };

  const fullName = `${data.contact.firstName || "Your"} ${data.contact.lastName || "Name"}`;

  // ── Template renderers ─────────────────────────────────────────────────────
  const ResumeBody = () => {
    const bodyFont = template === "classic" ? "'Times New Roman', Times, serif" : template === "minimal" ? "'Helvetica Neue', Helvetica, sans-serif" : "Georgia, 'Times New Roman', serif";

    if (template === "sidebar") return (
      <div style={{ display:"flex", fontFamily:"'Helvetica Neue', sans-serif", fontSize:11, minHeight:1060 }}>
        {/* Dark sidebar */}
        <div style={{ width:200, background:c.sidebar, padding:"28px 16px 28px 18px", flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#fff", lineHeight:1.3, marginBottom:4 }}>{fullName}</div>
          {data.contact.jobTitle && <div style={{ fontSize:9.5, color:c.accent, fontWeight:600, marginBottom:14 }}>{data.contact.jobTitle}</div>}

          <div style={{ fontSize:8, fontWeight:800, textTransform:"uppercase" as const, letterSpacing:"0.15em", color:c.accent, borderBottom:`1px solid ${c.primary}55`, paddingBottom:4, marginBottom:8 }}>Contact</div>
          {data.contact.email    && <div style={{ fontSize:8.5, color:"#d1d5db", marginBottom:4 }}><i className="fa-solid fa-envelope" style={{ marginRight:5, color:c.accent, fontSize:8 }}/>{data.contact.email}</div>}
          {data.contact.phone    && <div style={{ fontSize:8.5, color:"#d1d5db", marginBottom:4 }}><i className="fa-solid fa-phone" style={{ marginRight:5, color:c.accent, fontSize:8 }}/>{data.contact.phone}</div>}
          {data.contact.city     && <div style={{ fontSize:8.5, color:"#d1d5db", marginBottom:4 }}><i className="fa-solid fa-location-dot" style={{ marginRight:5, color:c.accent, fontSize:8 }}/>{data.contact.city}</div>}
          {data.contact.linkedin && <div style={{ fontSize:8.5, color:"#d1d5db", marginBottom:4, wordBreak:"break-all" as const }}><i className="fa-brands fa-linkedin" style={{ marginRight:5, color:c.accent, fontSize:8 }}/>{data.contact.linkedin}</div>}
          {data.contact.website  && <div style={{ fontSize:8.5, color:"#d1d5db", marginBottom:4, wordBreak:"break-all" as const }}><i className="fa-solid fa-globe" style={{ marginRight:5, color:c.accent, fontSize:8 }}/>{data.contact.website}</div>}

          {data.skills.length > 0 && <>
            <div style={{ fontSize:8, fontWeight:800, textTransform:"uppercase" as const, letterSpacing:"0.15em", color:c.accent, borderBottom:`1px solid ${c.primary}55`, paddingBottom:4, marginBottom:8, marginTop:16 }}>Skills</div>
            <div style={{ display:"flex", flexWrap:"wrap" as const, gap:4 }}>
              {data.skills.map(sk => <span key={sk.id} style={{ display:"block", fontSize:8, color:"#e5e7eb", background:"#ffffff1a", borderRadius:3, padding:"2px 6px", marginBottom:3 }}>{sk.name}</span>)}
            </div>
          </>}

          {data.certs.length > 0 && <>
            <div style={{ fontSize:8, fontWeight:800, textTransform:"uppercase" as const, letterSpacing:"0.15em", color:c.accent, borderBottom:`1px solid ${c.primary}55`, paddingBottom:4, marginBottom:8, marginTop:16 }}>Certifications</div>
            {data.certs.map(cert => <div key={cert.id} style={{ fontSize:8, color:"#d1d5db", marginBottom:4 }}>{cert.name}{cert.year ? ` · ${cert.year}` : ""}</div>)}
          </>}
        </div>

        {/* Main content */}
        <div style={{ flex:1, padding:"28px 28px 28px 22px" }}>
          <SummaryBlock />
          <ExpBlock />
          <EduBlock />
          <ProjectsBlock />
          <CustomBlocks />
        </div>
      </div>
    );

    if (template === "executive") return (
      <div style={{ fontFamily:bodyFont, fontSize:11, color:"#374151", padding:"32px 36px" }}>
        <div style={{ borderBottom:`2px solid ${c.primary}`, paddingBottom:12, marginBottom:18 }}>
          <div style={{ fontSize:22, fontWeight:800, color:"#111827", letterSpacing:-0.5 }}>{fullName}</div>
          {data.contact.jobTitle && <div style={{ fontSize:11, color:c.primary, marginTop:3, fontWeight:700 }}>{data.contact.jobTitle}</div>}
          <ContactRow clr="muted" />
        </div>
        {data.summary && <div style={{ fontSize:10.5, color:"#374151", lineHeight:1.7, marginBottom:18, fontStyle:"italic" }}>{data.summary}</div>}
        <div style={{ display:"flex", gap:20 }}>
          <div style={{ flex:2 }}>
            <ExpBlock ss={{ color:"#374151", borderBottom:`1px solid ${c.primary}`, paddingBottom:3 }} />
            <ProjectsBlock ss={{ color:"#374151", borderBottom:`1px solid ${c.primary}`, paddingBottom:3 }} />
            <CustomBlocks ss={{ color:"#374151", borderBottom:`1px solid ${c.primary}`, paddingBottom:3 }} />
          </div>
          <div style={{ flex:1 }}>
            <EduBlock ss={{ color:c.dark, borderBottom:`1px solid ${c.primary}`, paddingBottom:3 }} />
            <SkillsBlock ss={{ color:c.dark, borderBottom:`1px solid ${c.primary}`, paddingBottom:3 }} plain />
            <CertsBlock ss={{ color:c.dark, borderBottom:`1px solid ${c.primary}`, paddingBottom:3 }} />
          </div>
        </div>
      </div>
    );

    if (template === "creative") return (
      <div style={{ fontFamily:bodyFont, fontSize:11, color:"#374151" }}>
        <div style={{ background:c.primary, padding:"26px 36px 22px" }}>
          <div style={{ fontSize:24, fontWeight:800, color:"#fff", letterSpacing:-0.5 }}>{fullName}</div>
          {data.contact.jobTitle && <div style={{ fontSize:11, color:"#ffffff99", marginTop:3, fontWeight:600 }}>{data.contact.jobTitle}</div>}
          <ContactRow clr="white" />
        </div>
        {/* Colored tab bar */}
        <div style={{ background:c.dark, height:4 }} />
        <div style={{ padding:"24px 36px 28px" }}>
          <SummaryBlock />
          <ExpBlock />
          <EduBlock />
          <SkillsBlock />
          <ProjectsBlock />
          <CertsBlock />
          <CustomBlocks />
        </div>
      </div>
    );

    if (template === "bold") return (
      <div style={{ fontFamily:bodyFont, fontSize:11, color:"#374151", padding:"32px 36px" }}>
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:32, fontWeight:900, color:"#111827", letterSpacing:-1, lineHeight:1 }}>{fullName}</div>
          {data.contact.jobTitle && <div style={{ fontSize:12, color:c.primary, marginTop:6, fontWeight:800, textTransform:"uppercase" as const, letterSpacing:1 }}>{data.contact.jobTitle}</div>}
          <div style={{ height:4, background:c.primary, margin:"10px 0 10px", borderRadius:2 }} />
          <ContactRow clr="muted" />
        </div>
        <SummaryBlock />
        <ExpBlock />
        <EduBlock />
        <SkillsBlock />
        <ProjectsBlock />
        <CertsBlock />
        <CustomBlocks />
      </div>
    );

    if (template === "classic") return (
      <div style={{ fontFamily:bodyFont, fontSize:11, color:"#374151", padding:"32px 40px" }}>
        <div style={{ textAlign:"center", borderBottom:`2.5px solid ${c.primary}`, paddingBottom:14, marginBottom:16 }}>
          <div style={{ fontSize:22, fontWeight:900, color:"#111827", letterSpacing:2, textTransform:"uppercase" as const }}>{fullName}</div>
          {data.contact.jobTitle && <div style={{ fontSize:10.5, color:c.primary, marginTop:4, fontWeight:600 }}>{data.contact.jobTitle}</div>}
          <ContactRow clr="dark" />
        </div>
        <SummaryBlock />
        <ExpBlock />
        <EduBlock />
        <SkillsBlock plain />
        <ProjectsBlock />
        <CertsBlock />
        <CustomBlocks />
      </div>
    );

    if (template === "minimal") return (
      <div style={{ fontFamily:bodyFont, fontSize:11, color:"#374151", padding:"32px 40px" }}>
        <div style={{ borderLeft:`3px solid ${c.primary}`, paddingLeft:14, marginBottom:20 }}>
          <div style={{ fontSize:20, fontWeight:300, color:"#111827", letterSpacing:1 }}>{fullName}</div>
          {data.contact.jobTitle && <div style={{ fontSize:10, color:c.primary, marginTop:3, fontWeight:600 }}>{data.contact.jobTitle}</div>}
          <ContactRow clr="muted" />
        </div>
        <SummaryBlock />
        <ExpBlock />
        <EduBlock />
        <SkillsBlock plain />
        <ProjectsBlock />
        <CertsBlock />
        <CustomBlocks />
      </div>
    );

    // MODERN (default)
    return (
      <div style={{ fontFamily:bodyFont, fontSize:11, color:"#374151" }}>
        <div style={{ background:c.header, padding:"28px 36px 22px" }}>
          <div style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:-0.3 }}>{fullName}</div>
          {data.contact.jobTitle && <div style={{ fontSize:10.5, color:c.accent, marginTop:4, fontWeight:600 }}>{data.contact.jobTitle}</div>}
          <ContactRow clr="white" />
        </div>
        <div style={{ padding:"20px 36px 28px" }}>
          <SummaryBlock />
          <ExpBlock />
          <EduBlock />
          <SkillsBlock />
          <ProjectsBlock />
          <CertsBlock />
          <CustomBlocks />
        </div>
      </div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

      <style>{`
        @media print {
          .no-print { display:none !important; }
          body { margin:0; background:white; }
          .a4-shadow { box-shadow:none !important; margin:0 !important; }
          .print-area { padding:0 !important; margin:0 !important; justify-content:flex-start !important; }
        }
        @page { size:A4; margin:0; }
        * { box-sizing:border-box; }
        body { margin:0; background:#e2e8f0; font-family:'Plus Jakarta Sans', sans-serif; }
        .ctrl-btn:hover { background:#f1f5f9 !important; }
        .dd-item:hover { background:#f0f9ff !important; }
        .color-btn:hover { transform:scale(1.1); }
      `}</style>

      {/* ── LEFT CONTROL STRIP ── */}
      <div className="no-print" style={{
        position:"fixed" as const,
        left:16,
        top:16,
        zIndex:200,
        display:"flex",
        flexDirection:"column" as const,
        gap:8,
      }}>
        {/* Back Button */}
        <a href="/builder" className="ctrl-btn" style={{
          width:44, height:44,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:10,
          textDecoration:"none",
          boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
          transition:"all .15s",
        }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize:14, color:"#475569" }} />
        </a>

        {/* Template Dropdown Button */}
        <div style={{ position:"relative" as const }}>
          <button
            className="ctrl-btn"
            onClick={() => { setTmplOpen(o => !o); setClrOpen(false); }}
            style={{
              width:44, height:44,
              display:"flex", alignItems:"center", justifyContent:"center",
              background: tmplOpen ? "#f1f5f9" : "#ffffff",
              border:"1px solid #e2e8f0", borderRadius:10,
              cursor:"pointer",
              boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
              transition:"all .15s",
            }}
          >
            <i className={TEMPLATE_META[template].icon} style={{ fontSize:14, color: tmplOpen ? c.primary : "#475569" }} />
          </button>
          {tmplOpen && (
            <div style={{
              position:"absolute" as const, top:0, left:52, zIndex:300,
              background:"#fff", border:"1px solid #e5e7eb", borderRadius:12,
              boxShadow:"0 8px 30px rgba(0,0,0,0.15)",
              width:220, padding:6,
            }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" as const, letterSpacing:"0.1em", padding:"6px 10px 4px" }}>Template</div>
              {(Object.keys(TEMPLATE_META) as TemplateName[]).map(t => (
                <button key={t} className="dd-item" onClick={() => { setTemplate(t); setTmplOpen(false); }} style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding:"9px 10px", background: template===t ? "#f0f9ff" : "transparent",
                  border:"none", borderRadius:8, cursor:"pointer", textAlign:"left" as const,
                  fontFamily:"'Plus Jakarta Sans', sans-serif",
                }}>
                  <i className={TEMPLATE_META[t].icon} style={{ fontSize:12, color: template===t ? c.primary : "#9ca3af", width:16 }} />
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color: template===t ? c.primary : "#374151" }}>{TEMPLATE_META[t].label}</div>
                    <div style={{ fontSize:10, color:"#9ca3af" }}>{TEMPLATE_META[t].description}</div>
                  </div>
                  {template===t && <i className="fa-solid fa-check" style={{ marginLeft:"auto", fontSize:10, color:c.primary }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Dropdown Button */}
        <div style={{ position:"relative" as const }}>
          <button
            className="ctrl-btn"
            onClick={() => { setClrOpen(o => !o); setTmplOpen(false); }}
            style={{
              width:44, height:44,
              display:"flex", alignItems:"center", justifyContent:"center",
              background: clrOpen ? "#f1f5f9" : "#ffffff",
              border:"1px solid #e2e8f0", borderRadius:10,
              cursor:"pointer",
              boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
              transition:"all .15s",
            }}
          >
            <span style={{ width:18, height:18, borderRadius:"50%", background:c.primary }} />
          </button>
          {clrOpen && (
            <div style={{
              position:"absolute" as const, top:0, left:52, zIndex:300,
              background:"#fff", border:"1px solid #e5e7eb", borderRadius:12,
              boxShadow:"0 8px 30px rgba(0,0,0,0.15)",
              width:200, padding:10,
            }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" as const, letterSpacing:"0.1em", marginBottom:8 }}>Color</div>
              <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8 }}>
                {(Object.keys(COLOR_META) as ColorName[]).map(col => (
                  <button
                    key={col}
                    className="color-btn"
                    onClick={() => { setColor(col); setClrOpen(false); }}
                    title={COLOR_META[col].label}
                    style={{
                      width:28, height:28,
                      borderRadius:"50%",
                      background:COLOR_META[col].hex,
                      border: color===col ? "3px solid #1e293b" : "2px solid #e2e8f0",
                      cursor:"pointer",
                      transition:"all .15s",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}
                  >
                    {color===col && <i className="fa-solid fa-check" style={{ fontSize:9, color:"#fff" }} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click-outside to close dropdowns */}
      {(tmplOpen || clrOpen) && (
        <div className="no-print" style={{ position:"fixed" as const, inset:0, zIndex:199 }}
          onClick={() => { setTmplOpen(false); setClrOpen(false); }} />
      )}

      {/* ── DOWNLOAD BUTTON - Top Right ── */}
      <div className="no-print" style={{
        position:"fixed" as const,
        top:16,
        right:16,
        zIndex:200,
      }}>
        <button
          onClick={() => { if (onDownload) onDownload(template, color); else window.print(); }}
          style={{
            display:"flex", alignItems:"center", gap:8,
            background:c.primary, color:"#fff",
            border:"none", borderRadius:10,
            padding:"12px 20px", fontSize:13, fontWeight:700, cursor:"pointer",
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            boxShadow:`0 4px 16px ${c.primary}44`,
            transition:"all .15s",
          }}
        >
          <i className="fa-solid fa-download" style={{ fontSize:12 }} />
          Download PDF
        </button>
      </div>

      {/* ── A4 CANVAS - Full top alignment for print ── */}
      <div className="print-area" style={{ 
        display:"flex", 
        justifyContent:"center", 
        alignItems:"flex-start",
        minHeight:"100vh",
        background:"#e2e8f0",
      }}>
        <div className="a4-shadow" style={{
          width:794, 
          minHeight:1123,
          background:"#ffffff",
          boxShadow:"0 4px 40px rgba(0,0,0,0.12), 0 1px 8px rgba(0,0,0,0.06)",
          overflow:"hidden",
        }}>
          <ResumeBody />
        </div>
      </div>
    </>
  );
}
