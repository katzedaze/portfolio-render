"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useContactMessages,
  useMarkMessageRead,
  useDeleteMessage,
} from "@/hooks/useContactMessages";
import { CheckCheck, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import type { ContactMessage } from "@/types";

function MessageDialog({
  message,
  open,
  onClose,
}: {
  message: ContactMessage | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">From:</span>{" "}
              {message.name}
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              <a
                href={`mailto:${message.email}`}
                className="text-primary hover:underline"
              >
                {message.email}
              </a>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>{" "}
              {new Date(message.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="border rounded-md p-4 bg-muted/50">
            <p className="whitespace-pre-wrap text-sm">{message.message}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminContactMessagesPage() {
  const { data: messages, isLoading, error } = useContactMessages();
  const markRead = useMarkMessageRead();
  const deleteMessage = useDeleteMessage();
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleMarkRead = async (id: number) => {
    try {
      await markRead.mutateAsync(id);
      toast.success("Message marked as read");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark as read");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMessage.mutateAsync(deleteId);
      toast.success("Message deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
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
    return <p className="text-destructive">Failed to load messages.</p>;
  }

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} unread</Badge>
        )}
      </div>

      {messages && messages.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow
                  key={message.id}
                  className={!message.is_read ? "font-medium bg-muted/30" : ""}
                >
                  <TableCell>
                    <Badge variant={message.is_read ? "secondary" : "destructive"}>
                      {message.is_read ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>
                  <TableCell>{message.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {message.email}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {message.subject}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(message.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewMessage(message)}
                        title="View message"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!message.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkRead(message.id)}
                          title="Mark as read"
                          disabled={markRead.isPending}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(message.id)}
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No messages yet.</p>
        </div>
      )}

      <MessageDialog
        message={viewMessage}
        open={!!viewMessage}
        onClose={() => setViewMessage(null)}
      />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMessage.isPending}
            >
              {deleteMessage.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
