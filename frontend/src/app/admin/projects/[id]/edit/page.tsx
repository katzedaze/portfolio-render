"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { ProjectFormData } from "@/lib/validations/project";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: project, isLoading, error } = useProject(id);
  const updateProject = useUpdateProject();

  const handleSubmit = async (data: ProjectFormData) => {
    await updateProject.mutateAsync({ id, data });
    toast.success("Project updated successfully");
    router.push("/admin/projects");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertDescription>Failed to load project.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Project</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            initialData={project}
            onSubmit={handleSubmit}
            isLoading={updateProject.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
