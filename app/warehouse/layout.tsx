"use client";

import { ReactNode } from "react";
import DashboardShell from "@/components/layout/DashboardShell";

export default function WarehouseLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="WAREHOUSE_MANAGER">{children}</DashboardShell>;
}
