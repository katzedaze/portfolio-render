import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { ExternalLink, Github, ArrowLeft } from "lucide-react";
import type { Project } from "@/types";
import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getProject(id: string): Promise<Project | null> {
  try {
    const res = await fetch(`${API_URL}/api/projects/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | Portfolio`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6 -ml-2">
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </Button>

      {project.thumbnail_url && (
        <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-8">
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-start gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold flex-1">
              {project.title}
            </h1>
            {project.is_featured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-lg mt-2">
            {project.description}
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {project.live_url && (
            <Button asChild>
              <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Live Demo
              </a>
            </Button>
          )}
          {project.github_url && (
            <Button variant="outline" asChild>
              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                View Code
              </a>
            </Button>
          )}
        </div>

        {project.skills.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-xl font-semibold mb-3">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <Badge key={skill.id} variant="outline">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {project.content && (
          <>
            <Separator />
            <div>
              <h2 className="text-xl font-semibold mb-3">Details</h2>
              <MarkdownRenderer content={project.content} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
