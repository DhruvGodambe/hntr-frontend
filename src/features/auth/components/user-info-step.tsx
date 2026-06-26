"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nationalityOptions, signupSessionId } from "@/features/auth/data/signup-data";
import { SignupStepHeader } from "./signup-step-header";

type UserInfoStepProps = {
  onContinue: () => void;
};

export function UserInfoStep({ onContinue }: UserInfoStepProps) {
  return (
    <div className="flex flex-col">
      <SignupStepHeader step={2} />

      <div className="mb-4">
        <h2 className="font-display text-[14px] font-bold text-t4">
          Step 2 of 3: User Information
        </h2>
        <p className="mt-0.5 text-[9px] text-t2">
          Complete your profile to access the terminal.
        </p>
      </div>

      <div className="space-y-3">
        <FormField id="sponsor" label="Sponsor">
          <Input
            id="sponsor"
            readOnly
            value="@username"
            className="h-8 bg-e3 font-mono text-[10px] text-t1"
          />
        </FormField>

        <FormField id="username" label="Username / Referral ID">
          <Input
            id="username"
            placeholder="e.g. ALPHA"
            className="h-8 font-mono text-[10px]"
          />
        </FormField>

        <FormField id="fullName" label="Full Name">
          <Input
            id="fullName"
            placeholder="Enter as shown on identification"
            className="h-8 text-[10px]"
          />
        </FormField>

        <FormField id="nationality" label="Nationality">
          <Select>
            <SelectTrigger className="h-8 text-[10px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {nationalityOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-[10px]">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="phone" label="Phone Number">
          <div className="flex gap-2">
            <Input
              id="phoneCode"
              defaultValue="+00"
              className="h-8 w-14 shrink-0 font-mono text-[10px]"
            />
            <Input
              id="phone"
              placeholder="0000 0000"
              className="h-8 flex-1 font-mono text-[10px]"
            />
          </div>
        </FormField>

        <FormField id="email" label="Email Address">
          <Input
            id="email"
            type="email"
            placeholder="institutional@gmail.com"
            className="h-8 text-[10px]"
          />
        </FormField>
      </div>

      <Button
        className="mt-5 h-9 w-full font-mono text-[9px] uppercase tracking-[0.06em]"
        onClick={onContinue}
      >
        Continue
        <ArrowRight className="size-3.5" />
      </Button>

      <p className="mt-3 border-t border-border pt-3 text-center font-mono text-[7px] uppercase tracking-[0.04em] text-t0">
        Encrypted Session ID: {signupSessionId} — End-to-End Security Active
      </p>
    </div>
  );
}
