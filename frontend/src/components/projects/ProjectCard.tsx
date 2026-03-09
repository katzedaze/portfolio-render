import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      {project.thumbnail_url && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.title}
            </Link>
          </CardTitle>
          {project.is_featured && (
            <Badge variant="secondary" className="shrink-0">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {project.description}
        </p>
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.technologies.slice(0, 5).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {project.demo_url && (
          <Button variant="default" size="sm" asChild>
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Demo
            </a>
          </Button>
        )}
        {project.github_url && (
          <Button variant="outline" size="sm" asChild>
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              <Github className="h-3 w-3 mr-1" />
              Code
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
