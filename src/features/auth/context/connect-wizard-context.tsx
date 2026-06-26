"use client";

import * as React from "react";

type ConnectWizardContextValue = {
  isOpen: boolean;
  step: 1 | 2 | 3;
  isConnected: boolean;
  openWizard: () => void;
  closeWizard: () => void;
  setStep: (step: 1 | 2 | 3) => void;
  connectWallet: () => void;
  completeOnboarding: () => void;
};

const ConnectWizardContext = React.createContext<ConnectWizardContextValue | null>(
  null,
);

export function ConnectWizardProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [isConnected, setIsConnected] = React.useState(false);

  const openWizard = React.useCallback(() => {
    setStep(isConnected ? 2 : 1);
    setIsOpen(true);
  }, [isConnected]);

  const closeWizard = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const connectWallet = React.useCallback(() => {
    setIsConnected(true);
    setStep(2);
  }, []);

  const completeOnboarding = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = React.useMemo(
    () => ({
      isOpen,
      step,
      isConnected,
      openWizard,
      closeWizard,
      setStep,
      connectWallet,
      completeOnboarding,
    }),
    [
      isOpen,
      step,
      isConnected,
      openWizard,
      closeWizard,
      connectWallet,
      completeOnboarding,
    ],
  );

  return (
    <ConnectWizardContext.Provider value={value}>
      {children}
    </ConnectWizardContext.Provider>
  );
}

export function useConnectWizard() {
  const context = React.useContext(ConnectWizardContext);
  if (!context) {
    throw new Error("useConnectWizard must be used within ConnectWizardProvider");
  }
  return context;
}
