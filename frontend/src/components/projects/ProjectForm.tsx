"use client";

import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { projectSchema, type ProjectFormData } from "@/lib/validations/project";
import { uploadFile } from "@/lib/api";
import type { Project } from "@/types";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      content: initialData?.content ?? "",
      thumbnail_url: initialData?.thumbnail_url ?? "",
      live_url: initialData?.live_url ?? "",
      github_url: initialData?.github_url ?? "",
      skill_ids: initialData?.skills?.map((s) => s.id) ?? [],
      is_featured: initialData?.is_featured ?? false,
      is_published: initialData?.is_published ?? false,
      sort_order: initialData?.sort_order ?? 0,
    },
  });

  const thumbnailUrl = watch("thumbnail_url");

  const handleFormSubmit = async (data: ProjectFormData) => {
    setError(null);
    try {
      let finalData = { ...data };

      if (thumbnailFile) {
        const url = await uploadFile(thumbnailFile);
        finalData = { ...finalData, thumbnail_url: url };
      }

      await onSubmit(finalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description *</Label>
        <Textarea id="description" rows={3} {...register("description")} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <div data-color-mode="light">
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <MDEditor
                value={field.value ?? ""}
                onChange={(val) => field.onChange(val ?? "")}
                height={300}
                preview="edit"
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Thumbnail Image</Label>
        <ImageUpload
          value={thumbnailUrl || undefined}
          onChange={(file) => {
            setThumbnailFile(file);
            if (!file) {
              setValue("thumbnail_url", "");
            }
          }}
          disabled={isLoading}
        />
        {errors.thumbnail_url && (
          <p className="text-sm text-destructive">{errors.thumbnail_url.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="live_url">Live URL</Label>
          <Input id="live_url" {...register("live_url")} />
          {errors.live_url && (
            <p className="text-sm text-destructive">{errors.live_url.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input id="github_url" {...register("github_url")} />
          {errors.github_url && (
            <p className="text-sm text-destructive">{errors.github_url.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            {...register("sort_order", { valueAsNumber: true })}
          />
        </div>

        <div className="flex items-center gap-3 pt-8">
          <Controller
            control={control}
            name="is_featured"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id="is_featured"
              />
            )}
          />
          <Label htmlFor="is_featured">Featured</Label>
        </div>

        <div className="flex items-center gap-3 pt-8">
          <Controller
            control={control}
            name="is_published"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id="is_published"
              />
            )}
          />
          <Label htmlFor="is_published">Published</Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : initialData ? "Update Project" : "Create Project"}
      </Button>
    </form>
  );
}
