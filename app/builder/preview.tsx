"use client";

import { useState } from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
export interface ContactData {
  firstName:string; lastName:string; email:string; phone:string;
  jobTitle:string; city:string; country:string; linkedin:string; website:string;
}
export interface ExpEntry      { id:number; company:string; position:string; startDate:string; endDate:string; current:boolean; description:string; }
export interface EduEntry      { id:number; institution:string; degree:string; field:string; startDate:string; endDate:string; current:boolean; grade:string; }
export interface SkillGroup    { id:number; heading:string; skills:string; }   // ← NEW grouped structure
export interface ProjectEntry  { id:number; title:string; description:string; link:string; }
export interface CertEntry     { id:number; name:string; issuer:string; year:string; }
export interface CustomSection { id:number; heading:string; content:string; }
export interface ResumeData {
  contact:ContactData; summary:string;
  experience:ExpEntry[]; education:EduEntry[];
  skillGroups:SkillGroup[];          // ← replaces flat skills[]
  projects:ProjectEntry[];
  certs:CertEntry[]; custom:CustomSection[];
}

export type TemplateName =
  | "chronological" | "functional" | "combination"
  | "executive"     | "modern"     | "minimal"
  | "compact"       | "elegant"    | "classic"
  | "tech"
  | "colorband"     | "gradient"   | "vivid"
  | "centered"      | "grid"       | "sidebar"
  | "infographic"   | "timeline";

export type ColorName =
  | "blue"|"emerald"|"violet"|"rose"|"amber"
  | "slate"|"indigo"|"teal"|"orange"|"neutral";

// ═══════════════════════════════════════════════════════════════
// COLOR MAPS
// ═══════════════════════════════════════════════════════════════
export const COLOR_META:Record<ColorName,{label:string;hex:string}> = {
  blue:    {label:"Sky Blue",hex:"#0284c7"}, emerald:{label:"Emerald",hex:"#059669"},
  violet:  {label:"Violet",  hex:"#7c3aed"}, rose:   {label:"Rose",   hex:"#e11d48"},
  amber:   {label:"Amber",   hex:"#d97706"}, slate:  {label:"Slate",  hex:"#475569"},
  indigo:  {label:"Indigo",  hex:"#4f46e5"}, teal:   {label:"Teal",   hex:"#0d9488"},
  orange:  {label:"Orange",  hex:"#ea580c"}, neutral:{label:"Neutral",hex:"#525252"},
};

const HC:Record<ColorName,{p:string;l:string;d:string;b:string;tag:string;tagT:string}> = {
  blue:    {p:"#0284c7",l:"#e0f2fe",d:"#0369a1",b:"#bae6fd",tag:"#f0f9ff",tagT:"#0369a1"},
  emerald: {p:"#059669",l:"#d1fae5",d:"#047857",b:"#a7f3d0",tag:"#ecfdf5",tagT:"#047857"},
  violet:  {p:"#7c3aed",l:"#ede9fe",d:"#6d28d9",b:"#ddd6fe",tag:"#f5f3ff",tagT:"#6d28d9"},
  rose:    {p:"#e11d48",l:"#ffe4e6",d:"#be123c",b:"#fecdd3",tag:"#fff1f2",tagT:"#be123c"},
  amber:   {p:"#d97706",l:"#fef3c7",d:"#b45309",b:"#fde68a",tag:"#fffbeb",tagT:"#b45309"},
  slate:   {p:"#475569",l:"#f1f5f9",d:"#334155",b:"#cbd5e1",tag:"#f8fafc",tagT:"#334155"},
  indigo:  {p:"#4f46e5",l:"#e0e7ff",d:"#4338ca",b:"#c7d2fe",tag:"#eef2ff",tagT:"#4338ca"},
  teal:    {p:"#0d9488",l:"#ccfbf1",d:"#0f766e",b:"#99f6e4",tag:"#f0fdfa",tagT:"#0f766e"},
  orange:  {p:"#ea580c",l:"#ffedd5",d:"#c2410c",b:"#fed7aa",tag:"#fff7ed",tagT:"#c2410c"},
  neutral: {p:"#525252",l:"#f5f5f5",d:"#404040",b:"#d4d4d4",tag:"#fafafa",tagT:"#525252"},
};

