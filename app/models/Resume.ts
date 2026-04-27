// models/Resume.ts
import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Untitled Resume',
    },
    template: {
      type: String,
      enum: [
        'chronological',
        'functional',
        'combination',
        'executive',
        'modern',
        'minimal',
        'compact',
        'elegant',
        'classic',
        'tech',
        'colorband',
        'gradient',
        'vivid',
        'centered',
        'grid',
        'sidebar',
        'infographic',
        'timeline',
      ],
      default: 'chronological',
      required: true,
    },
    color: {
      type: String,
      enum: [
        'blue',
        'emerald',
        'violet',
        'rose',
        'amber',
        'slate',
        'indigo',
        'teal',
        'orange',
        'neutral',
      ],
      default: 'blue',
      required: true,
    },
    data: {
      contact: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        jobTitle: String,
        city: String,
        country: String,
        linkedin: String,
        website: String,
      },
      summary: String,
      experience: [
        {
          id: String,
          company: String,
          position: String,
          startDate: String,
          endDate: String,
          current: Boolean,
          description: String,
        },
      ],
      education: [
        {
          id: String,
          institution: String,
          degree: String,
          field: String,
          startDate: String,
          endDate: String,
          current: Boolean,
          grade: String,
        },
      ],
      skillGroups: [
        {
          id: String,
          heading: String,
          skills: String,
        },
      ],
      projects: [
        {
          id: String,
          title: String,
          description: String,
          link: String,
        },
      ],
      certs: [
        {
          id: String,
          name: String,
          issuer: String,
          year: String,
        },
      ],
      custom: [
        {
          id: String,
          heading: String,
          content: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate models in development
const Resume =
  mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);

export default Resume;