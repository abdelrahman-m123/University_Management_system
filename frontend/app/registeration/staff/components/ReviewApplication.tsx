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
      Row}: {
        handleReject: (courseId: number, studentId: number, status?: string) => Promise<{ success: boolean }>;
        handleAccept: (courseId: number, studentId: number, status?: string) => Promise<{ success: boolean }>;
        Row: any;
      }
) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>("");

  const handleSubmit = async () => {
    console.log("Creating course:",  userId, Row.course_id, Row.registered_students );

    const isWithdrawal = Row.status === "Withdrawal Requested";
    const res = await handleAccept(Row.course_id, Row.stu_id, isWithdrawal ? "Withdrawn" : "Accepted");
    console.log(res.success);
    if (res.success){
    setOpen(false);
    }
    
    
    
  };

  const handleRejectClick = async () => {
    console.log("Creating course:",  userId, Row.course_id );

    const isWithdrawal = Row.status === "Withdrawal Requested";
    const res = await handleReject(Row.course_id, Row.stu_id, isWithdrawal ? "Accepted" : "Rejected");
    console.log(res.success);
    if (res.success){
    setOpen(false);
    }
    
    
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
          <DialogTitle>{Row.course_name} · {Row.semester_name}</DialogTitle>
          <DialogDescription>
            {Row.stu_email} · {Row.status === "Withdrawal Requested" ? "requests withdrawal from" : "requests a place in"} {Row.course_name}. {Row.status === "Withdrawal Requested" ? "Approving withdraws the student; rejecting restores enrollment." : "Approval is subject to the offering capacity."}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-end gap-2">
           
          <Button onClick={handleSubmit}>
            {Row.status === "Withdrawal Requested" ? "Approve withdrawal" : "Approve"}
          </Button>
           <Button onClick={handleRejectClick} variant="destructive">
              {Row.status === "Withdrawal Requested" ? "Reject withdrawal" : "Reject"}
            </Button>
        </DialogFooter> 
       </DialogContent>
    </Dialog>
  )
}
