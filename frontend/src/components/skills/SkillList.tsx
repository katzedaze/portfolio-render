import { SkillBadge } from "./SkillBadge";
import type { Skill } from "@/types";

interface SkillListProps {
  skills: Skill[];
}

export function SkillList({ skills }: SkillListProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No skills found.</p>
      </div>
    );
  }

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categorySkills]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-4">{category}</h3>
          <div className="flex flex-wrap gap-3">
            {categorySkills.map((skill) => (
              <SkillBadge key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
