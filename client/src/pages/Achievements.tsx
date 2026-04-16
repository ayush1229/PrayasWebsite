import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { API_BASE_URL, normaliseList } from "@/lib/api";

const staticStats = [
  { num: "50+", label: "JNV Selections" },
  { num: "15+", label: "Medical Success Stories" },
  { num: "100+", label: "Academic Achievements" },
  { num: "20+", label: "Training Programs" },
];

interface Achievement {
  _id?: string;
  year: number;
  category?: string;
  title: string;
  description?: string;
}

const Achievements = () => {
  const [timeline, setTimeline] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/achievements`)
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        const list = normaliseList<Achievement>(data).sort((a, b) => b.year - a.year);
        setTimeline(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-secondary px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[3px] text-primary font-semibold mb-3">Wall of Fame</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Our Achievements
        </h1>
        <p className="max-w-xl mx-auto text-muted-foreground leading-relaxed">
          A chronological journey of our milestones, breakthroughs, and the lives we've impacted.
        </p>
      </section>

      {/* Stats */}
      <section className="bg-secondary px-6 pb-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {staticStats.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-6 text-center shadow-sm border border-border">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {s.num}
              </div>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline from API */}
      <section className="bg-secondary px-6 py-16">
        {loading && (
          <div className="text-center text-muted-foreground py-20">Loading Timeline...</div>
        )}
        {error && (
          <div className="text-center text-destructive py-20">Failed to load achievements.</div>
        )}
        {!loading && !error && timeline.length === 0 && (
          <div className="text-center text-muted-foreground py-20">No achievements posted yet.</div>
        )}
        {!loading && !error && timeline.length > 0 && (
          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border" />
            {timeline.map((item, i) => (
              <div
                key={item._id || `${item.year}-${i}`}
                className={`relative flex flex-col md:flex-row items-start mb-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"} pl-14 md:pl-0`}>
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                    <span className="text-primary font-bold text-sm">{item.year}</span>
                    {item.category && (
                      <span className="ml-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                        {item.category}
                      </span>
                    )}
                    <h3 className="text-lg font-bold mt-2 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background top-6" />
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Achievements;