const PC:Record<ColorName,{p:string;l:string;d:string;b:string}> = {
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

export const TEMPLATE_META:Record<TemplateName,{label:string;desc:string;icon:string;ats:number;colorful?:boolean;isNew?:boolean}> = {
  chronological:{label:"Chronological",desc:"Classic reverse-time, max ATS score",    icon:"fa-solid fa-clock-rotate-left",   ats:99},
  functional:   {label:"Functional",   desc:"Skills-first for career changers",         icon:"fa-solid fa-list-check",          ats:86},
  combination:  {label:"Combination",  desc:"Skills + chronology hybrid",              icon:"fa-solid fa-layer-group",         ats:93},
  executive:    {label:"Executive",    desc:"Leadership & C-suite profile",             icon:"fa-solid fa-crown",               ats:97},
  modern:       {label:"Modern",       desc:"Clean lines with accent color bar",        icon:"fa-solid fa-bolt",                ats:95},
  minimal:      {label:"Minimal",      desc:"Ultra-clean, maximum whitespace",          icon:"fa-solid fa-minus",               ats:98},
  compact:      {label:"Compact",      desc:"Dense, fits more on one page",             icon:"fa-solid fa-compress",            ats:94},
  elegant:      {label:"Elegant",      desc:"Serif font, left-rule refined look",       icon:"fa-solid fa-feather",             ats:96},
  classic:      {label:"Classic",      desc:"CV-style Classic",                         icon:"fa-solid fa-graduation-cap",      ats:97},
  tech:         {label:"Tech",         desc:"Developer-friendly, skill-forward",        icon:"fa-solid fa-code",                ats:92},
  colorband:    {label:"Color Band",   desc:"Bold accent header band",                  icon:"fa-solid fa-fill-drip",           ats:80,colorful:true},
  gradient:     {label:"Gradient",     desc:"Soft gradient header for visual flair",    icon:"fa-solid fa-wand-magic-sparkles", ats:78,colorful:true},
  vivid:        {label:"Vivid Split",  desc:"Split color bar — creative & bold",       icon:"fa-solid fa-palette",             ats:75,colorful:true},
  centered:     {label:"Centered",     desc:"All content centered — elegant symmetry",  icon:"fa-solid fa-align-center",        ats:88,isNew:true},
  grid:         {label:"Grid",         desc:"Card grid layout for sections",            icon:"fa-solid fa-table-cells",         ats:82,isNew:true},
  sidebar:      {label:"Dark Sidebar", desc:"Dark left sidebar with white main body",   icon:"fa-solid fa-sidebar",             ats:85,colorful:true,isNew:true},
  infographic:  {label:"Infographic",  desc:"Visual stats & skill bar meters",          icon:"fa-solid fa-chart-pie",           ats:72,colorful:true,isNew:true},
  timeline:     {label:"Timeline",     desc:"Visual vertical timeline for experience",  icon:"fa-solid fa-timeline",            ats:80,isNew:true},
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function ds(e:{startDate:string;endDate:string;current:boolean}) {
  if(!e.startDate&&!e.endDate&&!e.current) return "";
  return `${e.startDate}${e.startDate?" – ":""}${e.current?"Present":e.endDate}`;
}
const fn = (d:ResumeData) => `${d.contact.firstName||"Your"} ${d.contact.lastName||"Name"}`;

// Flatten all skill groups to a plain text list (for PDF / plain layouts)
function flatSkills(groups:SkillGroup[]):string {
  return groups.filter(g=>g.heading&&g.skills.trim())
    .map(g=>`${g.heading}: ${g.skills.split(",").map(s=>s.trim()).filter(Boolean).join(", ")}`)
    .join("  |  ");
}

// ═══════════════════════════════════════════════════════════════
// ResumePDF — react-pdf document
// ═══════════════════════════════════════════════════════════════
export function ResumePDF({data,template="chronological",color="blue"}:{
  data:ResumeData; template:TemplateName; color:ColorName;
}) {
  const c = PC[color];
  const serif = ["elegant","classic","chronological","executive"].includes(template);
  const f  = serif ? "Times-Roman"  : "Helvetica";
  const fb = serif ? "Times-Bold"   : "Helvetica-Bold";

  const s = StyleSheet.create({
    page:      {backgroundColor:"#fff",paddingTop:36,paddingBottom:36,paddingHorizontal:40,fontFamily:f,fontSize:9.5,color:"#374151",lineHeight:1.45},
    secPlain:  {fontSize:8.5,fontFamily:fb,textTransform:"uppercase",letterSpacing:1,color:c.p,paddingBottom:3,marginBottom:7,marginTop:12,borderBottomWidth:1,borderBottomColor:c.b},
    secLine:   {fontSize:9,fontFamily:fb,textTransform:"uppercase",letterSpacing:0.8,color:"#374151",paddingBottom:3,marginBottom:7,marginTop:12,borderBottomWidth:0.75,borderBottomColor:c.b},
    secDot:    {fontSize:8.5,fontFamily:fb,textTransform:"uppercase",letterSpacing:1,color:c.p,paddingBottom:3,marginBottom:7,marginTop:12},
    eRow:      {flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start"},
    eTitle:    {fontSize:10,fontFamily:fb,color:c.p},
    eTitleBlk: {fontSize:10,fontFamily:fb,color:"#111827"},
    eOrg:      {fontSize:9,fontFamily:fb,color:"#374151"},
    eDate:     {fontSize:8.5,color:"#9ca3af"},
    eDesc:     {fontSize:9,color:"#6b7280",lineHeight:1.5,marginTop:2},
    eBlock:    {marginBottom:8},
    certRow:   {flexDirection:"row",justifyContent:"space-between",marginBottom:3},
    certName:  {fontSize:9,fontFamily:fb,color:"#374151"},
    certMeta:  {fontSize:8.5,color:"#9ca3af"},
    cRow:      {flexDirection:"row",flexWrap:"wrap",gap:10,marginTop:6},
    cItem:     {fontSize:8.5,color:"#6b7280"},
    cItemW:    {fontSize:8.5,color:"#ffffffcc"},
    twoWrap:   {flexDirection:"row",gap:18},
    twoL:      {flex:2},
    twoR:      {flex:1},
    hdrBand:   {backgroundColor:c.p,paddingVertical:24,paddingHorizontal:40,marginTop:-36,marginLeft:-40,marginRight:-40,marginBottom:16},
    hdrWhite:  {paddingBottom:10,marginBottom:12,borderBottomWidth:1.5,borderBottomColor:c.b},
    nameWht:   {fontSize:22,fontFamily:fb,color:"#fff",letterSpacing:0.3},
    nameDk:    {fontSize:20,fontFamily:fb,color:"#111827"},
    jobColor:  {fontSize:9.5,color:c.p,marginTop:3,fontFamily:fb},
    jobWht:    {fontSize:9.5,color:"#ffffffdd",marginTop:3,fontFamily:fb},
    sec:       {marginBottom:0},
    skillRow:  {flexDirection:"row",flexWrap:"wrap",marginBottom:3,gap:2},
    skillLabel:{fontSize:9,fontFamily:fb,color:c.p},
    skillVal:  {fontSize:9,color:"#6b7280",flex:1,flexWrap:"wrap"},
  });

  const ST = ({t,style}:{t:string;style:any}) => <Text style={style}>{t}</Text>;

  const Contacts = ({ts}:{ts:any}) => (
    <View style={s.cRow}>
      {data.contact.email    && <Text style={ts}>{data.contact.email}</Text>}
      {data.contact.phone    && <Text style={ts}>· {data.contact.phone}</Text>}
      {data.contact.city     && <Text style={ts}>· {data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</Text>}
      {data.contact.linkedin && <Text style={ts}>· {data.contact.linkedin}</Text>}
      {data.contact.website  && <Text style={ts}>· {data.contact.website}</Text>}
    </View>
  );

  // ─── PDF Grouped Skills ───────────────────────────────────────
  const SecSkillsPDF = ({ss}:{ss:any}) => {
    const groups = data.skillGroups.filter(g=>g.heading&&g.skills.trim());
    if(!groups.length) return null;
    return (
      <View style={s.sec}>
        <ST t="Skills" style={ss}/>
        {groups.map(g=>{
          const chips = g.skills.split(",").map(sk=>sk.trim()).filter(Boolean);
          return (
            <View key={g.id} style={{flexDirection:"row",marginBottom:3,flexWrap:"wrap"}}>
              <Text style={{fontSize:9,fontFamily:fb,color:c.p}}>{g.heading}: </Text>
              <Text style={{fontSize:9,color:"#6b7280",flex:1}}>{chips.join(", ")}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const SecExp = ({ss}:{ss:any}) => !data.experience.length ? null : (
    <View style={s.sec}>
      <ST t="Professional Experience" style={ss}/>
      {data.experience.map(e=>(
        <View key={e.id} style={s.eBlock}>
          <View style={s.eRow}><Text style={s.eTitle}>{e.position||"Position"}</Text><Text style={s.eDate}>{ds(e)}</Text></View>
          <Text style={s.eOrg}>{e.company}</Text>
          {e.description?<Text style={s.eDesc}>{e.description}</Text>:null}
        </View>
      ))}
    </View>
  );
  const SecEdu = ({ss}:{ss:any}) => !data.education.length ? null : (
    <View style={s.sec}>
      <ST t="Education" style={ss}/>
      {data.education.map(e=>(
        <View key={e.id} style={s.eBlock}>
          <View style={s.eRow}><Text style={s.eTitle}>{e.degree}{e.field?` in ${e.field}`:""}</Text><Text style={s.eDate}>{ds(e)}</Text></View>
          <Text style={s.eOrg}>{e.institution}</Text>
          {e.grade?<Text style={s.eDate}>Grade: {e.grade}</Text>:null}
        </View>
      ))}
    </View>
  );
  const SecProj = ({ss}:{ss:any}) => !data.projects.length ? null : (
    <View style={s.sec}>
      <ST t="Projects" style={ss}/>
      {data.projects.map(p=>(
        <View key={p.id} style={s.eBlock}>
          <View style={s.eRow}>
            <Text style={s.eTitleBlk}>{p.title||"Project"}</Text>
            {p.link?<Link src={p.link} style={{fontSize:8,color:c.p}}>Link</Link>:null}
          </View>
          {p.description?<Text style={s.eDesc}>{p.description}</Text>:null}
        </View>
      ))}
    </View>
  );
  const SecCerts = ({ss}:{ss:any}) => !data.certs.length ? null : (
    <View style={s.sec}>
      <ST t="Certifications" style={ss}/>
      {data.certs.map(cert=>(
        <View key={cert.id} style={s.certRow}>
          <Text style={s.certName}>{cert.name}</Text>
          <Text style={s.certMeta}>{cert.issuer}{cert.year?` · ${cert.year}`:""}</Text>
        </View>
      ))}
    </View>
  );
  const SecSum = ({ss,label}:{ss:any;label?:string}) => !data.summary ? null : (
    <View style={s.sec}>
      <ST t={label||"Professional Summary"} style={ss}/>
      <Text style={s.eDesc}>{data.summary}</Text>
    </View>
  );
  const SecCustom = ({ss}:{ss:any}) => (
    <>{data.custom.filter(cx=>cx.heading).map(cx=>(
      <View key={cx.id} style={s.sec}>
        <ST t={cx.heading} style={ss}/>
        <Text style={s.eDesc}>{cx.content}</Text>
      </View>
    ))}</>
  );

  const name = fn(data);
  const newTemplates = ["centered","grid","sidebar","infographic","timeline"];

  // All new templates + unhandled fall back to chronological PDF style
  if(newTemplates.includes(template)||!["chronological","functional","combination","executive","colorband"].includes(template)) {
    return (
      <Document><Page size="A4" style={s.page}>
        <View style={s.hdrWhite}>
          <Text style={s.nameDk}>{name}</Text>
          {data.contact.jobTitle&&<Text style={s.jobColor}>{data.contact.jobTitle}</Text>}
          <Contacts ts={s.cItem}/>
        </View>
        <SecSum ss={s.secLine}/><SecExp ss={s.secLine}/><SecEdu ss={s.secLine}/>
        <SecSkillsPDF ss={s.secLine}/><SecCerts ss={s.secLine}/><SecProj ss={s.secLine}/><SecCustom ss={s.secLine}/>
      </Page></Document>
    );
  }

  if(template==="chronological") return (
    <Document><Page size="A4" style={s.page}>
      <View style={s.hdrWhite}>
        <Text style={s.nameDk}>{name}</Text>
        {data.contact.jobTitle&&<Text style={s.jobColor}>{data.contact.jobTitle}</Text>}
        <Contacts ts={s.cItem}/>
      </View>
      <SecSum ss={s.secLine}/><SecExp ss={s.secLine}/><SecEdu ss={s.secLine}/>
      <SecSkillsPDF ss={s.secLine}/><SecCerts ss={s.secLine}/><SecProj ss={s.secLine}/><SecCustom ss={s.secLine}/>
    </Page></Document>
  );

  if(template==="functional") return (
    <Document><Page size="A4" style={s.page}>
      <View style={s.hdrWhite}>
        <Text style={s.nameDk}>{name}</Text>
        {data.contact.jobTitle&&<Text style={s.jobColor}>{data.contact.jobTitle}</Text>}
        <Contacts ts={s.cItem}/>
      </View>
      <SecSkillsPDF ss={s.secPlain}/>
      <SecSum ss={s.secPlain} label="Professional Profile"/>
      <SecExp ss={s.secPlain}/><SecEdu ss={s.secPlain}/><SecCerts ss={s.secPlain}/><SecProj ss={s.secPlain}/><SecCustom ss={s.secPlain}/>
    </Page></Document>
  );

  if(template==="combination") return (
    <Document><Page size="A4" style={s.page}>
      <View style={s.hdrWhite}>
        <Text style={s.nameDk}>{name}</Text>
        {data.contact.jobTitle&&<Text style={s.jobColor}>{data.contact.jobTitle}</Text>}
        <Contacts ts={s.cItem}/>
      </View>
      <SecSum ss={s.secPlain}/>
      <View style={s.twoWrap}>
        <View style={s.twoL}><SecExp ss={s.secPlain}/><SecProj ss={s.secPlain}/><SecCustom ss={s.secPlain}/></View>
        <View style={s.twoR}><SecSkillsPDF ss={s.secDot}/><SecEdu ss={s.secDot}/><SecCerts ss={s.secDot}/></View>
      </View>
    </Page></Document>
  );

  if(template==="executive") return (
    <Document><Page size="A4" style={s.page}>
      <View style={{borderBottomWidth:2,borderBottomColor:c.b,paddingBottom:12,marginBottom:14}}>
        <Text style={{fontSize:22,fontFamily:fb,color:"#111827",letterSpacing:0.5}}>{name}</Text>
        {data.contact.jobTitle&&<Text style={{fontSize:10,color:c.p,fontFamily:fb,marginTop:3}}>{data.contact.jobTitle}</Text>}
        <Contacts ts={s.cItem}/>
      </View>
      {data.summary&&<Text style={{fontSize:10,color:"#374151",fontStyle:"italic",lineHeight:1.6,marginBottom:12}}>{data.summary}</Text>}
      <View style={s.twoWrap}>
        <View style={s.twoL}><SecExp ss={s.secLine}/><SecProj ss={s.secLine}/><SecCustom ss={s.secLine}/></View>
        <View style={s.twoR}><SecEdu ss={s.secLine}/><SecSkillsPDF ss={s.secLine}/><SecCerts ss={s.secLine}/></View>
      </View>
    </Page></Document>
  );

  // colorband
  return (
    <Document><Page size="A4" style={s.page}>
      <View style={s.hdrBand}>
        <Text style={s.nameWht}>{name}</Text>
        {data.contact.jobTitle&&<Text style={s.jobWht}>{data.contact.jobTitle}</Text>}
        <Contacts ts={s.cItemW}/>
      </View>
      <SecSum ss={s.secPlain}/><SecExp ss={s.secPlain}/><SecEdu ss={s.secPlain}/>
      <SecSkillsPDF ss={s.secPlain}/><SecProj ss={s.secPlain}/><SecCerts ss={s.secPlain}/><SecCustom ss={s.secPlain}/>
    </Page></Document>
  );
}

// ═══════════════════════════════════════════════════════════════
// Download Button
// ═══════════════════════════════════════════════════════════════
function dlStyle(bg:string,disabled?:boolean):React.CSSProperties {
  return {display:"flex",alignItems:"center",gap:8,background:disabled?"#e5e7eb":bg,color:disabled?"#9ca3af":"#fff",border:"none",borderRadius:10,padding:"9px 20px",fontSize:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:disabled?"none":`0 2px 12px ${bg}44`,textDecoration:"none",whiteSpace:"nowrap" as const};
}

function DownloadBtn({data,template,color}:{data:ResumeData;template:TemplateName;color:ColorName}) {
  const [isDownloading,setIsDownloading]=useState(false);
  const c=HC[color];
  const fileName=`${data.contact.firstName||"Resume"}_${data.contact.lastName||"CV"}.pdf`;
  const handleDownload=async()=>{
    const element=document.querySelector(".a4");if(!element)return;
    try{
      setIsDownloading(true);const toastId=toast.loading("Generating PDF...");
      const html=`<html><head><meta charset="utf-8"/><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/><style>body{margin:0;}.a4{width:210mm;min-height:297mm;}</style></head><body>${element.outerHTML}</body></html>`;
      const res=await fetch("/api/pdf",{method:"POST",body:JSON.stringify({html})});
      const blob=await res.blob();const url=window.URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=fileName;a.click();
      toast.success("Download complete!",{id:toastId});window.URL.revokeObjectURL(url);
    }catch(err){console.error(err);toast.error("Failed to download PDF");}
    finally{setIsDownloading(false);}
  };
  return(
    <button onClick={handleDownload} style={dlStyle(c.p)} disabled={isDownloading}>
      {isDownloading?<><i className="fa-solid fa-spinner fa-spin" style={{fontSize:11}}/> Downloading...</>:<><i className="fa-solid fa-download" style={{fontSize:11}}/> Download PDF</>}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// HTML PREVIEW — all 18 templates
// ═══════════════════════════════════════════════════════════════
function useTemplateRender(data:ResumeData,template:TemplateName,color:ColorName) {
  const c=HC[color];
  type SecVariant="accent"|"serif-accent"|"dot"|"dark-serif"|"white"|"centered";

  const SecTitle=({t,variant="accent"}:{t:string;variant?:SecVariant})=>{
    const base:React.CSSProperties={fontSize:8,fontWeight:800,textTransform:"uppercase" as const,letterSpacing:"0.13em",marginBottom:7,marginTop:16,paddingBottom:4};
    if(variant==="white")   return <div style={{...base,color:"rgba(255,255,255,0.7)",borderBottom:"1px solid rgba(255,255,255,0.2)"}}>{t}</div>;
    if(variant==="centered")return <div style={{...base,color:c.p,textAlign:"center",borderBottom:`1.5px solid ${c.b}`,paddingBottom:6,marginBottom:10}}>{t}</div>;
    if(variant==="serif-accent") return <div style={{...base,color:c.p,borderBottom:`1.5px solid ${c.b}`,fontFamily:"Georgia,serif",letterSpacing:"0.1em"}}>{t}</div>;
    if(variant==="dot")     return <div style={{...base,color:c.p,borderBottom:"none",display:"flex",alignItems:"center",gap:6}}><span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:c.p,flexShrink:0}}/>{t}</div>;
    if(variant==="dark-serif") return <div style={{...base,color:"#1e293b",borderBottom:`1px solid ${c.b}`,fontFamily:"Georgia,serif"}}>{t}</div>;
    return <div style={{...base,color:c.p,borderBottom:`1.5px solid ${c.b}`}}>{t}</div>;
  };

  const titleStyle:React.CSSProperties  ={fontWeight:700,fontSize:10.5,color:"#111827"};
  const subtitleStyle:React.CSSProperties={fontSize:9.5,fontWeight:600,color:"#374151",marginTop:1};
  const metaStyle:React.CSSProperties   ={fontSize:9,color:"#9ca3af"};
  const bodyStyle:React.CSSProperties   ={fontSize:9.5,color:"#6b7280",lineHeight:1.65,marginTop:3,whiteSpace:"pre-line" as const};

  const EBlock=({children}:{children:React.ReactNode})=><div style={{marginBottom:9}}>{children}</div>;
  const ERow=({l,r}:{l:React.ReactNode;r:string})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
      <div style={{flex:1,minWidth:0}}>{l}</div>
      {r&&<span style={{...metaStyle,whiteSpace:"nowrap",flexShrink:0}}>{r}</span>}
    </div>
  );

  const ContactRow=({tc="dark"}:{tc?:"dark"|"muted"|"white"|"centered"})=>{
    const textColor=tc==="white"?"rgba(255,255,255,0.8)":tc==="muted"?"#9ca3af":"#6b7280";
    const ic={marginRight:3,fontSize:7.5} as React.CSSProperties;
    return(
      <div style={{display:"flex",flexWrap:"wrap",gap:"0 14px",marginTop:7,justifyContent:tc==="centered"?"center":"flex-start"}}>
        {data.contact.email&&<span style={{fontSize:8.5,color:textColor}}><i className="fa-solid fa-envelope" style={ic}/>{data.contact.email}</span>}
        {data.contact.phone&&<span style={{fontSize:8.5,color:textColor}}><i className="fa-solid fa-phone" style={ic}/>{data.contact.phone}</span>}
        {data.contact.city&&<span style={{fontSize:8.5,color:textColor}}><i className="fa-solid fa-location-dot" style={ic}/>{data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</span>}
        {data.contact.linkedin&&<span style={{fontSize:8.5,color:textColor}}><i className="fa-brands fa-linkedin" style={ic}/>{data.contact.linkedin}</span>}
        {data.contact.website&&<span style={{fontSize:8.5,color:textColor}}><i className="fa-solid fa-globe" style={ic}/>{data.contact.website}</span>}
      </div>
    );
  };

  // ─── GROUPED SKILLS BLOCK ─────────────────────────────────────────────────
  // Renders: "Languages: JavaScript, TypeScript, Python"
  const SkillsBlock=({variant="accent"}:{variant?:SecVariant})=>{
    const groups=data.skillGroups.filter(g=>g.heading&&g.skills.trim());
    if(!groups.length) return null;
    const isWhite=variant==="white";
    return(
      <div style={{marginBottom:14}}>
        <SecTitle t="Skills" variant={variant}/>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:2}}>
          {groups.map(g=>{
            const chips=g.skills.split(",").map(s=>s.trim()).filter(Boolean);
            return(
              <div key={g.id} style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"baseline",fontSize:9.5,lineHeight:1.7}}>
                <span style={{fontWeight:700,color:isWhite?"rgba(255,255,255,0.9)":c.p,flexShrink:0,whiteSpace:"nowrap"}}>{g.heading}:</span>
                <span style={{color:isWhite?"rgba(255,255,255,0.7)":"#6b7280"}}>{chips.join(", ")}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Infographic variant: visual bars using skill.level or fallback %
  const SkillsBarsBlock=()=>{
    const groups=data.skillGroups.filter(g=>g.heading&&g.skills.trim());
    if(!groups.length) return null;
    let idx=0;
    return(
      <div style={{marginBottom:14}}>
        <SecTitle t="Core Competencies"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))",gap:"6px 20px",marginTop:4}}>
          {groups.flatMap(g=>
            g.skills.split(",").map(s=>s.trim()).filter(Boolean).map(sk=>{
              const pct=Math.max(60,70+(idx++%4)*8);
              return(
                <div key={g.id+sk}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:"clamp(8px,1.5vw,9.5px)",fontWeight:600,color:"#374151"}}>{sk}</span>
                    <span style={{fontSize:"clamp(7px,1.5vw,8px)",color:"#9ca3af"}}>{pct}%</span>
                  </div>
                  <div style={{height:5,background:c.b,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:c.p,borderRadius:3}}/>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Centered pills variant
  const SkillsCenteredBlock=()=>{
    const groups=data.skillGroups.filter(g=>g.heading&&g.skills.trim());
    if(!groups.length) return null;
    return(
      <div style={{marginBottom:14}}>
        <SecTitle t="Skills" variant="centered"/>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:4}}>
          {groups.map(g=>{
            const chips=g.skills.split(",").map(s=>s.trim()).filter(Boolean);
            return(
              <div key={g.id} style={{textAlign:"center"}}>
                <span style={{fontSize:8,fontWeight:800,color:c.p,textTransform:"uppercase" as const,letterSpacing:"0.1em",marginRight:6}}>{g.heading}:</span>
                <span style={{fontSize:9.5,color:"#6b7280"}}>{chips.join(", ")}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Grid card variant — chips in a card per group
  const SkillsGridBlock=()=>{
    const groups=data.skillGroups.filter(g=>g.heading&&g.skills.trim());
    if(!groups.length) return null;
    return(
      <div style={{background:"#f9fafb",border:`1px solid ${c.b}`,borderRadius:8,padding:"12px"}}>
        <SecTitle t="Skills" variant="dot"/>
        {groups.map(g=>{
          const chips=g.skills.split(",").map(s=>s.trim()).filter(Boolean);
          return(
            <div key={g.id} style={{marginBottom:8}}>
              <div style={{fontSize:8.5,fontWeight:700,color:c.p,marginBottom:3}}>{g.heading}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                {chips.map(sk=>(
                  <span key={sk} style={{background:c.tag,color:c.tagT,border:`1px solid ${c.b}`,borderRadius:4,padding:"1px 7px",fontSize:8.5,fontWeight:600}}>{sk}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const SummaryBlock=({variant="accent",label}:{variant?:SecVariant;label?:string})=>!data.summary?null:(
    <div style={{marginBottom:14}}>
      <SecTitle t={label||"Professional Summary"} variant={variant}/>
      <p style={{...bodyStyle,marginTop:0,textAlign:variant==="centered"?"center":"left"}}>{data.summary}</p>
    </div>
  );

  const ExpBlock=({variant="accent"}:{variant?:SecVariant})=>!data.experience.length?null:(
    <div style={{marginBottom:14}}>
      <SecTitle t="Professional Experience" variant={variant}/>
      {data.experience.map(exp=>(
        <EBlock key={exp.id}>
          <ERow l={<span style={{...titleStyle,color:variant==="white"?"#fff":titleStyle.color}}>{exp.position||"Position"}</span>} r={ds(exp)}/>
          <div style={{...subtitleStyle,color:variant==="white"?"rgba(255,255,255,0.7)":subtitleStyle.color}}>{exp.company}</div>
          {exp.description&&<div style={{...bodyStyle,color:variant==="white"?"rgba(255,255,255,0.6)":bodyStyle.color}}>{exp.description}</div>}
        </EBlock>
      ))}
    </div>
  );

  const EduBlock=({variant="accent"}:{variant?:SecVariant})=>!data.education.length?null:(
    <div style={{marginBottom:14}}>
      <SecTitle t="Education" variant={variant}/>
      {data.education.map(edu=>(
        <EBlock key={edu.id}>
          <ERow l={<span style={{...titleStyle,color:variant==="white"?"#fff":titleStyle.color}}>{edu.degree}{edu.field?` in ${edu.field}`:""}</span>} r={ds(edu)}/>
          <div style={{...subtitleStyle,color:variant==="white"?"rgba(255,255,255,0.7)":subtitleStyle.color}}>{edu.institution}</div>
          {edu.grade&&<div style={{...metaStyle,color:variant==="white"?"rgba(255,255,255,0.5)":metaStyle.color}}>Grade: {edu.grade}</div>}
        </EBlock>
      ))}
    </div>
  );

  const ProjectsBlock=({variant="accent"}:{variant?:SecVariant})=>!data.projects.length?null:(
    <div style={{marginBottom:14}}>
      <SecTitle t="Projects" variant={variant}/>
      {data.projects.map(p=>(
        <EBlock key={p.id}>
          <div style={{display:"flex",alignItems:"baseline",gap:7}}>
            <span style={{...titleStyle,color:variant==="white"?"#fff":titleStyle.color}}>{p.title||"Project"}</span>
            {p.link&&<a href={p.link} target="_blank" rel="noreferrer" style={{fontSize:8.5,color:variant==="white"?"rgba(255,255,255,0.6)":c.p,textDecoration:"none",fontWeight:600}}>↗ Link</a>}
          </div>
          {p.description&&<div style={{...bodyStyle,color:variant==="white"?"rgba(255,255,255,0.6)":bodyStyle.color}}>{p.description}</div>}
        </EBlock>
      ))}
    </div>
  );

  const CertsBlock=({variant="accent"}:{variant?:SecVariant})=>!data.certs.length?null:(
    <div style={{marginBottom:14}}>
      <SecTitle t="Certifications" variant={variant}/>
      {data.certs.map(cert=>(
        <div key={cert.id} style={{display:"flex",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:4}}>
          <span style={{...subtitleStyle,fontSize:9.5,color:variant==="white"?"rgba(255,255,255,0.85)":subtitleStyle.color}}>{cert.name}</span>
          <span style={{...metaStyle,color:variant==="white"?"rgba(255,255,255,0.5)":metaStyle.color}}>{cert.issuer}{cert.year?` · ${cert.year}`:""}</span>
        </div>
      ))}
    </div>
  );

  const CustomBlocks=({variant="accent"}:{variant?:SecVariant})=>(
    <>{data.custom.filter(cx=>cx.heading).map(cx=>(
      <div key={cx.id} style={{marginBottom:14}}>
        <SecTitle t={cx.heading} variant={variant}/>
        <p style={{...bodyStyle,marginTop:0,color:variant==="white"?"rgba(255,255,255,0.6)":bodyStyle.color}}>{cx.content}</p>
      </div>
    ))}</>
  );

  const name=fn(data);
  const pad="clamp(18px,4vw,32px) clamp(18px,4vw,38px) clamp(20px,4vw,36px)";
  const padN="0 clamp(18px,4vw,38px) clamp(20px,4vw,36px)";

  // ══════════════════════════════════════════════════════════════
  // ALL 18 TEMPLATES
  // ══════════════════════════════════════════════════════════════

  if(template==="chronological") return (
    <div style={{fontFamily:"Georgia,serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",padding:pad}}>
      <div style={{borderBottom:`2px solid ${c.b}`,paddingBottom:12,marginBottom:4}}>
        <div style={{fontSize:"clamp(16px,4vw,24px)",fontWeight:800,color:"#111827",letterSpacing:-0.3}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,fontWeight:700,marginTop:3}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="muted"/>
      </div>
      <SummaryBlock variant="serif-accent"/><ExpBlock variant="serif-accent"/><EduBlock variant="serif-accent"/>
      <SkillsBlock variant="serif-accent"/><CertsBlock variant="serif-accent"/><ProjectsBlock variant="serif-accent"/><CustomBlocks variant="serif-accent"/>
    </div>
  );

  if(template==="functional") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",padding:pad}}>
      <div style={{borderBottom:`2px solid ${c.b}`,paddingBottom:12,marginBottom:4}}>
        <div style={{fontSize:"clamp(16px,4vw,22px)",fontWeight:800,color:"#111827"}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,fontWeight:700,marginTop:3}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="muted"/>
      </div>
      <SkillsBlock/><SummaryBlock label="Professional Profile"/>
      <ExpBlock/><EduBlock/><CertsBlock/><ProjectsBlock/><CustomBlocks/>
    </div>
  );

  if(template==="combination") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",padding:pad}}>
      <div style={{borderBottom:`2px solid ${c.b}`,paddingBottom:12,marginBottom:4}}>
        <div style={{fontSize:"clamp(16px,4vw,22px)",fontWeight:800,color:"#111827"}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,fontWeight:700,marginTop:3}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="muted"/>
      </div>
      <SummaryBlock/>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)",gap:22,marginTop:4}}>
        <div><ExpBlock/><ProjectsBlock/><CustomBlocks/></div>
        <div style={{borderLeft:`1.5px solid ${c.b}`,paddingLeft:18}}>
          <SkillsBlock variant="dot"/><EduBlock variant="dot"/><CertsBlock variant="dot"/>
        </div>
      </div>
    </div>
  );

  if(template==="executive") return (
    <div style={{fontFamily:"Georgia,serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",padding:pad}}>
      <div style={{borderBottom:`2px solid ${c.b}`,paddingBottom:14,marginBottom:4}}>
        <div style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,color:"#111827",letterSpacing:-0.5}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9.5px,2vw,11.5px)",color:c.p,fontWeight:700,marginTop:4}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="muted"/>
      </div>
      {data.summary&&<p style={{fontSize:"clamp(9px,2vw,11px)",color:"#374151",lineHeight:1.7,fontStyle:"italic",marginTop:14,marginBottom:0}}>{data.summary}</p>}
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)",gap:22,marginTop:4}}>
        <div><ExpBlock variant="serif-accent"/><ProjectsBlock variant="serif-accent"/><CustomBlocks variant="serif-accent"/></div>
        <div style={{borderLeft:`1.5px solid ${c.b}`,paddingLeft:18}}>
          <EduBlock variant="dark-serif"/><SkillsBlock variant="dark-serif"/><CertsBlock variant="dark-serif"/>
        </div>
      </div>
    </div>
  );

  if(template==="modern") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151"}}>
      <div style={{background:c.l,padding:"clamp(16px,3vw,26px) clamp(18px,4vw,38px) clamp(14px,3vw,22px)",borderBottom:`2px solid ${c.b}`}}>
        <div style={{fontSize:"clamp(16px,4vw,24px)",fontWeight:800,color:"#111827",letterSpacing:-0.3}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,fontWeight:700,marginTop:3}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="muted"/>
      </div>
      <div style={{padding:padN}}>
        <SummaryBlock/><ExpBlock/><EduBlock/><SkillsBlock/><ProjectsBlock/><CertsBlock/><CustomBlocks/>
      </div>
    </div>
  );

  if(template==="minimal") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",padding:pad}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:"clamp(14px,4vw,22px)",fontWeight:300,color:"#111827",letterSpacing:1.5,textTransform:"uppercase"}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(8.5px,2vw,10.5px)",color:c.p,marginTop:4,fontWeight:600,letterSpacing:0.5}}>{data.contact.jobTitle}</div>}
        <div style={{height:1,background:c.b,margin:"10px 0"}}/><ContactRow tc="muted"/>
      </div>
      <SummaryBlock variant="dot"/><ExpBlock variant="dot"/><EduBlock variant="dot"/>
      <SkillsBlock variant="dot"/><ProjectsBlock variant="dot"/><CertsBlock variant="dot"/><CustomBlocks variant="dot"/>
    </div>
  );

  if(template==="compact") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(8.5px,2vw,10.5px)",color:"#374151",padding:"clamp(16px,3vw,24px) clamp(16px,3.5vw,34px) clamp(18px,3vw,28px)",lineHeight:1.35}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:`1.5px solid ${c.b}`,paddingBottom:8,marginBottom:4,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:"clamp(14px,4vw,20px)",fontWeight:800,color:"#111827"}}>{name}</div>
          {data.contact.jobTitle&&<div style={{fontSize:"clamp(8px,2vw,10px)",color:c.p,fontWeight:700,marginTop:2}}>{data.contact.jobTitle}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          {data.contact.email&&<div style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"#6b7280"}}>{data.contact.email}</div>}
          {data.contact.phone&&<div style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"#6b7280"}}>{data.contact.phone}</div>}
          {data.contact.city&&<div style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"#6b7280"}}>{data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</div>}
        </div>
      </div>
      <SummaryBlock/><ExpBlock/><EduBlock/><SkillsBlock/><ProjectsBlock/><CertsBlock/><CustomBlocks/>
    </div>
  );

  if(template==="elegant") return (
    <div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"clamp(9.5px,2vw,11.5px)",color:"#374151",padding:pad}}>
      <div style={{borderLeft:`4px solid ${c.p}`,paddingLeft:16,marginBottom:16}}>
        <div style={{fontSize:"clamp(16px,4vw,24px)",fontWeight:900,color:"#111827",letterSpacing:0.5}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,marginTop:4,fontWeight:700}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="muted"/>
      </div>
      <SummaryBlock variant="serif-accent"/><ExpBlock variant="serif-accent"/><EduBlock variant="serif-accent"/>
      <SkillsBlock variant="serif-accent"/><ProjectsBlock variant="serif-accent"/><CertsBlock variant="serif-accent"/><CustomBlocks variant="serif-accent"/>
    </div>
  );

  if(template==="classic") return (
    <div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",padding:pad}}>
      <div style={{textAlign:"center",borderBottom:`1.5px solid ${c.b}`,paddingBottom:14,marginBottom:4}}>
        <div style={{fontSize:"clamp(15px,4vw,22px)",fontWeight:900,color:"#111827",letterSpacing:2,textTransform:"uppercase"}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,marginTop:4,fontWeight:700}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="muted"/>
      </div>
      <SummaryBlock variant="dark-serif" label="Research Profile"/>
      <EduBlock variant="dark-serif"/><ExpBlock variant="dark-serif"/>
      <SkillsBlock variant="dark-serif"/>
      <ProjectsBlock variant="dark-serif"/><CertsBlock variant="dark-serif"/><CustomBlocks variant="dark-serif"/>
    </div>
  );

  if(template==="tech") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151"}}>
      <div style={{background:c.l,padding:"clamp(14px,3vw,24px) clamp(18px,4vw,38px) clamp(12px,3vw,18px)",borderBottom:`2px solid ${c.b}`}}>
        <div style={{fontSize:"clamp(15px,4vw,22px)",fontWeight:800,color:"#111827"}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,fontWeight:700,marginTop:3}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="muted"/>
      </div>
      <div style={{padding:padN}}>
        <SkillsBlock/><SummaryBlock label="About"/>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)",gap:22}}>
          <div><ExpBlock/><ProjectsBlock/></div>
          <div style={{borderLeft:`1.5px solid ${c.b}`,paddingLeft:18}}>
            <EduBlock variant="dot"/><CertsBlock variant="dot"/><CustomBlocks variant="dot"/>
          </div>
        </div>
      </div>
    </div>
  );

  if(template==="colorband") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151"}}>
      <div style={{background:c.p,padding:"clamp(18px,3.5vw,28px) clamp(18px,4vw,38px) clamp(14px,3vw,24px)"}}>
        <div style={{fontSize:"clamp(16px,4vw,26px)",fontWeight:800,color:"#fff",letterSpacing:-0.5}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:"rgba(255,255,255,0.85)",fontWeight:600,marginTop:4}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="white"/>
      </div>
      <div style={{height:4,background:c.d}}/>
      <div style={{padding:padN}}>
        <SummaryBlock/><ExpBlock/><EduBlock/><SkillsBlock/><ProjectsBlock/><CertsBlock/><CustomBlocks/>
      </div>
    </div>
  );

  if(template==="gradient") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151"}}>
      <div style={{background:`linear-gradient(135deg, ${c.p} 0%, ${c.d} 100%)`,padding:"clamp(18px,4vw,30px) clamp(18px,4vw,38px) clamp(14px,3vw,26px)"}}>
        <div style={{fontSize:"clamp(16px,4vw,26px)",fontWeight:800,color:"#fff",letterSpacing:-0.5}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:"rgba(255,255,255,0.9)",fontWeight:600,marginTop:4,letterSpacing:0.5}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="white"/>
      </div>
      <div style={{background:c.l,padding:"8px clamp(18px,4vw,38px)",borderBottom:`1.5px solid ${c.b}`}}>
        <div style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:c.d,fontWeight:600,letterSpacing:"0.08em",display:"flex",flexWrap:"wrap",gap:"0 12px"}}>
          {data.contact.city&&<span><i className="fa-solid fa-location-dot" style={{marginRight:4}}/>{data.contact.city}</span>}
          {data.contact.linkedin&&<span><i className="fa-brands fa-linkedin" style={{marginRight:4}}/>{data.contact.linkedin}</span>}
          {data.contact.website&&<span><i className="fa-solid fa-globe" style={{marginRight:4}}/>{data.contact.website}</span>}
        </div>
      </div>
      <div style={{padding:padN}}>
        <SummaryBlock variant="dot"/><ExpBlock variant="dot"/><EduBlock variant="dot"/>
        <SkillsBlock variant="dot"/><ProjectsBlock variant="dot"/><CertsBlock variant="dot"/><CustomBlocks variant="dot"/>
      </div>
    </div>
  );

  if(template==="vivid") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151"}}>
      <div style={{display:"flex"}}>
        <div style={{background:c.p,width:"clamp(6px,1.5vw,10px)",minHeight:130,flexShrink:0}}/>
        <div style={{flex:1,padding:"clamp(16px,3vw,26px) clamp(18px,4vw,38px) clamp(14px,3vw,22px)",borderBottom:`2px solid ${c.b}`}}>
          <div style={{fontSize:"clamp(18px,4.5vw,28px)",fontWeight:900,color:"#111827",letterSpacing:-0.5,lineHeight:1}}>{name}</div>
          {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,fontWeight:800,marginTop:6,textTransform:"uppercase",letterSpacing:1}}>{data.contact.jobTitle}</div>}
          <div style={{height:3,background:c.l,margin:"10px 0",borderRadius:2}}/><ContactRow tc="muted"/>
        </div>
      </div>
      <div style={{padding:padN}}>
        <SummaryBlock/><ExpBlock/><EduBlock/><SkillsBlock/><ProjectsBlock/><CertsBlock/><CustomBlocks/>
      </div>
    </div>
  );

  // ─── CENTERED ──────────────────────────────────────────────────────────────
  if(template==="centered") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",padding:pad}}>
      <div style={{textAlign:"center",borderBottom:`2px solid ${c.b}`,paddingBottom:16,marginBottom:4}}>
        <div style={{fontSize:"clamp(18px,5vw,28px)",fontWeight:900,color:"#111827",letterSpacing:2,textTransform:"uppercase",display:"inline-block",borderBottom:`3px solid ${c.p}`,paddingBottom:6,marginBottom:8}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,fontWeight:700,marginTop:4,letterSpacing:1,textTransform:"uppercase"}}>{data.contact.jobTitle}</div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:"4px 8px",marginTop:12,justifyContent:"center"}}>
          {data.contact.email&&<span style={{background:c.l,color:c.d,border:`1px solid ${c.b}`,borderRadius:20,padding:"2px 10px",fontSize:"clamp(7px,1.5vw,8.5px)",fontWeight:600}}><i className="fa-solid fa-envelope" style={{marginRight:4,fontSize:7}}/>{data.contact.email}</span>}
          {data.contact.phone&&<span style={{background:c.l,color:c.d,border:`1px solid ${c.b}`,borderRadius:20,padding:"2px 10px",fontSize:"clamp(7px,1.5vw,8.5px)",fontWeight:600}}><i className="fa-solid fa-phone" style={{marginRight:4,fontSize:7}}/>{data.contact.phone}</span>}
          {data.contact.city&&<span style={{background:c.l,color:c.d,border:`1px solid ${c.b}`,borderRadius:20,padding:"2px 10px",fontSize:"clamp(7px,1.5vw,8.5px)",fontWeight:600}}><i className="fa-solid fa-location-dot" style={{marginRight:4,fontSize:7}}/>{data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</span>}
          {data.contact.linkedin&&<span style={{background:c.l,color:c.d,border:`1px solid ${c.b}`,borderRadius:20,padding:"2px 10px",fontSize:"clamp(7px,1.5vw,8.5px)",fontWeight:600}}><i className="fa-brands fa-linkedin" style={{marginRight:4,fontSize:7}}/>{data.contact.linkedin}</span>}
        </div>
      </div>
      {data.summary&&<div style={{marginBottom:14}}>
        <SecTitle t="Profile" variant="centered"/>
        <p style={{...bodyStyle,textAlign:"center",maxWidth:"80%",margin:"0 auto",fontSize:"clamp(9px,2vw,10.5px)"}}>{data.summary}</p>
      </div>}
      <SkillsCenteredBlock/>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:"0 28px"}}>
        <div><ExpBlock/><ProjectsBlock/><CustomBlocks/></div>
        <div style={{borderLeft:`2px solid ${c.b}`,paddingLeft:22}}><EduBlock/><CertsBlock/></div>
      </div>
    </div>
  );

  // ─── GRID ──────────────────────────────────────────────────────────────────
  if(template==="grid") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151"}}>
      <div style={{background:c.p,padding:"clamp(16px,3vw,24px) clamp(18px,4vw,38px) clamp(14px,3vw,20px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:"clamp(16px,4vw,24px)",fontWeight:900,color:"#fff",letterSpacing:-0.3}}>{name}</div>
            {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,10.5px)",color:"rgba(255,255,255,0.85)",fontWeight:600,marginTop:4}}>{data.contact.jobTitle}</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
            {data.contact.email&&<span style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.8)"}}>{data.contact.email}</span>}
            {data.contact.phone&&<span style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.8)"}}>{data.contact.phone}</span>}
            {data.contact.city&&<span style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.8)"}}>{data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</span>}
          </div>
        </div>
      </div>
      <div style={{height:4,background:c.d}}/>
      <div style={{padding:padN}}>
        {data.summary&&<div style={{marginBottom:14}}><SecTitle t="Summary"/><p style={{...bodyStyle,marginTop:0}}>{data.summary}</p></div>}
        {data.experience.length>0&&<div style={{marginBottom:14}}>
          <SecTitle t="Professional Experience"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,220px),1fr))",gap:8,marginTop:4}}>
            {data.experience.map(exp=>(
              <div key={exp.id} style={{background:c.l,border:`1px solid ${c.b}`,borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${c.p}`}}>
                <div style={{...titleStyle,fontSize:"clamp(9px,2vw,10.5px)",color:c.d}}>{exp.position||"Position"}</div>
                <div style={{...subtitleStyle,fontSize:9}}>{exp.company}</div>
                <div style={{...metaStyle,fontSize:8,marginTop:2}}>{ds(exp)}</div>
                {exp.description&&<div style={{...bodyStyle,fontSize:"clamp(7.5px,1.5vw,9px)",marginTop:4,lineHeight:1.5}}>{exp.description.slice(0,120)}{exp.description.length>120?"…":""}</div>}
              </div>
            ))}
          </div>
        </div>}
        {data.education.length>0&&<div style={{marginBottom:14}}>
          <SecTitle t="Education"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,220px),1fr))",gap:8,marginTop:4}}>
            {data.education.map(edu=>(
              <div key={edu.id} style={{background:"#f9fafb",border:`1px solid ${c.b}`,borderRadius:8,padding:"10px 12px",borderTop:`3px solid ${c.p}`}}>
                <div style={{...titleStyle,fontSize:"clamp(9px,2vw,10.5px)"}}>{edu.degree}{edu.field?` in ${edu.field}`:""}</div>
                <div style={subtitleStyle}>{edu.institution}</div>
                <div style={metaStyle}>{ds(edu)}</div>
              </div>
            ))}
          </div>
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",gap:12,marginTop:4}}>
          <SkillsGridBlock/>
          {data.certs.length>0&&(
            <div style={{background:"#f9fafb",border:`1px solid ${c.b}`,borderRadius:8,padding:"12px"}}>
              <SecTitle t="Certifications" variant="dot"/>
              {data.certs.map(cert=>(
                <div key={cert.id} style={{marginBottom:6}}>
                  <div style={{...subtitleStyle,fontSize:9}}>{cert.name}</div>
                  <div style={metaStyle}>{cert.issuer}{cert.year?` · ${cert.year}`:""}</div>
                </div>
              ))}
            </div>
          )}
          {data.projects.length>0&&(
            <div style={{background:"#f9fafb",border:`1px solid ${c.b}`,borderRadius:8,padding:"12px"}}>
              <SecTitle t="Projects" variant="dot"/>
              {data.projects.map(p=>(
                <div key={p.id} style={{marginBottom:6}}>
                  <div style={{...subtitleStyle,fontSize:9}}>{p.title}</div>
                  {p.description&&<div style={{...bodyStyle,fontSize:8.5,lineHeight:1.5}}>{p.description.slice(0,80)}{p.description.length>80?"…":""}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
        <CustomBlocks/>
      </div>
    </div>
  );

  // ─── SIDEBAR ───────────────────────────────────────────────────────────────
  if(template==="sidebar") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",display:"flex",minHeight:"100%"}}>
      <div style={{width:"clamp(140px,30%,200px)",flexShrink:0,background:c.d,color:"#fff",padding:"clamp(20px,3vw,30px) clamp(14px,2.5vw,22px)",display:"flex",flexDirection:"column",gap:0}}>
        <div style={{width:"clamp(48px,8vw,68px)",height:"clamp(48px,8vw,68px)",borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(16px,3vw,24px)",fontWeight:800,color:"#fff",marginBottom:14,flexShrink:0}}>
          {data.contact.firstName?.[0]||"?"}
        </div>
        <div style={{fontSize:"clamp(12px,3vw,18px)",fontWeight:800,color:"#fff",lineHeight:1.2,marginBottom:4}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(7.5px,1.5vw,9.5px)",color:"rgba(255,255,255,0.7)",fontWeight:600,marginBottom:14,textTransform:"uppercase",letterSpacing:0.8}}>{data.contact.jobTitle}</div>}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.15)",paddingTop:12,marginBottom:14}}>
          {data.contact.email&&<div style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.7)",marginBottom:5,wordBreak:"break-all"}}><i className="fa-solid fa-envelope" style={{marginRight:5,fontSize:7,color:"rgba(255,255,255,0.5)"}}/>{data.contact.email}</div>}
          {data.contact.phone&&<div style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.7)",marginBottom:5}}><i className="fa-solid fa-phone" style={{marginRight:5,fontSize:7,color:"rgba(255,255,255,0.5)"}}/>{data.contact.phone}</div>}
          {data.contact.city&&<div style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.7)",marginBottom:5}}><i className="fa-solid fa-location-dot" style={{marginRight:5,fontSize:7,color:"rgba(255,255,255,0.5)"}}/>{data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</div>}
          {data.contact.linkedin&&<div style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.7)",marginBottom:5,wordBreak:"break-all"}}><i className="fa-brands fa-linkedin" style={{marginRight:5,fontSize:7,color:"rgba(255,255,255,0.5)"}}/>{data.contact.linkedin}</div>}
        </div>
        <SkillsBlock variant="white"/>
        <CertsBlock variant="white"/>
        <CustomBlocks variant="white"/>
      </div>
      <div style={{flex:1,padding:"clamp(20px,3vw,30px) clamp(16px,3vw,28px)",overflowX:"hidden"}}>
        {data.summary&&<div style={{marginBottom:14}}><SecTitle t="About Me"/><p style={{...bodyStyle,marginTop:0}}>{data.summary}</p></div>}
        <ExpBlock/><EduBlock/><ProjectsBlock/>
      </div>
    </div>
  );

  // ─── INFOGRAPHIC ───────────────────────────────────────────────────────────
  if(template==="infographic") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151"}}>
      <div style={{background:`linear-gradient(120deg, ${c.d} 0%, ${c.p} 60%, ${c.b} 100%)`,padding:"clamp(20px,4vw,34px) clamp(18px,4vw,40px) clamp(16px,3vw,26px)"}}>
        <div style={{fontSize:"clamp(20px,5vw,32px)",fontWeight:900,color:"#fff",letterSpacing:-0.5,lineHeight:1}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11.5px)",color:"rgba(255,255,255,0.9)",fontWeight:700,marginTop:6,textTransform:"uppercase",letterSpacing:1.5}}>{data.contact.jobTitle}</div>}
        <div style={{height:2,background:"rgba(255,255,255,0.25)",margin:"12px 0 10px"}}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:"4px 20px"}}>
          {data.contact.email&&<span style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.8)"}}><i className="fa-solid fa-envelope" style={{marginRight:5}}/>{data.contact.email}</span>}
          {data.contact.phone&&<span style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.8)"}}><i className="fa-solid fa-phone" style={{marginRight:5}}/>{data.contact.phone}</span>}
          {data.contact.city&&<span style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.8)"}}><i className="fa-solid fa-location-dot" style={{marginRight:5}}/>{data.contact.city}{data.contact.country?`, ${data.contact.country}`:""}</span>}
          {data.contact.linkedin&&<span style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"rgba(255,255,255,0.8)"}}><i className="fa-brands fa-linkedin" style={{marginRight:5}}/>{data.contact.linkedin}</span>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,100px),1fr))",gap:0,borderBottom:`2px solid ${c.b}`}}>
        {[
          {icon:"fa-solid fa-briefcase",label:"Experience",val:`${data.experience.length} roles`},
          {icon:"fa-solid fa-graduation-cap",label:"Education",val:`${data.education.length} degrees`},
          {icon:"fa-solid fa-code",label:"Skills",val:`${data.skillGroups.reduce((n,g)=>n+g.skills.split(",").filter(s=>s.trim()).length,0)} skills`},
          {icon:"fa-solid fa-certificate",label:"Certs",val:`${data.certs.length} certs`},
        ].map((stat,i)=>(
          <div key={i} style={{textAlign:"center",padding:"12px 6px",borderRight:`1px solid ${c.b}`,background:i%2===0?"#fff":c.l}}>
            <div style={{fontSize:"clamp(14px,3vw,20px)",color:c.p,marginBottom:4}}><i className={stat.icon}/></div>
            <div style={{fontSize:"clamp(9px,2vw,11px)",fontWeight:800,color:"#111827"}}>{stat.val}</div>
            <div style={{fontSize:"clamp(7px,1.5vw,8.5px)",color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.5}}>{stat.label}</div>
          </div>
        ))}
      </div>
      <div style={{padding:padN}}>
        {data.summary&&<div style={{marginBottom:14}}><SecTitle t="Profile"/><p style={{...bodyStyle,marginTop:0}}>{data.summary}</p></div>}
        <SkillsBarsBlock/>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,3fr) minmax(0,2fr)",gap:"0 24px"}}>
          <div><ExpBlock/><ProjectsBlock/></div>
          <div><EduBlock/><CertsBlock/></div>
        </div>
        <CustomBlocks/>
      </div>
    </div>
  );

  // ─── TIMELINE ──────────────────────────────────────────────────────────────
  if(template==="timeline") return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",padding:pad}}>
      <div style={{borderBottom:`2px solid ${c.b}`,paddingBottom:14,marginBottom:4}}>
        <div style={{fontSize:"clamp(16px,4.5vw,26px)",fontWeight:900,color:"#111827",letterSpacing:-0.3}}>{name}</div>
        {data.contact.jobTitle&&<div style={{fontSize:"clamp(9px,2vw,11px)",color:c.p,fontWeight:700,marginTop:3,textTransform:"uppercase",letterSpacing:0.8}}>{data.contact.jobTitle}</div>}
        <ContactRow tc="muted"/>
      </div>
      {data.summary&&<div style={{marginBottom:14}}><SecTitle t="Summary"/><p style={{...bodyStyle,marginTop:0}}>{data.summary}</p></div>}
      {data.experience.length>0&&<div style={{marginBottom:14}}>
        <SecTitle t="Career Timeline"/>
        <div style={{position:"relative",marginTop:8,paddingLeft:"clamp(22px,5vw,36px)"}}>
          <div style={{position:"absolute",left:"clamp(7px,1.5vw,12px)",top:6,bottom:6,width:2,background:`linear-gradient(to bottom, ${c.p}, ${c.b})`,borderRadius:1}}/>
          {data.experience.map((exp,i)=>(
            <div key={exp.id} style={{position:"relative",marginBottom:i<data.experience.length-1?14:0}}>
              <div style={{position:"absolute",left:"clamp(-18px,-4vw,-24px)",top:3,width:"clamp(8px,1.5vw,12px)",height:"clamp(8px,1.5vw,12px)",borderRadius:"50%",background:i===0?c.p:"#fff",border:`2px solid ${c.p}`,boxSizing:"border-box" as const,flexShrink:0}}/>
              <div style={{background:i===0?c.l:"#f9fafb",border:`1px solid ${i===0?c.b:"#e5e7eb"}`,borderLeft:`3px solid ${c.p}`,borderRadius:8,padding:"8px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:"2px 8px"}}>
                  <span style={{...titleStyle,fontSize:"clamp(9px,2vw,10.5px)",color:i===0?c.d:titleStyle.color}}>{exp.position||"Position"}</span>
                  <span style={{...metaStyle,fontSize:"clamp(7px,1.5vw,8px)"}}>{ds(exp)}</span>
                </div>
                <div style={{...subtitleStyle,fontSize:"clamp(8px,1.5vw,9px)",marginTop:1}}>{exp.company}</div>
                {exp.description&&<div style={{...bodyStyle,fontSize:"clamp(8px,1.5vw,9px)",marginTop:4,lineHeight:1.5}}>{exp.description}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>}
      {data.education.length>0&&<div style={{marginBottom:14}}>
        <SecTitle t="Education"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,200px),1fr))",gap:8,marginTop:6}}>
          {data.education.map(edu=>(
            <div key={edu.id} style={{background:c.l,border:`1px solid ${c.b}`,borderRadius:8,padding:"10px 14px",borderTop:`3px solid ${c.p}`}}>
              <div style={{...titleStyle,fontSize:"clamp(9px,2vw,10px)"}}>{edu.degree}{edu.field?` in ${edu.field}`:""}</div>
              <div style={subtitleStyle}>{edu.institution}</div>
              <div style={metaStyle}>{ds(edu)}{edu.grade?` · ${edu.grade}`:""}</div>
            </div>
          ))}
        </div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:"0 24px"}}>
        <div><SkillsBlock/><ProjectsBlock/></div>
        <div><CertsBlock/><CustomBlocks/></div>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Helvetica Neue',sans-serif",fontSize:"clamp(9px,2vw,11px)",color:"#374151",padding:pad}}>
      <div style={{fontSize:"clamp(16px,4vw,22px)",fontWeight:800,color:"#111827",marginBottom:8}}>{name}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ResumeFullPreview
// ═══════════════════════════════════════════════════════════════
export function ResumeFullPreview({data,template:initT="chronological",color:initC="blue"}:{data:ResumeData;template?:TemplateName;color?:ColorName}) {
  const [template,setTemplate]=useState<TemplateName>(initT);
  const [color,setColor]=useState<ColorName>(initC);
  const [tmplOpen,setTmplOpen]=useState(false);
  const [clrOpen,setClrOpen]=useState(false);
  const c=HC[color];
  const ResumeBody=()=><>{useTemplateRender(data,template,color)}</>;
  const atsTemplates=(Object.keys(TEMPLATE_META) as TemplateName[]).filter(t=>!TEMPLATE_META[t].colorful);
  const colorTemplates=(Object.keys(TEMPLATE_META) as TemplateName[]).filter(t=>!!TEMPLATE_META[t].colorful);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
      <style>{`
        @media print{.no-print{display:none!important}body{margin:0;background:#fff}.a4{box-shadow:none!important}}
        @page{size:A4;margin:0} *{box-sizing:border-box} body{margin:0;background:#dde3ea}
        .dd-row:hover{background:${c.l}!important}
        .toolbar-label{display:inline;} .toolbar-ats-badge{display:inline;} .center-info{display:flex;}
        @media(max-width:700px){.toolbar-label{display:none;}.toolbar-ats-badge{display:none;}.center-info{display:none;}}
        @media(max-width:900px){.center-info{display:none;}}
        .a4-wrapper{padding-top:70px;padding-bottom:48px;min-height:100vh;display:flex;justify-content:center;align-items:flex-start;background:#dde3ea;}
        .a4{width:794px;min-height:1123px;background:#fff;box-shadow:0 4px 40px rgba(0,0,0,0.15);border-radius:2px;overflow:hidden;}
        @media(max-width:860px){.a4-wrapper{padding-left:0;padding-right:0;}.a4{width:100%;min-height:auto;border-radius:0;}}
        @media(max-width:480px){.a4-wrapper{padding-top:58px;padding-bottom:24px;}}
        .dd-panel{position:absolute;top:46px;left:0;z-index:400;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.13);width:270px;padding:8px;max-height:80vh;overflow-y:auto;}
        .clr-panel{position:absolute;top:46px;left:0;z-index:400;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.13);width:200px;padding:8px;}
        @media(max-width:480px){.dd-panel{width:min(270px,90vw);left:-20px;}.clr-panel{width:min(200px,80vw);}}
      `}</style>

      <div className="no-print" style={{position:"fixed",top:0,left:0,right:0,zIndex:300,height:54,background:"#fff",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 12px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",fontFamily:"'Plus Jakarta Sans',sans-serif",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <a href="/builder" style={{display:"flex",alignItems:"center",gap:6,textDecoration:"none",background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:9,padding:"6px 10px",fontSize:12,fontWeight:700,color:"#374151",whiteSpace:"nowrap"}}>
            <i className="fa-solid fa-arrow-left" style={{fontSize:10,color:"#64748b"}}/><span className="toolbar-label">Back Editing</span>
          </a>
          <div style={{width:1,height:20,background:"#e5e7eb"}}/>
          <div style={{position:"relative"}}>
            <button onClick={()=>{setTmplOpen(o=>!o);setClrOpen(false);}} style={{display:"flex",alignItems:"center",gap:5,background:tmplOpen?"#f9fafb":"transparent",border:"1px solid #e5e7eb",borderRadius:9,padding:"6px 10px",fontSize:12,fontWeight:600,color:"#374151",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:"nowrap"}}>
              <i className={TEMPLATE_META[template].icon} style={{fontSize:10,color:tmplOpen?c.p:"#9ca3af"}}/>
              <span className="toolbar-label">{TEMPLATE_META[template].label}</span>
              <i className={`fa-solid ${tmplOpen?"fa-chevron-up":"fa-chevron-down"}`} style={{fontSize:8,color:"#9ca3af"}}/>
            </button>
            {tmplOpen&&(
              <div className="dd-panel">
                <div style={{fontSize:9.5,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.12em",padding:"4px 8px 4px"}}><i className="fa-solid fa-shield-check" style={{marginRight:5,color:"#22c55e"}}/>ATS-Friendly</div>
                {atsTemplates.map(t=>(
                  <button key={t} className="dd-row" onClick={()=>{setTemplate(t);setTmplOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 9px",background:template===t?c.l:"transparent",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    <i className={TEMPLATE_META[t].icon} style={{fontSize:11,color:template===t?c.p:"#9ca3af",width:14}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11.5,fontWeight:700,color:template===t?c.p:"#374151",display:"flex",alignItems:"center",gap:5}}>
                        {TEMPLATE_META[t].label}
                        {TEMPLATE_META[t].isNew&&<span style={{fontSize:8,fontWeight:800,color:"#fff",background:c.p,borderRadius:3,padding:"0px 4px"}}>NEW</span>}
                      </div>
                      <div style={{fontSize:9.5,color:"#9ca3af"}}>{TEMPLATE_META[t].desc}</div>
                    </div>
                    <span className="toolbar-ats-badge" style={{fontSize:9,fontWeight:700,color:"#22c55e",background:"#f0fdf4",padding:"1px 5px",borderRadius:4,whiteSpace:"nowrap"}}>{TEMPLATE_META[t].ats}%</span>
                    {template===t&&<i className="fa-solid fa-check" style={{fontSize:9,color:c.p}}/>}
                  </button>
                ))}
                <div style={{height:1,background:"#f3f4f6",margin:"6px 4px"}}/>
                <div style={{fontSize:9.5,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.12em",padding:"4px 8px 4px"}}><i className="fa-solid fa-palette" style={{marginRight:5,color:c.p}}/>Colorful</div>
                {colorTemplates.map(t=>(
                  <button key={t} className="dd-row" onClick={()=>{setTemplate(t);setTmplOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 9px",background:template===t?c.l:"transparent",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    <i className={TEMPLATE_META[t].icon} style={{fontSize:11,color:template===t?c.p:"#9ca3af",width:14}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11.5,fontWeight:700,color:template===t?c.p:"#374151",display:"flex",alignItems:"center",gap:5}}>
                        {TEMPLATE_META[t].label}
                        {TEMPLATE_META[t].isNew&&<span style={{fontSize:8,fontWeight:800,color:"#fff",background:c.p,borderRadius:3,padding:"0px 4px"}}>NEW</span>}
                      </div>
                      <div style={{fontSize:9.5,color:"#9ca3af"}}>{TEMPLATE_META[t].desc}</div>
                    </div>
                    <span className="toolbar-ats-badge" style={{fontSize:9,fontWeight:700,color:"#f59e0b",background:"#fffbeb",padding:"1px 5px",borderRadius:4,whiteSpace:"nowrap"}}>{TEMPLATE_META[t].ats}%</span>
                    {template===t&&<i className="fa-solid fa-check" style={{fontSize:9,color:c.p}}/>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{position:"relative"}}>
            <button onClick={()=>{setClrOpen(o=>!o);setTmplOpen(false);}} style={{display:"flex",alignItems:"center",gap:5,background:clrOpen?"#f9fafb":"transparent",border:"1px solid #e5e7eb",borderRadius:9,padding:"6px 10px",fontSize:12,fontWeight:600,color:"#374151",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:"nowrap"}}>
              <span style={{width:12,height:12,borderRadius:"50%",background:c.p,display:"inline-block",flexShrink:0}}/>
              <span className="toolbar-label">{COLOR_META[color].label}</span>
              <i className={`fa-solid ${clrOpen?"fa-chevron-up":"fa-chevron-down"}`} style={{fontSize:8,color:"#9ca3af"}}/>
            </button>
            {clrOpen&&(
              <div className="clr-panel">
                <div style={{fontSize:9.5,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.12em",padding:"4px 8px 6px"}}>Accent Color</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3}}>
                  {(Object.keys(COLOR_META) as ColorName[]).map(col=>(
                    <button key={col} className="dd-row" onClick={()=>{setColor(col);setClrOpen(false);}} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 8px",background:color===col?"#f9fafb":"transparent",border:color===col?`1.5px solid ${HC[col].b}`:"1.5px solid transparent",borderRadius:8,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                      <span style={{width:14,height:14,borderRadius:"50%",background:COLOR_META[col].hex,flexShrink:0,boxShadow:color===col?`0 0 0 2px #fff,0 0 0 3.5px ${COLOR_META[col].hex}`:"none"}}/>
                      <span style={{fontSize:11,fontWeight:600,color:color===col?"#111827":"#374151"}}>{COLOR_META[col].label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="center-info" style={{position:"absolute",left:"50%",transform:"translateX(-50%)",textAlign:"center",flexDirection:"column",alignItems:"center",pointerEvents:"none"}}>
          <div style={{fontSize:12.5,fontWeight:700,color:"#111827",whiteSpace:"nowrap"}}>{data.contact.firstName||"Resume"} {data.contact.lastName||""} — CV</div>
          <div style={{fontSize:9.5,color:"#9ca3af",marginTop:1,whiteSpace:"nowrap"}}>
            {TEMPLATE_META[template].label} · {COLOR_META[color].label}
            {TEMPLATE_META[template].colorful
              ?<span style={{color:"#f59e0b",marginLeft:6,fontWeight:700}}><i className="fa-solid fa-star" style={{fontSize:8,marginRight:3}}/>Creative</span>
              :<span style={{color:"#22c55e",marginLeft:6,fontWeight:700}}><i className="fa-solid fa-shield-check" style={{fontSize:8,marginRight:3}}/>{TEMPLATE_META[template].ats}% ATS</span>}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:10,color:"#9ca3af",whiteSpace:"nowrap"}} className="toolbar-label"><i className="fa-regular fa-file-pdf" style={{marginRight:4}}/> A4</span>
          <DownloadBtn data={data} template={template} color={color}/>
        </div>
      </div>

      {(tmplOpen||clrOpen)&&<div className="no-print" style={{position:"fixed",inset:0,zIndex:299}} onClick={()=>{setTmplOpen(false);setClrOpen(false);}}/>}

      <div className="a4-wrapper">
        <div className="a4"><ResumeBody/></div>
      </div>

      <div className="no-print" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#1e293b",color:"#fff",padding:"7px 18px",borderRadius:100,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:7,fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:0.85,whiteSpace:"nowrap"}}>
        <i className="fa-regular fa-file" style={{fontSize:10}}/> A4 · 210 × 297 mm · Print-ready
      </div>
    </>
  );
}