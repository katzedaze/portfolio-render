import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter, Globe, Mail, FileText } from "lucide-react";
import type { Profile } from "@/types";

interface ProfileViewProps {
  profile: Profile;
}

export function ProfileView({ profile }: ProfileViewProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-32 w-32">
          <AvatarImage src={profile.avatar_url} alt={profile.name} />
          <AvatarFallback className="text-2xl">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {profile.is_available && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Available for hire
          </Badge>
        )}
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-xl text-muted-foreground mt-1">{profile.title}</p>
        </div>

        <p className="text-base leading-relaxed">{profile.bio}</p>

        <div className="flex flex-wrap gap-2">
          {profile.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${profile.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </a>
            </Button>
          )}
          {profile.github_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
          )}
          {profile.linkedin_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </a>
            </Button>
          )}
          {profile.twitter_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </a>
            </Button>
          )}
          {profile.website_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </a>
            </Button>
          )}
          {profile.resume_url && (
            <Button variant="default" size="sm" asChild>
              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                Resume
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
