// /app/api/resumes/save/route.ts

import { getServerSession } from "next-auth";

import { connectDB } from "../../../lib/mongoose";
import Resume from "../../../models/Resume";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { title, template, color, data } = body;

    await connectDB();

    const resume = await Resume.create({
      userEmail: session.user.email,
      title,
      template,
      color,
      data,
    });

    return NextResponse.json({ success: true, resume });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to save resume" },
      { status: 500 }
    );
  }
}