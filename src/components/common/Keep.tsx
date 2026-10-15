import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart, Share2 } from "lucide-react";
import { useCommon } from "@/lib/common/store";

export function Keep({ id, next, title, overlay = false }: { id: string; next: string; title?: string; overlay?: boolean }) {
  const navigate = useNavigate();
  const account = useCommon((state) => state.account);
  const favourited = useCommon((state) => (state.favourites ?? []).includes(id));
  const toggleFavourite = useCommon((state) => state.toggleFavourite);
  const [note, setNote] = useState("");

  function favourite() {
    if (!account) {
      void navigate({ to: "/login", search: { next } });
      return;
    }
    toggleFavourite(id);
  }

  async function share() {
    const url = new URL(next, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "The Common", url });
      } catch {
        /* The person closed the share sheet. */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setNote("Link copied");
    } catch {
      setNote(url);
    }
  }

  return (
    <div className={overlay ? "absolute right-3 top-3 z-10 flex items-center gap-2" : "mt-3 flex items-center gap-2"}>
      <button
        type="button"
        onClick={favourite}
        aria-label={favourited ? "Remove favourite" : "Add to favourites"}
        aria-pressed={favourited}
        className={`grid h-9 w-9 place-items-center rounded-full ${overlay ? "bg-white/25 text-white backdrop-blur-sm" : `border border-line bg-white ${favourited ? "text-primary" : "text-[#6d8176]"}`}`}
      >
        <Heart size={16} strokeWidth={1.75} fill={favourited ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={() => void share()}
        aria-label="Share"
        className={`grid h-9 w-9 place-items-center rounded-full ${overlay ? "bg-white/25 text-white backdrop-blur-sm" : "border border-line bg-white text-[#6d8176]"}`}
      >
        <Share2 size={16} strokeWidth={1.75} />
      </button>
      {note ? <p className="text-xs text-muted">{note}</p> : null}
    </div>
  );
}
