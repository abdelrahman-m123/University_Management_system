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
import { addCourse } from "../actions";

export function DialogCreateCourse(
    {update}: {update: ()=> Promise<void>}
) {
  const [courseName, setCourseName] = useState("");
  const [creditHours, setCreditHours] = useState(0);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    // TODO: Add course creation logic here
    console.log("Creating course:", { courseName, creditHours });
    const res = await addCourse(courseName, creditHours);
    console.log(res.success);
    if (res.success){
        await update();
    setCourseName("");
    setCreditHours(0);
    setOpen(false);
    }
    
    // Reset form
    
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Course</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="course-name" className="text-sm font-medium">
              Course Name
            </label>
            <Input
              id="course-name"
              placeholder="e.g., Introduction to Programming"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="credit-hours" className="text-sm font-medium">
              Credit Hours
            </label>
            <Input
              id="credit-hours"
              type="number"
              placeholder="e.g., 3"
              value={creditHours}
              onChange={(e) => setCreditHours(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!courseName || !creditHours}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
