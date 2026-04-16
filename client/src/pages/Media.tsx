import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { API_BASE_URL, normaliseList } from "@/lib/api";
import { Play, ChevronLeft, ChevronRight, Youtube } from "lucide-react";

interface MediaItem {
  _id: string;
  title: string;
  youtubeUrl: string;
  tag: string;
  order: number;
}

/** Convert any YouTube URL to the embed URL */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;

    if (u.hostname === "youtu.be") {
      videoId = u.pathname.slice(1);
    } else if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com"
    ) {
      if (u.pathname === "/watch") {
        videoId = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/embed/")) {
        return url; // already embed
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.replace("/shorts/", "");
      }
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  } catch {
    return null;
  }
}

/** Horizontal scroll row with prev/next buttons */
const VideoRow = ({ videos }: { videos: MediaItem[] }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const SCROLL_AMOUNT = 360;

  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [videos]);

  const scroll = (dir: "left" | "right") => {
    rowRef.current?.scrollBy({
      left: dir === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group/row">
      {/* Left arrow */}
      {canLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Scroll container */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {videos.map((v) => {
          const embedUrl = toEmbedUrl(v.youtubeUrl);
          return (
            <div
              key={v._id}
              className="shrink-0 w-[300px] md:w-[340px] rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
            >
              {embedUrl ? (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={embedUrl}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[190px] bg-muted">
                  <p className="text-xs text-muted-foreground">Invalid URL</p>
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                  {v.title}
                </p>
                <a
                  href={v.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
                  Watch on YouTube
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right arrow */}
      {canRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
};

const SkeletonRow = () => (
  <div className="flex gap-4 overflow-hidden pb-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="shrink-0 w-[300px] md:w-[340px] rounded-2xl bg-muted animate-pulse" style={{ height: 230 }} />
    ))}
  </div>
);

const Media = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/media`)
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        const list = normaliseList<MediaItem>(data);
        list.sort((a, b) => a.order - b.order || a.tag.localeCompare(b.tag));
        setItems(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Group by tag, preserving insertion order of first occurrence
  let tagOrder: string[] = [];
  const byTag: Record<string, MediaItem[]> = {};
  for (const item of items) {
    if (!byTag[item.tag]) {
      byTag[item.tag] = [];
      tagOrder.push(item.tag);
    }
    byTag[item.tag].push(item);
  }

  // Force specified tags to the end
  const tailNames = ["activities", "health camp"];
  const headTags = tagOrder.filter(t => !tailNames.includes(t.toLowerCase()));
  const tailTags = tagOrder.filter(t => tailNames.includes(t.toLowerCase()));
  tagOrder = [...headTags, ...tailTags];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary px-6 py-20 text-center">
        <h1
          className="text-4xl md:text-5xl font-bold text-foreground mb-5"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Media
        </h1>
        <p className="max-w-xl mx-auto text-muted-foreground leading-relaxed">
          Relive our events, sessions, and stories through our curated video
          collection.
        </p>
      </section>

      {/* Content */}
      <section className="bg-background px-6 py-16 min-h-[50vh]">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Skeleton */}
          {loading && (
            <>
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="h-7 w-40 bg-muted rounded animate-pulse mb-6" />
                  <SkeletonRow />
                </div>
              ))}
            </>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-24">
              <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-4 fill-muted-foreground/30"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              <p className="text-destructive font-medium">Failed to load videos.</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && items.length === 0 && (
            <div className="text-center py-24">
              <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-4 fill-muted-foreground/30"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              <p className="text-foreground font-semibold">No videos yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Check back soon for our latest media.
              </p>
            </div>
          )}

          {/* Tag sections */}
          {!loading && !error && tagOrder.map((tag) => (
            <div key={tag}>
              {/* Tag heading */}
              <div className="flex items-center gap-4 mb-6">
                <h2
                  className="text-xl md:text-2xl font-bold text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {tag}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {byTag[tag].length} video{byTag[tag].length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Horizontally scrollable row with navigation arrows */}
              <VideoRow videos={byTag[tag]} />
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Media;
