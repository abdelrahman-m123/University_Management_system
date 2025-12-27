"use client";

import { useState } from "react";
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
import { CreateAnnouncement } from "../../actions";

export function DialogCreateAnnouncement({ 
  courseId, 
  handleUpdate 
}: { 
  courseId: number; 
  handleUpdate: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    setIsLoading(true);
    try {
      const resp = await CreateAnnouncement(title, courseId, content);
      console.log("Announcement creation response:", resp);
      
      if (resp.success) {
        setTitle("");
        setContent("");
        setOpen(false);
        handleUpdate();
      } else {
        alert(resp.error || "Failed to create announcement");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("An error occurred while creating the announcement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Announcement</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
          <DialogDescription>
            Share important information with students in this course.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="announcement-title" className="text-sm font-medium">
              Announcement Title *
            </label>
            <Input
              id="announcement-title"
              placeholder="e.g., Important: Midterm Schedule"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="announcement-content" className="text-sm font-medium">
              Announcement Content *
            </label>
            <textarea
              id="announcement-content"
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
            {isLoading ? "Creating..." : "Create Announcement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}