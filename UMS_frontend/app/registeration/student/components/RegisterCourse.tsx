"use client";

import { useEffect, useState } from "react";
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
import { registerCourse } from "../actions";

export function DialogCreateCourse(
    {Row, handleUpdate}: {Row: any, handleUpdate: () => void}
) {
  const [courseName, setCourseName] = useState("");
  const [creditHours, setCreditHours] = useState(0);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>("");

  const handleSubmit = async () => {
    console.log("Creating course:",  userId, Row.course_id );

    const res = await registerCourse(Row.course_id, userId);

    console.log(res.success);
    if (res.success){
    await handleUpdate();
    setCourseName("");
    setCreditHours(0);
    setOpen(false);
    }
  };

  useEffect(() => {
        setUserId(localStorage.getItem("userId"));
      }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register {Row.course_name}</DialogTitle>
          <DialogDescription>
            {Row.max_registered_students - Row.registered_students} spots left.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            Register
          </Button>
        </DialogFooter> 
       </DialogContent>
    </Dialog>
  )
}
