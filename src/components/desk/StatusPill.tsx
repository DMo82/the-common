const styles: Record<string, string> = {
  new: "bg-[#102820] text-white",
  claimed: "bg-[#102820] text-white",
  in_review: "bg-[#102820] text-white",
  pending: "bg-[#E8EDE9] text-[#4A5A51]",
  changes_requested: "bg-[#E8EDE9] text-[#4A5A51]",
  escalated: "bg-[#FBE3E3] text-[#8A1C1C]",
  approved: "bg-[#306830] text-white",
  published: "bg-[#306830] text-white",
  declined: "bg-[#FBE3E3] text-[#8A1C1C]",
  refused: "bg-[#FBE3E3] text-[#8A1C1C]",
  removed: "bg-[#8A1C1C] text-white",
  closed: "bg-[#E8EDE9] text-[#4A5A51]",
  appealed: "bg-[#FFE9D1] text-[#7A3E00]",
  open: "bg-[#FFE9D1] text-[#7A3E00]",
};

const labels: Record<string, string> = {
  new: "New",
  claimed: "Claimed",
  in_review: "In review",
  pending: "Waiting",
  changes_requested: "Waiting on owner",
  escalated: "Escalated",
  approved: "Approved",
  published: "Live",
  declined: "Declined",
  refused: "Not approved",
  removed: "Removed",
  closed: "Closed",
  appealed: "Appealed",
  open: "Open",
};

export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  const style = styles[key] || "bg-[#E8EDE9] text-[#4A5A51]";
  const label = labels[key] || status;
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${style}`}>{label}</span>;
}

export function SlaChip({ hours }: { hours: number }) {
  if (hours < 0) return <span className="inline-block rounded-full bg-[#8A1C1C] px-2 py-0.5 text-xs font-semibold text-white">Overdue {Math.abs(hours)}h</span>;
  if (hours < 4) return <span className="inline-block rounded-full bg-[#FBE3E3] px-2 py-0.5 text-xs font-semibold text-[#8A1C1C]">{hours}h left</span>;
  if (hours < 24) return <span className="inline-block rounded-full bg-[#FFE9D1] px-2 py-0.5 text-xs font-semibold text-[#7A3E00]">Due soon</span>;
  return <span className="inline-block rounded-full bg-[#E4F1E4] px-2 py-0.5 text-xs font-semibold text-[#1F5A26]">On time</span>;
}
