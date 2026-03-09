import z from "zod";

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  proficiency: z.number().int().min(1, "Min 1").max(100, "Max 100"),
  icon: z.string().optional().or(z.literal("")),
  sort_order: z.number().int(),
});

export type SkillFormData = z.infer<typeof skillSchema>;
