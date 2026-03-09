import z from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string(),
  thumbnail_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  live_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  sort_order: z.number().int(),
  skill_ids: z.array(z.number()),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
