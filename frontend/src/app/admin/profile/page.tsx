"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";
import { uploadFile } from "@/lib/api";
import { toast } from "sonner";

export default function AdminProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        email: profile.email,
        github_url: profile.github_url ?? "",
        linkedin_url: profile.linkedin_url ?? "",
        twitter_url: profile.twitter_url ?? "",
        website_url: profile.website_url ?? "",
        avatar_url: profile.avatar_url ?? "",
        resume_url: profile.resume_url ?? "",
        is_available: profile.is_available,
      });
    }
  }, [profile, reset]);

  const avatarUrl = watch("avatar_url");

  const onSubmit = async (data: ProfileFormData) => {
    try {
      let finalData = { ...data };

      if (avatarFile) {
        const url = await uploadFile(avatarFile);
        finalData = { ...finalData, avatar_url: url };
      }

      await updateProfile.mutateAsync(finalData);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-3xl">
        <AlertDescription>Failed to load profile.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bio *</Label>
              <Textarea rows={4} {...register("bio")} />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input {...register("github_url")} />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input {...register("linkedin_url")} />
              </div>
              <div className="space-y-2">
                <Label>Twitter URL</Label>
                <Input {...register("twitter_url")} />
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input {...register("website_url")} />
              </div>
              <div className="space-y-2">
                <Label>Resume URL</Label>
                <Input {...register("resume_url")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avatar Image</Label>
              <ImageUpload
                value={avatarUrl || undefined}
                onChange={(file) => {
                  setAvatarFile(file);
                  if (!file) {
                    setValue("avatar_url", "");
                  }
                }}
                disabled={updateProfile.isPending}
              />
            </div>

            <div className="flex items-center gap-3">
              <Controller
                control={control}
                name="is_available"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="is_available"
                  />
                )}
              />
              <Label htmlFor="is_available">Available for hire</Label>
            </div>

            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
