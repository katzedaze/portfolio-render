"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from "@/hooks/useSkills";
import { skillSchema, type SkillFormData } from "@/lib/validations/skill";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Skill } from "@/types";

function SkillFormDialog({
  skill,
  open,
  onClose,
}: {
  skill?: Skill;
  open: boolean;
  onClose: () => void;
}) {
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: skill
      ? {
          name: skill.name,
          category: skill.category,
          proficiency: skill.proficiency,
          icon_url: skill.icon_url ?? "",
          order: skill.order,
        }
      : { proficiency: 50, order: 0 },
  });

  const onSubmit = async (data: SkillFormData) => {
    try {
      if (skill) {
        await updateSkill.mutateAsync({ id: skill.id, data });
        toast.success("Skill updated");
      } else {
        await createSkill.mutateAsync(data);
        toast.success("Skill created");
      }
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save skill");
    }
  };

  const isLoading = createSkill.isPending || updateSkill.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{skill ? "Edit Skill" : "Add Skill"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input {...register("category")} />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proficiency (1-100) *</Label>
              <Input
                type="number"
                min={1}
                max={100}
                {...register("proficiency", { valueAsNumber: true })}
              />
              {errors.proficiency && (
                <p className="text-sm text-destructive">{errors.proficiency.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input
                type="number"
                {...register("order", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Icon URL</Label>
            <Input {...register("icon_url")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : skill ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSkillsPage() {
  const { data: skills, isLoading, error } = useSkills();
  const deleteSkill = useDeleteSkill();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSkill.mutateAsync(deleteId);
      toast.success("Skill deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditSkill(skill);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditSkill(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Failed to load skills.</p>;
  }

  const grouped = (skills ?? []).reduce<Record<string, Skill[]>>(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Skills</h1>
        <Button
          onClick={() => {
            setEditSkill(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {skills && skills.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categorySkills]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Proficiency</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorySkills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell className="font-medium">{skill.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${skill.proficiency}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {skill.proficiency}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{skill.order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(skill)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(skill.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No skills yet.</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first skill
          </Button>
        </div>
      )}

      <SkillFormDialog
        skill={editSkill}
        open={dialogOpen}
        onClose={handleDialogClose}
      />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Skill</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this skill?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSkill.isPending}
            >
              {deleteSkill.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
