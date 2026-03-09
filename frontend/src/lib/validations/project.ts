import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  long_description: z.string().optional(),
  thumbnail_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  demo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  technologies: z.array(z.string()),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  order: z.number().int(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
