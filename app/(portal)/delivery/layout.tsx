"use client";

import { ReactNode } from "react";
import DashboardShell from "@/components/layout/DashboardShell";

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="DELIVERY_AGENT">{children}</DashboardShell>;
}
