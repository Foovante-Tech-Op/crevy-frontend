"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserService } from "@/lib/services/user-service";

const profileSchema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  phoneNumber: z.string().optional(),
  sex: z.string().optional(),
  contactNumber: z.string().optional(),
  countryOfOperation: z.string().optional(),
  legalBusinessName: z.string().optional(),
  businessAddress: z.string().optional(),
  projectCategory: z.string().optional(),
  projectStartDate: z.string().optional(),
});

export function EditProfileForm({
  user,
  readOnly = false,
}: {
  user: any;
  readOnly?: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      sex: user.sex || "",
      contactNumber: user.contactNumber || "",
      countryOfOperation: user.countryOfOperation || "",
      legalBusinessName: user.company?.legalBusinessName || "",
      businessAddress: user.company?.businessAddress || "",
      projectCategory: user.projectOwner?.projectCategory || "",
      projectStartDate: user.projectOwner?.projectStartDate || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (readOnly) return;
    setIsSubmitting(true);
    try {
      const updateData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        sex: values.sex,
        contactNumber: values.contactNumber,
        countryOfOperation: values.countryOfOperation,
      };

      if (user.role === "financial_admin")
        updateData.company = {
          legalBusinessName: values.legalBusinessName,
          businessAddress: values.businessAddress,
        };
      else if (user.role === "project_owner")
        updateData.projectOwner = {
          projectCategory: values.projectCategory,
          projectStartDate: values.projectStartDate,
        };

      await UserService.updateUserProfile(updateData);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Identity ledger updated.");
    } catch (error: any) {
      toast.error(error.message || "Failed to sync protocol.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-slate-200 bg-white">
      <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
        <UserIcon className="w-5 h-5 text-slate-400" />
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
            Identity Ledger
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {readOnly ? "Read-Only Access" : "Update Operational Parameters"}
          </p>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-6 md:p-8 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Legal First Name
            </Label>
            <Input
              {...form.register("firstName")}
              disabled={readOnly}
              className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Legal Last Name
            </Label>
            <Input
              {...form.register("lastName")}
              disabled={readOnly}
              className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Primary Contact (Tel)
            </Label>
            <Input
              {...form.register("phoneNumber")}
              disabled={readOnly}
              className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Biological Sex
            </Label>
            <Select
              defaultValue={user.sex}
              onValueChange={(val) => form.setValue("sex", val)}
              disabled={readOnly}
            >
              <SelectTrigger className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900">
                <SelectValue placeholder="Select indicator" />
              </SelectTrigger>
              <SelectContent className="rounded-none border border-slate-200 shadow-xl font-mono text-xs uppercase tracking-widest">
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Secondary Contact
            </Label>
            <Input
              {...form.register("contactNumber")}
              disabled={readOnly}
              className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Jurisdiction (Country)
            </Label>
            <Input
              {...form.register("countryOfOperation")}
              disabled={readOnly}
              className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
            />
          </div>
        </div>

        {user.role === "financial_admin" && (
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Institutional Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Registered Corporate Name
                </Label>
                <Input
                  {...form.register("legalBusinessName")}
                  disabled={readOnly}
                  className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  HQ Address
                </Label>
                <Input
                  {...form.register("businessAddress")}
                  disabled={readOnly}
                  className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {user.role === "project_owner" && (
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Developer Operations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Asset Methodology Focus
                </Label>
                <Input
                  {...form.register("projectCategory")}
                  disabled={readOnly}
                  className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Genesis Date
                </Label>
                <Input
                  {...form.register("projectStartDate")}
                  disabled={readOnly}
                  className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {!readOnly && (
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-none bg-slate-900 hover:bg-emerald-900 text-white font-bold uppercase tracking-widest text-[10px] h-12 px-8 transition-colors w-full md:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Commit Ledger Updates
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
