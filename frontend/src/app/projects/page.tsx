import { ProjectGrid } from "@/components/projects/ProjectGrid";
import type { Project } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Portfolio",
  description: "Browse my projects",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_URL}/api/projects?is_published=true`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-2">
          A collection of things I&apos;ve built and worked on.
        </p>
      </div>
      <ProjectGrid projects={projects} />
    </div>
  );
}
