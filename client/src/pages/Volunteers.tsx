import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { API_BASE_URL, normaliseList } from "@/lib/api";

interface Person {
  _id?: string;
  name: string;
  designation?: string;
  roleType?: string;
  profileImageUrl?: string;
}

const fallbackImg = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face";

const Volunteers = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/people`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setPeople(normaliseList<Person>(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const faculty = people.filter((p) =>
    p.roleType?.toLowerCase().includes("faculty") ||
    p.designation?.toLowerCase().includes("faculty") ||
    p.designation?.toLowerCase().includes("professor") ||
    p.designation?.toLowerCase().includes("dr.")
  );
  const volunteers = people.filter((p) => !faculty.includes(p));

  return (
    <Layout>
      <section className="bg-secondary px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[3px] text-primary font-semibold mb-3">The Core</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Our Volunteers
        </h1>
        <p className="max-w-xl mx-auto text-muted-foreground leading-relaxed">
          Meet the dedicated team, driven by compassion and guided by experienced leadership, working collectively towards a unified goal.
        </p>
      </section>

      <section className="bg-secondary px-6 py-12 pb-20">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center text-muted-foreground py-20">Loading...</div>
          ) : (
            <>
              {faculty.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Faculty Incharge
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto mb-16">
                    {faculty.map((f) => (
                      <div key={f._id || f.name} className="bg-card rounded-2xl p-6 text-center shadow-sm border border-border">
                        <img
                          src={f.profileImageUrl || fallbackImg}
                          alt={f.name}
                          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                          loading="lazy"
                        />
                        <h3 className="font-bold text-lg">{f.name}</h3>
                        <p className="text-sm text-muted-foreground">{f.designation || f.roleType}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                Volunteers
              </h2>
              {volunteers.length === 0 ? (
                <p className="text-center text-muted-foreground">No volunteers listed yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {volunteers.map((v) => (
                    <div key={v._id || v.name} className="bg-card rounded-2xl p-5 text-center shadow-sm border border-border">
                      <img
                        src={v.profileImageUrl || fallbackImg}
                        alt={v.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                        loading="lazy"
                      />
                      <h3 className="font-semibold text-sm">{v.name}</h3>
                      <p className="text-xs text-muted-foreground">{v.designation || v.roleType}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Volunteers;
