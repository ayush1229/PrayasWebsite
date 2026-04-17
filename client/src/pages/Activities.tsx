import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { API_BASE_URL, normaliseList, cloudinaryUrl } from "@/lib/api";

type ActivityType = "Spardha" | "Prayas" | "GyanManthan" | "Extra";

const activityMeta: Record<ActivityType, { tag: string; quote: string }> = {
  GyanManthan: {
    tag: "Annual Educational Fair",
    quote: '"The world is but a canvas to our imagination and innovation!"',
  },
  Spardha: {
    tag: "Annual Sports Fair",
    quote: '"Wondered what\'s the best part of the game? The opportunity to play!"',
  },
  Prayas: {
    tag: "Annual Cultural-Cum-Charity Festival",
    quote: '"Art is an effort to create, beside the real world, a more humane world."',
  },
  Extra: { tag: "Activity Gallery", quote: "" },
};

const allTypes: ActivityType[] = ["Spardha", "Prayas", "GyanManthan", "Extra"];

interface ActivityImage {
  imageUrl: string;
  altText?: string;
}

interface Activity {
  activityName: string;
  year: number;
  tags?: string[];
  images?: ActivityImage[];
}

const Activities = () => {
  const { type } = useParams<{ type?: string }>();
  const currentType = (allTypes.includes(type as ActivityType) ? type : "GyanManthan") as ActivityType;

  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const meta = activityMeta[currentType];

  useEffect(() => {
    document.title = `${currentType} | Literacy Mission`;
    setLoading(true);
    setError(false);

    fetch(`${API_BASE_URL}/activities`)
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        const list = normaliseList<Activity>(data);
        const filtered = list
          .filter((a) => a.activityName === currentType)
          .sort((a, b) => b.year - a.year);
        setItems(filtered);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [currentType]);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[3px] text-primary font-semibold mb-3">{meta.tag}</p>
        <h1
          className="text-4xl md:text-5xl font-bold text-foreground mb-5"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {currentType === "Extra" ? "EXTRA CURRICULARS" : currentType.toUpperCase()}
        </h1>
        {meta.quote && (
          <p className="max-w-xl mx-auto text-muted-foreground italic text-lg">{meta.quote}</p>
        )}

        {/* Sub-nav tabs */}
        <div className="flex gap-3 justify-center mt-10 flex-wrap">
          {allTypes.map((t) => (
            <Link
              key={t}
              to={`/activities/${t}`}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition ${
                t === currentType
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section className="bg-background px-6 md:px-20 py-14 min-h-[40vh]">
        {loading && (
          <div className="text-center text-muted-foreground py-20">Loading...</div>
        )}
        {error && (
          <div className="text-center text-destructive py-20">Failed to load content.</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="text-center text-muted-foreground py-20">More updates incoming!</div>
        )}
        {!loading && !error && items.map((item) => (
          <div key={item.year} className="mb-16">
            <h2
              className="text-3xl font-bold mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {item.year}{" "}
              {item.tags && item.tags.length > 0 && (
                <span className="text-xs font-normal text-primary uppercase tracking-widest ml-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {item.tags.join(", ")}
                </span>
              )}
            </h2>

            {item.images && item.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {item.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={cloudinaryUrl(img.imageUrl, "card")}
                    alt={img.altText || ""}
                    className="w-full h-56 object-cover rounded-2xl bg-secondary"
                    loading="lazy"
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No images available for this year.</p>
            )}
          </div>
        ))}
      </section>
    </Layout>
  );
};

export default Activities;
