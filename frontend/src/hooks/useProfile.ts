import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Profile } from "@/types";
import type { ProfileFormData } from "@/lib/validations/profile";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.detail(),
    queryFn: () => api.get<Profile>("/api/profile"),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProfileFormData>) =>
      api.put<Profile>("/api/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}
