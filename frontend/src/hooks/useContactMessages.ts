import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { ContactMessage } from "@/types";

export function useContactMessages() {
  return useQuery({
    queryKey: queryKeys.contactMessages.list(),
    queryFn: () => api.get<ContactMessage[]>("/api/contact"),
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch<ContactMessage>(`/api/contact/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages.all });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/api/contact/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
