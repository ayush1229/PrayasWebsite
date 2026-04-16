import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Mail, Phone } from "lucide-react";
import { API_BASE_URL, normaliseList } from "@/lib/api";

interface Person {
  _id?: string;
  name: string;
  roleType?: string;       // 'Faculty' | 'Student'
  designation?: string;
  department?: string;
  organization?: string;
  year?: number;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  isActive?: boolean;
  displayOrder?: number;
}

const Contact = () => {
  const [faculty, setFaculty] = useState<Person[]>([]);
  const [students, setStudents] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/people`)
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        const list = normaliseList<Person>(data);
        const active = list.filter((p) => p.isActive !== false);

        setFaculty(
          active
            .filter((p) => p.roleType === "Faculty")
            .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
        );
        setStudents(
          active
            .filter((p) => p.roleType === "Student")
            .sort((a, b) => (b.year || 0) - (a.year || 0) || (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-secondary px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[3px] text-primary font-semibold mb-3">Directory</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Contact Us
        </h1>
        <p className="max-w-xl mx-auto text-muted-foreground leading-relaxed">
          Need to reach out? Get in direct touch with our faculty coordinators or student volunteers below.
        </p>
      </section>

      <section className="bg-secondary px-6 py-12 pb-24">
        <div className="max-w-5xl mx-auto">
          {loading && (
            <div className="text-center text-muted-foreground py-20">Fetching coordinators from database...</div>
          )}
          {error && (
            <div className="text-center text-destructive py-20">Error loading directory. Please try again later.</div>
          )}

          {!loading && !error && (
            <>
              {/* Faculty Cards */}
              <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                Faculty Coordinators
              </h2>
              {faculty.length === 0 ? (
                <p className="text-center text-muted-foreground mb-16">No faculty coordinators found.</p>
              ) : (
                <div className="flex flex-wrap gap-8 justify-center mb-20">
                  {faculty.map((f) => {
                    const parts = [f.department || f.designation, f.organization].filter(Boolean);
                    const dept = parts.length > 0 ? parts.join(", ") : "N/A";
                    return (
                      <div
                        key={f._id || f.name}
                        className="bg-card rounded-2xl p-9 shadow-sm border border-border text-center w-full sm:w-[300px] hover:-translate-y-1 transition-transform duration-300"
                      >
                        <h3 className="text-lg font-bold text-foreground mb-1">{f.name}</h3>
                        <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-5">{dept}</p>
                        <div className="flex flex-col gap-3 items-center">
                          {f.email && (
                            <a href={`mailto:${f.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <Mail size={14} className="text-primary flex-shrink-0" />
                              {f.email}
                            </a>
                          )}
                          {f.phone && (
                            <a href={`tel:${f.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <Phone size={14} className="text-primary flex-shrink-0" />
                              {f.phone}
                            </a>
                          )}
                          {f.secondaryPhone && (
                            <a href={`tel:${f.secondaryPhone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <Phone size={14} className="text-primary flex-shrink-0" />
                              {f.secondaryPhone}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Student Table */}
              <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                Student Contacts
              </h2>
              {students.length === 0 ? (
                <p className="text-center text-muted-foreground">No student contacts found.</p>
              ) : (
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-secondary">
                          <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold rounded-tl-2xl">Name</th>
                          <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email Address</th>
                          <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold rounded-tr-2xl hidden sm:table-cell">Mobile</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => (
                          <tr key={s._id || s.name} className="border-t border-border hover:bg-secondary/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-foreground">{s.name}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {s.email ? (
                                <a href={`mailto:${s.email}`} className="hover:text-primary transition-colors">{s.email}</a>
                              ) : (
                                <span className="text-border">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                              {s.phone || <span className="text-border">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
