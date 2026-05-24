"use client";

import { ReactNode } from "react";
import DashboardShell from "@/components/layout/DashboardShell";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="CUSTOMER">{children}</DashboardShell>;
}
