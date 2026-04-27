// app/api/resumes/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { connectDB } from "../../lib/mongoose";
import Resume from "../../models/Resume";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const resumes = await Resume.find({ userEmail: session.user.email })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      resumes: resumes || [],
    });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, template, color, data } = body;

    if (!title || !template || !color || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const resume = await Resume.create({
      userEmail: session.user.email,
      title,
      template,
      color,
      data,
    });

    return NextResponse.json(
      {
        success: true,
        resume: resume.toObject(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
}



export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, template, color, data } = body;

    await connectDB();

    const resume = await Resume.findOneAndUpdate(
      { _id: id, userEmail: session.user.email },
      { title, template, color, data, updatedAt: new Date() },
      { new: true }
    );

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: resume.toObject(),
    });
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await Resume.findOneAndDelete({
      _id: id,
      userEmail: session.user.email,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}