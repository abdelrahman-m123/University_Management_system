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

export function DialogReviewApplication(
    {handleAccept, handleReject,
      Row}: {handleReject: (number, number)=> void;handleAccept: (number, number)=> void;Row: any;}
) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>("");

  const handleSubmit = async () => {
    // TODO: Add course creation logic here
    console.log("Creating course:",  userId, Row.course_id, Row.registered_students );

    const res = await handleAccept(Row.course_id, Row.stu_id);
    console.log(res.success);
    if (res.success){
        // await update();
    setOpen(false);
    }
    
    // Reset form
    
    
  };

  const handleRejectClick = async () => {
    // TODO: Add course creation logic here
    console.log("Creating course:",  userId, Row.course_id );

    const res = await handleReject(Row.course_id, Row.stu_id);
    console.log(res.success);
    if (res.success){
        // await update();
    setOpen(false);
    }
    
    // Reset form
    
    
  };

  useEffect(() => {
        setUserId(localStorage.getItem("userId"));
      }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle> {Row.course_name}</DialogTitle>
          <DialogDescription>
            {Row.stu_email} wants to register {Row.course_name} <br></br> {Row.max_registered_students - Row.registered_students} spots left spots left.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-end gap-2">
           
          <Button onClick={handleSubmit}>
            Accept
          </Button>
           <Button onClick={handleRejectClick} variant="destructive">
              Reject
            </Button>
        </DialogFooter> 
       </DialogContent>
    </Dialog>
  )
}
