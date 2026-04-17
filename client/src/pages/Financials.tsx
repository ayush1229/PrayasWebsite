import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { API_BASE_URL, normaliseList, resolveUrl } from "@/lib/api";
import { FileText, Download, ExternalLink, Receipt, HandHeart } from "lucide-react";

interface FinancialDoc {
  _id: string;
  title: string;
  type: "expenditures" | "donations";
  pdfUrl: string;
  year: string; // e.g. "2024-25"
}

type FilterType = "all" | "expenditures" | "donations";

const TYPE_CONFIG = {
  expenditures: {
    label: "Expenditures",
    icon: Receipt,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
  },
  donations: {
    label: "Donations",
    icon: HandHeart,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
} as const;

const SkeletonCard = () => (
  <div className="bg-card rounded-2xl border border-border p-6 animate-pulse">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/5" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
      </div>
      <div className="w-20 h-8 bg-muted rounded-lg shrink-0" />
    </div>
  </div>
);

const Financials = () => {
  const [docs, setDocs] = useState<FinancialDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetch(`${API_BASE_URL}/financials`)
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        const list = normaliseList<FinancialDoc>(data);
        // sort newest first by the 4-digit year prefix
        list.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        setDocs(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? docs : docs.filter((d) => d.type === filter);

  // Group by year string for display
  const byYear = filtered.reduce<Record<string, FinancialDoc[]>>((acc, doc) => {
    if (!acc[doc.year]) acc[doc.year] = [];
    acc[doc.year].push(doc);
    return acc;
  }, {});
  const sortedYears = Object.keys(byYear)
    .sort((a, b) => parseInt(b) - parseInt(a)); // sort by 4-digit prefix descending

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[3px] text-primary font-semibold mb-3">
          Transparency
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold text-foreground mb-5"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Financial Documents
        </h1>
        <p className="max-w-xl mx-auto text-muted-foreground leading-relaxed">
          We believe in complete transparency. Here you will find our annual
          expenditure and donation reports as official PDF documents.
        </p>
      </section>

      {/* Filter tabs */}
      <section className="bg-secondary border-b border-border sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-6 flex gap-2 py-3">
          {(["all", "expenditures", "donations"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f === "all" ? "All Documents" : TYPE_CONFIG[f].label}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="bg-background px-6 py-16 min-h-[50vh]">
        <div className="max-w-4xl mx-auto">

          {/* Skeletons while loading */}
          {loading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-24">
              <FileText size={48} className="mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-destructive font-medium">Failed to load documents.</p>
              <p className="text-muted-foreground text-sm mt-1">
                Please try refreshing the page.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-24">
              <FileText size={48} className="mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-foreground font-semibold">No documents found</p>
              <p className="text-muted-foreground text-sm mt-1">
                {filter === "all"
                  ? "No financial documents have been published yet."
                  : `No ${TYPE_CONFIG[filter as keyof typeof TYPE_CONFIG].label.toLowerCase()} documents yet.`}
              </p>
            </div>
          )}

          {/* Documents grouped by year */}
          {!loading && !error && sortedYears.length > 0 && (
            <div className="space-y-12">
              {sortedYears.map((year) => (
                <div key={year}>
                  {/* Year header */}
                  <div className="flex items-center gap-4 mb-5">
                    <h2
                      className="text-2xl font-bold text-primary"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {year}
                    </h2>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">
                      {byYear[year].length} document{byYear[year].length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {byYear[year].map((doc) => {
                      const cfg = TYPE_CONFIG[doc.type];
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={doc._id}
                          className="group bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 p-5"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Type icon */}
                              <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                                <Icon size={20} className={cfg.color} />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate leading-snug">
                                  {doc.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {cfg.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    FY {year}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={resolveUrl(doc.pdfUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 border border-border hover:border-primary/30 transition-all"
                                title="Open PDF"
                              >
                                <ExternalLink size={13} />
                                <span className="hidden sm:inline">View</span>
                              </a>
                              <a
                                href={resolveUrl(doc.pdfUrl)}
                                download
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                                title="Download PDF"
                              >
                                <Download size={13} />
                                <span className="hidden sm:inline">Download</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Financials;
