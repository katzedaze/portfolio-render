import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { SkillList } from "@/components/skills/SkillList";
import type { Project, Skill, Profile } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getData() {
  try {
    const [profileRes, projectsRes, skillsRes] = await Promise.allSettled([
      fetch(`${API_URL}/api/profile`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/projects?is_published=true&is_featured=true`, {
        next: { revalidate: 60 },
      }),
      fetch(`${API_URL}/api/skills`, { next: { revalidate: 60 } }),
    ]);

    const profile =
      profileRes.status === "fulfilled" && profileRes.value.ok
        ? await profileRes.value.json()
        : null;
    const projects =
      projectsRes.status === "fulfilled" && projectsRes.value.ok
        ? await projectsRes.value.json()
        : [];
    const skills =
      skillsRes.status === "fulfilled" && skillsRes.value.ok
        ? await skillsRes.value.json()
        : [];

    return { profile, projects, skills };
  } catch {
    return { profile: null, projects: [], skills: [] };
  }
}

export default async function HomePage() {
  const { profile, projects, skills } = await getData();

  return (
    <div className="container mx-auto px-4 py-16 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          {profile?.name ?? "Welcome"}
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
          {profile?.title ?? "Developer & Creator"}
        </p>
        {profile?.bio && (
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {profile.bio}
          </p>
        )}
        <div className="flex justify-center gap-4 flex-wrap">
          <Button size="lg" asChild>
            <Link href="/projects">View Projects</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Projects</h2>
            <Button variant="outline" asChild>
              <Link href="/projects">View All</Link>
            </Button>
          </div>
          <ProjectGrid projects={projects.slice(0, 6)} />
        </section>
      )}

      {/* Skills Overview */}
      {skills.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Skills</h2>
            <Button variant="outline" asChild>
              <Link href="/about">About Me</Link>
            </Button>
          </div>
          <SkillList skills={skills.slice(0, 12)} />
        </section>
      )}
    </div>
  );
}
