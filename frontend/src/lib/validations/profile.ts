import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  email: z.string().email("Invalid email address"),
  github_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitter_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  website_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  avatar_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  resume_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_available: z.boolean(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
