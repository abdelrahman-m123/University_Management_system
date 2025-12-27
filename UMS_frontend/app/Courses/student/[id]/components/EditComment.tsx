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
import { EditComment } from "../../actions";

interface DialogEditCommentProps {
  annId: number;
  commentId: number;
  initialContent: string;
  handleUpdate: () => void;
  children: React.ReactNode;
}

export function DialogEditComment({ 
  annId, 
  commentId,
  initialContent, 
  handleUpdate,
  children 
}: DialogEditCommentProps) {
  const [content, setContent] = useState(initialContent);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Please enter a comment");
      return;
    }

    setIsLoading(true);
    try {
      const resp = await EditComment(annId, commentId, content);
      console.log("Comment edit response:", resp);
      
      if (resp.success) {
        // Close dialog
        setOpen(false);
        handleUpdate();
      } else {
        alert(resp.error || "Failed to update comment");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("An error occurred while updating the comment");
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
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogDescription>
            Update your comment on this announcement.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="edit-comment-content" className="text-sm font-medium">
              Comment *
            </label>
            <textarea
              id="edit-comment-content"
              placeholder="Enter your comment..."
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
            disabled={!content.trim() || isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}