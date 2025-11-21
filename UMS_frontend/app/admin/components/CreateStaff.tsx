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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addStaff } from "../actions";

export function DialogCreateStaff(
    {update}: {update: ()=> Promise<void>}
) {
  const [staffName, setStaffName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    console.log("Creating staff:", { staffName, email, role, phone, contactInfo, officeHours });
    
    const res = await addStaff({
      username: staffName,
      email,
      password,
      role,
      phone,
      contact_info: contactInfo,
      office_hours: officeHours ? new Date(officeHours).toISOString() : null
    });
    
    console.log(res.success);
    if (res.success){
        await update();
        // Reset form
        setStaffName("");
        setEmail("");
        setPassword("");
        setRole("");
        setPhone("");
        setContactInfo("");
        setOfficeHours("");
        setOpen(false);
    }
  };

  const isFormValid = staffName && email && password && role;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Staff</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Staff Member</DialogTitle>
          <DialogDescription>
            Add a new staff member to the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="staff-name">Staff Name</label>
            <Input
              id="staff-name"
              placeholder="e.g., Dr. John Smith"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., john.smith@university.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="role">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TA">Teaching Assistant</SelectItem>
                <SelectItem value="Doctor">Doctor/Professor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="phone">Phone (Optional)</label>
            <Input
              id="phone"
              placeholder="e.g., 01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="contact-info">Contact Info (Optional)</label>
            <Input
              id="contact-info"
              placeholder="e.g., Building A, Room 101"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </div>
          
          {/* <div className="grid gap-2">
            <label htmlFor="office-hours">Office Hours (Optional)</label>
            <Input
              id="office-hours"
              type="datetime-local"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
            />
          </div> */}
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}