"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Token } from "@/lib/token";
import { ServiceProvider } from "@/providers/service.provider";
import { AccountContextProvider } from "@/modules/account/contexts/account-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const session = useSession();
  const accessToken = Token.get();

  useEffect(() => {
    const cleanSession = () => {
      Token.clean();
      router.push("/");
      toast.error("You are not logged in, please sign in with your account.");
    };

    if (!accessToken || session.status == "unauthenticated") {
      return cleanSession();
    }
  }, [session, router, accessToken]);

  return (
    <ServiceProvider accessToken={accessToken}>
      <AccountContextProvider>{children}</AccountContextProvider>
    </ServiceProvider>
  );
}
