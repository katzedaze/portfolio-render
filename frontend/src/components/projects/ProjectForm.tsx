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
  const [techInput, setTechInput] = useState("");
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
      long_description: initialData?.long_description ?? "",
      thumbnail_url: initialData?.thumbnail_url ?? "",
      demo_url: initialData?.demo_url ?? "",
      github_url: initialData?.github_url ?? "",
      technologies: initialData?.technologies ?? [],
      is_featured: initialData?.is_featured ?? false,
      is_published: initialData?.is_published ?? false,
      order: initialData?.order ?? 0,
    },
  });

  const technologies = watch("technologies");
  const thumbnailUrl = watch("thumbnail_url");

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setValue("technologies", [...technologies, trimmed]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setValue(
      "technologies",
      technologies.filter((t) => t !== tech)
    );
  };

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
        <Label>Long Description</Label>
        <div data-color-mode="light">
          <Controller
            control={control}
            name="long_description"
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
          <Label htmlFor="demo_url">Demo URL</Label>
          <Input id="demo_url" {...register("demo_url")} />
          {errors.demo_url && (
            <p className="text-sm text-destructive">{errors.demo_url.message}</p>
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

      <div className="space-y-2">
        <Label>Technologies</Label>
        <div className="flex gap-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTech();
              }
            }}
            placeholder="Add technology..."
          />
          <Button type="button" variant="outline" onClick={handleAddTech}>
            Add
          </Button>
        </div>
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            {...register("order", { valueAsNumber: true })}
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
