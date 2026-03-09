import { ProfileView } from "@/components/profile/ProfileView";
import { SkillList } from "@/components/skills/SkillList";
import { Separator } from "@/components/ui/separator";
import type { Profile, Skill } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Portfolio",
  description: "Learn more about me",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getData() {
  try {
    const [profileRes, skillsRes] = await Promise.allSettled([
      fetch(`${API_URL}/api/profile`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/skills`, { next: { revalidate: 60 } }),
    ]);

    const profile =
      profileRes.status === "fulfilled" && profileRes.value.ok
        ? await profileRes.value.json()
        : null;
    const skills =
      skillsRes.status === "fulfilled" && skillsRes.value.ok
        ? await skillsRes.value.json()
        : [];

    return { profile, skills };
  } catch {
    return { profile: null, skills: [] };
  }
}

export default async function AboutPage() {
  const { profile, skills } = await getData();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-10">About Me</h1>

      {profile ? (
        <ProfileView profile={profile} />
      ) : (
        <p className="text-muted-foreground">Profile information not available.</p>
      )}

      {skills.length > 0 && (
        <>
          <Separator className="my-12" />
          <section>
            <h2 className="text-2xl font-bold mb-6">Skills & Technologies</h2>
            <SkillList skills={skills} />
          </section>
        </>
      )}
    </div>
  );
}
