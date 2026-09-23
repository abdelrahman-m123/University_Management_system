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
import { Switch } from "@/components/ui/switch";
import { editStaff } from "../../actions";

interface Staff {
  staff_id: number;
  staff_name: string;
  role: string;
  phone?: string;
  contact_info?: string;
  profile_link?: string;
  office_hours?: string;
  staff_email: string;
  attributes?: {
    rating?: number;
    numberOfResearchPapers?: number;
    specialization?: string;
    remoteWork?: boolean;
  };
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
  const [rating, setRating] = useState<number | "">("");
  const [numberOfResearchPapers, setNumberOfResearchPapers] = useState<number | "">("");
  const [specialization, setSpecialization] = useState("");
  const [remoteWork, setRemoteWork] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (row && open) {
      setStaffName(row.staff_name || "");
      setRole(row.role || "");
      setPhone(row.phone || "");
      setContactInfo(row.contact_info || "");
      setProfileLink(row.profile_link || "");
      setOfficeHours(row.office_hours ? new Date(row.office_hours).toISOString().slice(0, 16) : "");
      
      if (row.attributes) {
        setRating(row.attributes.rating || "");
        setNumberOfResearchPapers(row.attributes.numberOfResearchPapers || "");
        setSpecialization(row.attributes.specialization || "");
        setRemoteWork(row.attributes.remoteWork || false);
      }
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
      officeHours,
      rating,
      numberOfResearchPapers,
      specialization,
      remoteWork
    });
    
    const res = await editStaff({
      staff_id: row.staff_id,
      staff_name: staffName,
      role: role,
      phone: phone || undefined,
      contact_info: contactInfo || undefined,
      profile_link: profileLink || undefined,
      office_hours: officeHours || undefined,
      rating: rating !== "" ? Number(rating) : undefined,
      numberOfResearchPapers: numberOfResearchPapers !== "" ? Number(numberOfResearchPapers) : undefined,
      specialization: specialization || undefined,
      remoteWork: remoteWork
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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[min(90vh,760px)] overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update staff information for {row.staff_name} (ID: {row.staff_id})
          </DialogDescription>
        </DialogHeader>
        
        <div className="min-h-0 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Basic Information</h3>
            
            <div className="grid gap-2">
              <label htmlFor="edit-staff-email" className="text-sm font-medium text-slate-700">Email (Read-only)</label>
              <Input
                id="edit-staff-email"
                type="email"
                value={row.staff_email}
                disabled
                className="bg-slate-50 text-slate-500"
              />
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-staff-name" className="text-sm font-medium text-slate-700">Staff Name *</label>
              <Input
                id="edit-staff-name"
                placeholder="e.g., Dr. John Smith"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-staff-role" className="text-sm font-medium text-slate-700">Role *</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="edit-staff-role">
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
              <label htmlFor="edit-staff-phone" className="text-sm font-medium text-slate-700">Phone</label>
              <Input
                id="edit-staff-phone"
                placeholder="e.g., 01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-contact-info" className="text-sm font-medium text-slate-700">Contact Info</label>
              <Input
                id="edit-contact-info"
                placeholder="e.g., Building A, Room 101"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-profile-link" className="text-sm font-medium text-slate-700">Profile Link</label>
              <Input
                id="edit-profile-link"
                placeholder="e.g., https://website.com/profile"
                value={profileLink}
                onChange={(e) => setProfileLink(e.target.value)}
              />
            </div>
            

          </div>
          
          {/* Attributes Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Attributes</h3>
            
            <div className="grid gap-2">
              <label htmlFor="edit-rating" className="text-sm font-medium text-slate-700">Rating (1-5)</label>
              <Select value={rating.toString()} onValueChange={(value) => setRating(value === "" ? "" : Number(value))}>
                <SelectTrigger id="edit-rating">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Not specified</SelectItem>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Fair</SelectItem>
                  <SelectItem value="3">3 - Good</SelectItem>
                  <SelectItem value="4">4 - Very Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-research-papers" className="text-sm font-medium text-slate-700">Number of Research Papers</label>
              <Input
                id="edit-research-papers"
                type="number"
                min="0"
                placeholder="e.g., 15"
                value={numberOfResearchPapers}
                onChange={(e) => setNumberOfResearchPapers(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-specialization" className="text-sm font-medium text-slate-700">Specialization</label>
              <Input
                id="edit-specialization"
                placeholder="e.g., Artificial Intelligence, Computer Systems"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="edit-remote-work" className="text-sm font-medium text-slate-700">Remote Work Available</label>
              <Switch
                id="edit-remote-work"
                checked={remoteWork}
                onCheckedChange={setRemoteWork}
              />
            </div>
          </div>
          </div>
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
