import type { ReactNode } from "react";
import { ConnectWizardProvider } from "@/features/auth";
import { SignupWizard } from "@/features/auth/components/signup-wizard";
import { ThemeProvider } from "./theme-provider";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ConnectWizardProvider>
        {children}
        <SignupWizard />
      </ConnectWizardProvider>
    </ThemeProvider>
  );
}

export { ThemeProvider } from "./theme-provider";
