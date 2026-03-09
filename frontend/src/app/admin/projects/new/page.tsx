"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useCreateProject } from "@/hooks/useProjects";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { ProjectFormData } from "@/lib/validations/project";

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();

  const handleSubmit = async (data: ProjectFormData) => {
    await createProject.mutateAsync(data);
    toast.success("Project created successfully");
    router.push("/admin/projects");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">New Project</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            onSubmit={handleSubmit}
            isLoading={createProject.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
