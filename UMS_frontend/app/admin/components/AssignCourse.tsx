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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignCourse, getAllCourses } from "../actions";

interface Course {
  course_id: number;
  course_name: string;
  credit_hours: number;
  registered_students: number;
  max_registered_students: number;
}

interface DialogAssignCourseProps {
  row: any;
  update: () => Promise<void>;
}

export function DialogAssignCourse({ row, update }: DialogAssignCourseProps) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await getAllCourses(""); // Empty search to get all courses
      if (res.success) {
        setCourses(res.courses || []);
      } else {
        console.error("Error loading courses:", res.error);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadCourses();
    } else {
      setSelectedCourse("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourse) return;

    console.log("Assigning course:", { 
      staff_id: row.staff_id, 
      course_id: parseInt(selectedCourse) 
    });
    
    const res = await assignCourse({
      staff_id: row.staff_id,
      course_id: parseInt(selectedCourse)
    });
    
    console.log(res);
    if (res.success) {
      await update();
      // Reset form
      setSelectedCourse("");
      setOpen(false);
    }
  };

  const selectedCourseData = courses.find(c => c.course_id === parseInt(selectedCourse));
  const isFormValid = selectedCourse;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Assign Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Course to Staff</DialogTitle>
          <DialogDescription>
            Assign a course to staff member ID: {row.staff_id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="course">Select Course</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={loading}>
              <SelectTrigger>
                <SelectValue 
                  placeholder={loading ? "Loading courses..." : courses.length > 0 ? "Select a course" : "No courses available"} 
                />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.course_id} value={course.course_id.toString()}>
                    {course.course_name} ({course.credit_hours} hrs)
                  </SelectItem>
                ))}
                {courses.length === 0 && !loading && (
                  <SelectItem value="no-courses" disabled>
                    No courses available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {loading && (
              <p className="text-sm text-muted-foreground">Loading courses...</p>
            )}
          </div>
          
          {selectedCourseData && (
            <div className="p-3 bg-muted rounded-md text-sm space-y-1">
              <p><strong>Course:</strong> {selectedCourseData.course_name}</p>
              <p><strong>Credit Hours:</strong> {selectedCourseData.credit_hours}</p>
              <p><strong>Enrollment:</strong> {selectedCourseData.registered_students}/{selectedCourseData.max_registered_students} students</p>
              <p><strong>Course ID:</strong> {selectedCourseData.course_id}</p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || loading}
          >
            Assign Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}