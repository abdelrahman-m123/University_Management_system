"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { editStaff } from "../actions";

interface Staff {
  staff_id: number;
  staff_name: string;
  role: string;
  phone?: string;
  contact_info?: string;
  profile_link?: string;
  office_hours?: string;
  staff_email: string;
}

interface DialogEditStaffProps {
  row: Staff;
  update: () => Promise<void>;
}

export function DialogEditStaff({ row, update }: DialogEditStaffProps) {
  const [staffName, setStaffName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [profileLink, setProfileLink] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [open, setOpen] = useState(false);

  // Initialize form with row data when dialog opens or row changes
  useEffect(() => {
    if (row && open) {
      setStaffName(row.staff_name || "");
      setRole(row.role || "");
      setPhone(row.phone || "");
      setContactInfo(row.contact_info || "");
      setProfileLink(row.profile_link || "");
      setOfficeHours(row.office_hours ? new Date(row.office_hours).toISOString().slice(0, 16) : "");
    }
  }, [row, open]);

  const handleSubmit = async () => {
    console.log("Updating staff:", { 
      staff_id: row.staff_id, 
      staffName, 
      role, 
      phone, 
      contactInfo, 
      profileLink, 
      officeHours 
    });
    
    const res = await editStaff({
      staff_id: row.staff_id,
      staff_name: staffName,
      role: role,
      phone: phone || undefined,
      contact_info: contactInfo || undefined,
      profile_link: profileLink || undefined,
      office_hours: officeHours || undefined
    });
    
    console.log(res);
    if (res.success) {
      await update();
      setOpen(false);
    }
  };

  const isFormValid = staffName && role;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update staff information for {row.staff_name} (ID: {row.staff_id})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
            <label htmlFor="email">Email (Read-only)</label>
            <Input
              id="email"
              type="email"
              value={row.staff_email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="staff-name">Staff Name *</label>
            <Input
              id="staff-name"
              placeholder="e.g., Dr. John Smith"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
            />
          </div>
          
          
          
          <div className="grid gap-2">
            <label htmlFor="role">Role *</label>
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
            <label htmlFor="phone">Phone</label>
            <Input
              id="phone"
              placeholder="e.g., 01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="contact-info">Contact Info</label>
            <Input
              id="contact-info"
              placeholder="e.g., Building A, Room 101"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </div>
          
          {/* <div className="grid gap-2">
            <label htmlFor="profile-link">Profile Link</label>
            <Input
              id="profile-link"
              placeholder="e.g., https://website.com/profile"
              value={profileLink}
              onChange={(e) => setProfileLink(e.target.value)}
            />
          </div> */}
          
          {/* <div className="grid gap-2">
            <label htmlFor="office-hours">Office Hours</label>
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
            Update Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}