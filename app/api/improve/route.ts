import { GoogleGenerativeAI, SchemaType, type ObjectSchema } from "@google/generative-ai";

// Define the schema outside the handler to keep the POST function clean
const resumeSchema: ObjectSchema = {
  description: "Structured ATS-optimized resume data",
  type: SchemaType.OBJECT,
  properties: {
    contact: {
      type: SchemaType.OBJECT,
      properties: {
        firstName: { type: SchemaType.STRING },
        lastName: { type: SchemaType.STRING },
        email: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        jobTitle: { type: SchemaType.STRING },
        city: { type: SchemaType.STRING },
        country: { type: SchemaType.STRING },
        linkedin: { type: SchemaType.STRING },
        website: { type: SchemaType.STRING },
      },
      required: ["firstName", "lastName", "email", "phone", "jobTitle", "city", "country", "linkedin", "website"]
    },
    summary: { type: SchemaType.STRING },
    experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          company: { type: SchemaType.STRING },
          position: { type: SchemaType.STRING },
          startDate: { type: SchemaType.STRING },
          endDate: { type: SchemaType.STRING },
          current: { type: SchemaType.BOOLEAN },
          description: { type: SchemaType.STRING },
        },
        required: ["id", "company", "position", "description"],
      },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          institution: { type: SchemaType.STRING },
          degree: { type: SchemaType.STRING },
          field: { type: SchemaType.STRING },
          startDate: { type: SchemaType.STRING },
          endDate: { type: SchemaType.STRING },
          current: { type: SchemaType.BOOLEAN },
          grade: { type: SchemaType.STRING },
        },
        required: ["id", "institution"],
      },
    },
    skillGroups: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          heading: { type: SchemaType.STRING },
          skills: { type: SchemaType.STRING },
        },
        required: ["id", "heading", "skills"],
      },
    },
    projects: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          link: { type: SchemaType.STRING },
        },
        required: ["id", "title"],
      },
    },
    certs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          issuer: { type: SchemaType.STRING },
          year: { type: SchemaType.STRING },
        },
        required: ["id", "name"],
      },
    },
    custom: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          heading: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING },
        },
        required: ["id", "heading", "content"],
      },
    },
  },
  required: ["contact", "summary", "experience", "education", "skillGroups", "projects", "certs", "custom"],
};

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.length < 50) {
      return Response.json({ error: "Resume text is too short or missing." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // Using 1.5-flash for speed and lower cost, or 1.5-pro for better "improvement" quality
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
        temperature: 0.2, // Slightly higher than 0.1 for better creative "improvement"
      },
    });

    const prompt = `
      Act as an expert ATS (Applicant Tracking System) Resume Optimizer.
      TASK:
      1. Parse the provided raw resume text.
      2. Improve the language: Use strong action verbs and ensure a professional tone and more specific to role.
      3. Format the data into the requested JSON structure.
      RULES:
      - UUIDs: Generate a unique random string for every "id" field.
      - MISSING DATA: If a any section including custom  is absent, return [].
      - CUSTOM: Place any other sections other than provided if relevent.
      - SUMMARY: Write a compelling 3-4 sentence professional summary focusing on key strengths.
      RESUME TEXT:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const parsedOutput = JSON.parse(responseText);
      return Response.json({ improved: parsedOutput });
    } catch (parseError) {
      console.error("JSON Parse Error:", responseText);
      return Response.json({ error: "AI generated an invalid JSON format." }, { status: 500 });
    }

  } catch (err: any) {
    console.error("API ERROR:", err);

    const status = err.status || 500;
    const message = err.status === 503 
      ? "Gemini is currently overloaded. Please try again in a few seconds." 
      : "An error occurred while processing your resume.";

    return Response.json({ error: message }, { status });
  }
}