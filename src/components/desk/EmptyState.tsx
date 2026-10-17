export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-[#E8EDE9] bg-white p-6 text-center">
      <p className="font-medium text-[#102820]">{title}</p>
      <p className="mt-1 text-sm text-[#5C6F64]">{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#FBE3E3] bg-[#FBE3E3] p-4">
      <p className="text-sm text-[#8A1C1C]">{message}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
      <p className="text-sm text-[#5C6F64]">Loading…</p>
    </div>
  );
}
