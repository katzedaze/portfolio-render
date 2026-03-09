import z from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  avatar_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  github_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
