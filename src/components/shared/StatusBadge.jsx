import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  pending_approval: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  posted: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
};

const statusLabels = {
  draft: "Draft",
  pending: "Pending",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  posted: "Posted",
  completed: "Completed",
  active: "Active",
  inactive: "Inactive",
};

export default function StatusBadge({ status, className }) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border",
        statusStyles[status] || statusStyles.draft,
        className
      )}
    >
      {statusLabels[status] || status}
    </Badge>
  );
}