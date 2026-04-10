"use client";

import { useEffect, useState } from "react";
import { ResumeFullPreview, ResumeData, TemplateName, ColorName } from "../builder/preview";
import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then(m => m.PDFDownloadLink),
  { ssr: false }
);
const ResumePDF = dynamic(
  () => import("../builder/preview").then(m => m.ResumePDF as any),
  { ssr: false }
);

const defaultData: ResumeData = {
  contact: { firstName:"", lastName:"", email:"", phone:"", jobTitle:"", city:"", country:"India", linkedin:"", website:"" },
  summary: "",
  experience: [],
  education:  [],
  skills:     [],
  projects:   [],
  certs:      [],
  custom:     [],
};

export default function PreviewPage() {
  const [data,     setData]     = useState<ResumeData>(defaultData);
  const [template, setTemplate] = useState<TemplateName>("modern");
  const [color,    setColor]    = useState<ColorName>("blue");
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("resume_draft");
      const tmpl  = localStorage.getItem("resume_template") as TemplateName | null;
      const clr   = localStorage.getItem("resume_color")    as ColorName    | null;
      if (saved) setData(JSON.parse(saved));
      if (tmpl)  setTemplate(tmpl);
      if (clr)   setColor(clr);
    } catch (e) {
      console.error("Failed to load draft", e);
    }
    setReady(true);
  }, []);

  if (!ready) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#e2e8f0", fontFamily:"sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:32, color:"#0ea5e9", display:"block", marginBottom:12 }} />
        <p style={{ fontSize:14, color:"#64748b", fontWeight:600 }}>Loading your resume…</p>
      </div>
    </div>
  );

  // Callback from toolbar download — triggers react-pdf download
  const handleDownload = (tmpl: TemplateName, clr: ColorName) => {
    // Save latest choices back to localStorage
    localStorage.setItem("resume_template", tmpl);
    localStorage.setItem("resume_color",    clr);
    // Fallback to print if PDFDownloadLink not available
    window.print();
  };

  return (
    <ResumeFullPreview
      data={data}
      template={template}
      color={color}
      onDownload={handleDownload}
    />
  );
}