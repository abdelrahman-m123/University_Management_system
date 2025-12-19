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
import { CreateQuiz } from "../../actions";

export function DialogCreateQuiz({ courseId , handleUpdate}: { courseId: number, handleUpdate: () => void }) {
  const [quizTitle, setQuizTitle] = useState("");
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    // TODO: Add quiz creation logic here using your existing action
    console.log("Creating quiz:", { quizTitle, courseId, googleFormUrl });
    const resp = await CreateQuiz(quizTitle, courseId, googleFormUrl);
    console.log(resp);
    handleUpdate();
    // Reset form
    setQuizTitle("");
    setGoogleFormUrl("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Quiz</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>
            Add a new quiz to this course.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="quiz-title" className="text-sm font-medium">
              Quiz Title
            </label>
            <Input
              id="quiz-title"
              placeholder="e.g., Quiz 1"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="google-form-url" className="text-sm font-medium">
              Google Form URL
            </label>
            <Input
              id="google-form-url"
              placeholder="https://forms.google.com/..."
              value={googleFormUrl}
              onChange={(e) => setGoogleFormUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!quizTitle || !googleFormUrl}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}