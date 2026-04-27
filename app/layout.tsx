import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";

export const metadata = {
  metadataBase: new URL("https://makeresume-in.vercel.app"), 

  title: "AI Resume Builder Free | ATS Resume Checker | MakeResume.in",
  description:
    "Create ATS-friendly resumes with AI. Build, analyze, and improve your resume instantly. Free resume builder trusted by 10,000+ users.",
     verification: {
    google: "eKeR9q8uEObNGVSxiwh0Eb5fWMfQE0YLgH4uA9XxOl8", 
  },

  openGraph: {
    title: "AI Resume Builder | MakeResume.in",
    description:
      "Build and optimize your resume using AI. Get hired faster with ATS-friendly templates.",
    url: "https://makeresume-in.vercel.app", 
    siteName: "MakeResume.in",
    images: [
      {
        url: "/heroimg.webp",
        width: 1200,
        height: 630,
        alt: "AI Resume Builder",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AI Resume Builder | MakeResume.in",
    description:
      "Create ATS-friendly resumes with AI and get hired faster.",
    images: ["/heroimg.webp"],
  },
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en">
      

       
    <body>
      <Providers>
      <Toaster position="top-right" />
       {children}
       </Providers>
      </body>
    </html>
  );
}
