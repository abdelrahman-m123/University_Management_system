"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { EditAnnouncement } from "../../actions";

interface DialogEditAnnouncementProps {
  annId: number;
  initialTitle: string;
  initialContent: string;
  handleUpdate: () => void;
  children: React.ReactNode;
}

export function DialogEditAnnouncement({ 
  annId, 
  initialTitle, 
  initialContent, 
  handleUpdate,
  children 
}: DialogEditAnnouncementProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update form when initial values change
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    setIsLoading(true);
    try {
      const resp = await EditAnnouncement(title, annId, content);
      console.log("Announcement edit response:", resp);
      
      if (resp.success) {
        // Close dialog
        setOpen(false);
        handleUpdate();
      } else {
        alert(resp.error || "Failed to update announcement");
      }
    } catch (error) {
      console.error("Error editing announcement:", error);
      alert("An error occurred while updating the announcement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
          <DialogDescription>
            Update this announcement for students in this course.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="edit-announcement-title" className="text-sm font-medium">
              Announcement Title *
            </label>
            <Input
              id="edit-announcement-title"
              placeholder="e.g., Important: Midterm Schedule"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="edit-announcement-content" className="text-sm font-medium">
              Announcement Content *
            </label>
            <textarea
              id="edit-announcement-content"
              placeholder="Enter the announcement details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !content.trim() || isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}