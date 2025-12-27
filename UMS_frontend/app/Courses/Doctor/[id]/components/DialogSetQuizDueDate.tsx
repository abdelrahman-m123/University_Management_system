"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { publishQuiz } from "../../actions"; // Adjust path as needed

interface DialogSetQuizDueDateProps {
  quizId: number;
  quizTitle: string;
  onSetDueDate?: (quizId: number, openDate: string, closeDate: string) => Promise<void>;
  handleUpdate?: () => Promise<void>; // Optional callback to refresh parent component
}

export function DialogSetQuizDueDate({ 
  quizId, 
  quizTitle, 
  onSetDueDate,
  handleUpdate
}: DialogSetQuizDueDateProps) {
  const [openDate, setOpenDate] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!openDate || !closeDate) return;
    
    setLoading(true);
    try {
      
      const openDateWithSeconds = openDate + ":00";
      const closeDateWithSeconds = closeDate + ":00";
      
      const response = await publishQuiz(
        quizId.toString(), 
        openDateWithSeconds, 
        closeDateWithSeconds
      );
      
      if (response.success) {
        console.log("Quiz published successfully:", response);
        
        if (onSetDueDate) {
          await onSetDueDate(quizId, openDateWithSeconds, closeDateWithSeconds);
        }
        
        if (handleUpdate) {
          await handleUpdate();
        }
        
        setOpen(false);
        setOpenDate("");
        setCloseDate("");
        
        alert("Quiz published successfully!");
      } else {
        alert(`Failed to publish quiz: ${response.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error publishing quiz:", error);
      alert("An error occurred while publishing the quiz");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = openDate && closeDate;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          Publish Quiz
        </Button>
      </DialogTrigger>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Publish Quiz with Schedule</DialogTitle>
          <DialogDescription>
            Set open and close dates for quiz: <span className="font-semibold">{quizTitle}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="open-date" className="text-sm font-medium">
              Open Date & Time
            </label>
            <Input
              id="open-date"
              type="datetime-local"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              When the quiz becomes available to students
            </p>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="close-date" className="text-sm font-medium">
              Close Date & Time
            </label>
            <Input
              id="close-date"
              type="datetime-local"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              When the quiz submission deadline ends
            </p>
          </div>
          
          {openDate && closeDate && (
            <div className="text-xs text-gray-600 border-t pt-2">
              <p>Quiz will be open from:</p>
              <p className="font-medium">
                {new Date(openDate).toLocaleString()} 
                {" → "} 
                {new Date(closeDate).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className=" gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || loading}
          >
            {loading ? "Publishing..." : "Publish Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}