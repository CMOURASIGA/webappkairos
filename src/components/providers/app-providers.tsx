"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";

import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ServiceWorkerRegister />
      <Toaster
        position="top-right"
        toastOptions={{
          className: "border border-white/10 bg-slate-950 text-slate-100",
        }}
      />
    </QueryClientProvider>
  );
}
