import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Skill } from "@/types";

interface SkillBadgeProps {
  skill: Skill;
}

export function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<div />}
        className="flex flex-col items-center gap-1 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-default min-w-[80px]"
      >
        <span className="text-sm font-medium">{skill.name}</span>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full"
            style={{ width: `${skill.proficiency}%` }}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{skill.proficiency}% proficiency</p>
      </TooltipContent>
    </Tooltip>
  );
}
