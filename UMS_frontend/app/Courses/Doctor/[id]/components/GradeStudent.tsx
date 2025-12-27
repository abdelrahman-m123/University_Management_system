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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { gradeQuiz, gradeCoursework } from "../../actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  courseId: number; // Add courseId prop
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function DialogGradeStudent({ 
  student, 
  quizzes, 
  courseId,
  open, 
  onOpenChange, 
  onSubmit 
}: DialogGradeStudentProps) {
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [quizGrade, setQuizGrade] = useState("");
  const [activeTab, setActiveTab] = useState("quiz");
  const [midtermGrade, setMidtermGrade] = useState("");
  const [classworkGrade, setClassworkGrade] = useState("");
  const [quizzesGrade, setQuizzesGrade] = useState("");

  const handleQuizSubmit = async () => {
    if (!selectedQuiz || !quizGrade) return;

    console.log("Grading student quiz:", {
      studentId: student.stu_id,
      quizId: selectedQuiz,
      grade: quizGrade
    });
    const resp = await gradeQuiz(parseInt(selectedQuiz), student.stu_id.toString(), quizGrade);
    console.log(resp);

    // Reset form
    setSelectedQuiz("");
    setQuizGrade("");
    onSubmit();
  };

  const handleCourseworkSubmit = async () => {
    if (!midtermGrade || !classworkGrade || !quizzesGrade) return;

    console.log("Grading student coursework:", {
      studentId: student.stu_id,
      courseId: courseId,
      midtermGrade: parseFloat(midtermGrade),
      classworkGrade: parseFloat(classworkGrade),
      quizzesGrade: parseFloat(quizzesGrade)
    });

    const resp = await gradeCoursework(
      student.stu_id,
      courseId,
      parseFloat(midtermGrade),
      parseFloat(classworkGrade),
      parseFloat(quizzesGrade)
    );
    console.log(resp);

    // Reset form
    setMidtermGrade("");
    setClassworkGrade("");
    setQuizzesGrade("");
    onSubmit();
  };

  const isQuizFormValid = selectedQuiz && quizGrade;
  const isCourseworkFormValid = midtermGrade && classworkGrade && quizzesGrade;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grade Student</DialogTitle>
          <DialogDescription>
            Assign grades to {student.stu_name}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="quiz" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quiz">Quiz Grade</TabsTrigger>
            <TabsTrigger value="coursework">Course Work</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quiz" className="space-y-4">
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
                Quiz Grade
              </label>
              <Select value={quizGrade} onValueChange={setQuizGrade}>
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
            
            <DialogFooter className="sm:justify-end gap-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleQuizSubmit} disabled={!isQuizFormValid}>
                Submit Quiz Grade
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="coursework" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="midterm-grade" className="text-sm font-medium">
                  Midterm Grade (0-100)
                </label>
                <Input
                  id="midterm-grade"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 85"
                  value={midtermGrade}
                  onChange={(e) => setMidtermGrade(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="classwork-grade" className="text-sm font-medium">
                  Classwork Grade (0-100)
                </label>
                <Input
                  id="classwork-grade"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 90"
                  value={classworkGrade}
                  onChange={(e) => setClassworkGrade(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="quizzes-grade" className="text-sm font-medium">
                  Quizzes Grade (0-100)
                </label>
                <Input
                  id="quizzes-grade"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 88"
                  value={quizzesGrade}
                  onChange={(e) => setQuizzesGrade(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter className="sm:justify-end gap-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleCourseworkSubmit} disabled={!isCourseworkFormValid}>
                Submit Coursework Grades
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}