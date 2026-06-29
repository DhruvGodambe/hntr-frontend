"use client";

import { ArrowRight } from "lucide-react";
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
      <SignupStepHeader step={2} showProgress />

      <div className="mb-5">
        <h2 className="font-display text-heading-sm font-bold text-t4">
          User Information
        </h2>
        <p className="mt-1 text-label leading-relaxed text-t2">
          Complete your profile to access the terminal.
        </p>
      </div>

      <div className="space-y-4">
        <FormField id="sponsor" label="Sponsor">
          <Input
            id="sponsor"
            readOnly
            value="@username"
            className="bg-e3 font-mono text-label text-t2"
          />
        </FormField>

        <FormField id="username" label="Username / Referral ID">
          <Input
            id="username"
            placeholder="e.g. ALPHA"
            className="font-mono text-label"
          />
        </FormField>

        <FormField id="fullName" label="Full Name">
          <Input
            id="fullName"
            placeholder="Enter as shown on identification"
            className="text-label"
          />
        </FormField>

        <FormField id="nationality" label="Nationality">
          <Select>
            <SelectTrigger className="h-10 text-label">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {nationalityOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-label">
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
              className="w-16 shrink-0 font-mono text-label"
            />
            <Input
              id="phone"
              placeholder="0000 0000"
              className="flex-1 font-mono text-label"
            />
          </div>
        </FormField>

        <FormField id="email" label="Email Address">
          <Input
            id="email"
            type="email"
            placeholder="institutional@gmail.com"
            className="text-label"
          />
        </FormField>
      </div>

      <button
        type="button"
        className="signup-continue-btn mt-6"
        onClick={onContinue}
      >
        Continue
        <ArrowRight className="size-4" strokeWidth={2} />
      </button>

      <p className="mt-4 border-t border-bd0 pt-4 text-center font-mono text-micro uppercase tracking-[0.06em] text-t0">
        Encrypted Session ID: {signupSessionId} — End-to-End Security Active
      </p>
    </div>
  );
}
