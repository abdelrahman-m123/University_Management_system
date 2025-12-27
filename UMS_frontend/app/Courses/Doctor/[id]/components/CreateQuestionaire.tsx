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
import { CreateQuestion } from "../../actions";

export function DialogCreateQuestion({ courseId , handleUpdate}: { courseId: number, handleUpdate: () => void }) {
  const [QuestionaireTitle, setQuestionaireTitle] = useState("");
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    console.log("Creating Questionaire:", { QuestionaireTitle, courseId, googleFormUrl });
    const resp = await CreateQuestion(QuestionaireTitle, courseId, googleFormUrl);
    console.log(resp);
    handleUpdate();
    setQuestionaireTitle("");
    setGoogleFormUrl("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Questionaire</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Questionaire</DialogTitle>
          <DialogDescription>
            Add a new Questionaire to this course.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
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
          <Button onClick={handleSubmit} disabled={ !googleFormUrl}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}