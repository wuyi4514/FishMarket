import { useLayoutEffect, useRef, useState } from "react";
import { isNearLatest } from "./chat-interactions";

export function useTimeline(roomId: string | undefined, count: number, working: boolean) {
  const ref = useRef<HTMLElement>(null);
  const following = useRef(true);
  const previous = useRef({ roomId, count });
  const [away, setAway] = useState(false);
  const [unread, setUnread] = useState(0);
  useLayoutEffect(() => {
    const changedRoom = roomId !== previous.current.roomId;
    if (changedRoom) { following.current = true; setAway(false); setUnread(0); }
    if (following.current) {
      if (count) ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "auto" });
    } else if (count > previous.current.count) {
      const added = count - previous.current.count;
      setUnread(current => current + added); setAway(true);
    }
    previous.current = { roomId, count };
  }, [roomId, count, working]);
  function onScroll() {
    if (!ref.current) return;
    following.current = isNearLatest(ref.current); setAway(!following.current);
    if (following.current) setUnread(0);
  }
  function latest() {
    following.current = true; setAway(false); setUnread(0);
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "auto" });
  }
  return { ref, away, unread, onScroll, latest };
}
