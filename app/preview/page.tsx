"use client";

import { useEffect, useState } from "react";
import { ResumeFullPreview, ResumeData, TemplateName, ColorName } from "../builder/preview";

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
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"#dde1e7", fontFamily:"'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ textAlign:"center" }}>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:32, color:"#0ea5e9", display:"block", marginBottom:12 }}/>
        <p style={{ fontSize:14, color:"#64748b", fontWeight:600, margin:0 }}>Loading your resume…</p>
      </div>
    </div>
  );

  return (
    // No onDownload prop needed — DownloadButton inside ResumeFullPreview handles react-pdf directly
    <ResumeFullPreview
      data={data}
      template={template}
      color={color}
    />
  );
}