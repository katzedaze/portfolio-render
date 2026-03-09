export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: () => [...queryKeys.projects.all, "list"] as const,
    detail: (id: number) => [...queryKeys.projects.all, "detail", id] as const,
  },
  skills: {
    all: ["skills"] as const,
    list: () => [...queryKeys.skills.all, "list"] as const,
    detail: (id: number) => [...queryKeys.skills.all, "detail", id] as const,
  },
  profile: {
    all: ["profile"] as const,
    detail: () => [...queryKeys.profile.all, "detail"] as const,
  },
  contactMessages: {
    all: ["contactMessages"] as const,
    list: () => [...queryKeys.contactMessages.all, "list"] as const,
    detail: (id: number) =>
      [...queryKeys.contactMessages.all, "detail", id] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
  },
};
