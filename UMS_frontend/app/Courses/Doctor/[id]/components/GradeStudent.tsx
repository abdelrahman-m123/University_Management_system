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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { gradeQuiz } from "../../actions";

interface Student {
  stu_id: number;
  stu_name: string;
}

interface Quiz {
  quiz_id: number;
  quiz_title: string;
}

interface DialogGradeStudentProps {
  student: Student;
  quizzes: Quiz[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function DialogGradeStudent({ 
  student, 
  quizzes, 
  open, 
  onOpenChange, 
  onSubmit 
}: DialogGradeStudentProps) {
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [grade, setGrade] = useState("");

  const handleSubmit = async () => {
    if (!selectedQuiz || !grade) return;

    // TODO: Implement grade submission logic
    console.log("Grading student:", {
      studentId: student.stu_id,
      quizId: selectedQuiz,
      grade: grade
    });
    const resp = await gradeQuiz(selectedQuiz, student.stu_id, grade);
    console.log(resp);

    // Reset form
    setSelectedQuiz("");
    setGrade("");
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grade Student</DialogTitle>
          <DialogDescription>
            Assign a grade to {student.stu_name} 
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="quiz-select" className="text-sm font-medium">
              Select Quiz
            </label>
            <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a quiz" />
              </SelectTrigger>
              <SelectContent>
                {quizzes.map((quiz) => (
                  <SelectItem key={quiz.quiz_id} value={quiz.quiz_id.toString()}>
                    {quiz.quiz_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="grade" className="text-sm font-medium">
              Grade
            </label>
            <Select value={grade} onValueChange={(e) => setGrade(e)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!selectedQuiz || !grade}>
            Submit Grade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}