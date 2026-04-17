import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { API_BASE_URL, normaliseList, cloudinaryUrl } from "@/lib/api";

const defaultStats = [
  { num: "120+", label: "Students" },
  { num: "22+", label: "Years" },
  { num: "100+", label: "Volunteers" },
];

// Default arrays to empty for skeletons
const initialHeroImages = Array(7).fill("");
const initialGalleryImages = Array(4).fill("");

interface HeroImage {
  imageUrl: string;
  altText?: string;
}

interface AboutImages {
  missionMain: string;
  missionSmall: string;
  visionMain: string;
  visionSmall: string;
}

const Index = () => {
  const [heroImages, setHeroImages] = useState<string[]>(initialHeroImages);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGalleryImages);
  const [about, setAbout] = useState<AboutImages>({
    missionMain:  "",
    missionSmall: "",
    visionMain:   "",
    visionSmall:  "",
  });

  useEffect(() => {
    // Fetch hero images — mirrors old fetchHeroImages() logic
    fetch(`${API_BASE_URL}/activities`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const list = normaliseList<{ images?: HeroImage[] }>(data);

        // Collect all images and find specific ones by altText (same as old HTML)
        const specific: Record<string, string | null> = {
          "volunteer1.JPG": null,
          "extra2.jpg": null,
          "extra3.jpg": null,
          "spardha3.JPG": null,
        };
        const allUrls: string[] = [];

        list.forEach((act) => {
          (act.images || []).forEach((img) => {
            allUrls.push(img.imageUrl);
            if (img.altText && specific[img.altText] !== undefined) {
              specific[img.altText] = img.imageUrl;
            }
          });
        });

        // Fill hero grid and gallery with remaining images
        const usedUrls = new Set(Object.values(specific).filter(Boolean) as string[]);
        let unused = allUrls.filter((u) => !usedUrls.has(u));

        // Helper to pop from unused as fallback
        const getFallback = (key: string) => {
          if (specific[key]) return specific[key];
          const fallback = unused.pop();
          if (fallback) usedUrls.add(fallback);
          return fallback || "";
        };

        // Update about section images picking fallback if specific one is missing
        setAbout({
          missionMain:  getFallback("volunteer1.JPG") as string,
          missionSmall: getFallback("extra2.jpg") as string,
          visionMain:   getFallback("extra3.jpg") as string,
          visionSmall:  getFallback("spardha3.JPG") as string,
        });

        if (unused.length > 0) {
          // Seeded pseudo-random shuffle (mirrors old logic)
          let seed = 42;
          const random = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
          const shuffled = [...unused].sort(() => random() - 0.5);
          setHeroImages(Array.from({ length: 7 }, (_, i) => shuffled[i] || ""));
          setGalleryImages(Array.from({ length: 4 }, (_, i) => shuffled[i + 7] || ""));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Layout>
      {/* HERO */}
      <section className="bg-secondary px-6 py-20 md:py-28">
        <div className="max-w-7xl mx-auto text-center mb-14">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            LITERACY MISSION
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed text-base md:text-lg">
            Literacy Mission started with the vision of adorning the lives of kids residing in the nearby slums with a garland of education so that their childhood would remain as precious as that of other children.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {heroImages.map((src, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden bg-muted ${!src ? "animate-pulse" : ""} ${i === 0 || i === 3 ? "row-span-2" : ""}`}>
              {src && <img src={cloudinaryUrl(src, "card")} alt="" className="w-full h-full object-cover" loading="lazy" />}
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-background px-6 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[3px] text-primary font-semibold text-center mb-3">Get to Know Us</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ fontFamily: "'Playfair Display', serif" }}>Who We Are</h2>

          {/* Block 1 — Our Foundation */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
            <div className="relative flex-shrink-0 w-full md:w-[45%]">
              {about.missionMain ? (
                <img id="about-mission-main" src={cloudinaryUrl(about.missionMain, "hero")} alt="Our Mission" className="rounded-2xl w-full h-[300px] md:h-[380px] object-cover shadow-lg" />
              ) : (
                <div className="rounded-2xl w-full h-[300px] md:h-[380px] bg-muted animate-pulse shadow-lg" />
              )}
              {about.missionSmall ? (
                <img id="about-mission-small" src={cloudinaryUrl(about.missionSmall, "thumb")} alt="" className="absolute -bottom-6 -left-4 w-32 h-32 rounded-xl object-cover shadow-xl border-4 border-background hidden md:block" />
              ) : (
                <div className="absolute -bottom-6 -left-4 w-32 h-32 rounded-xl bg-muted animate-pulse shadow-xl border-4 border-background hidden md:block" />
              )}
            </div>
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">About us</span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Our Foundation</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Abiding by the supreme duty of a human being to help the denizens of darkness emerge out to the bright shimmering sun, Literacy Mission was established in the winters of 2004. The founders of Literacy Mission were students of NITH Mr. Amit Sharma, Mr. Aseem Kapoor, Mr. Ashish Chaudhary and some other fellow mates.
              </p>
              <p className="text-muted-foreground italic leading-relaxed mb-6">
                "Literacy Mission started with the vision of adorning the lives of kids residing in the nearby slums with a garland of education so that their childhood would remain as precious as that of other children."
              </p>
              <a href="#" className="inline-block border border-primary text-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition">
                Learn More →
              </a>
            </div>
          </div>

          {/* Block 2 — Our Background */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="relative flex-shrink-0 w-full md:w-[45%]">
              {about.visionMain ? (
                <img id="about-vision-main" src={cloudinaryUrl(about.visionMain, "hero")} alt="Our Vision" className="rounded-2xl w-full h-[300px] md:h-[380px] object-cover shadow-lg" />
              ) : (
                <div className="rounded-2xl w-full h-[300px] md:h-[380px] bg-muted animate-pulse shadow-lg" />
              )}
              {about.visionSmall ? (
                <img id="about-vision-small" src={cloudinaryUrl(about.visionSmall, "thumb")} alt="" className="absolute -bottom-6 -right-4 w-32 h-32 rounded-xl object-cover shadow-xl border-4 border-background hidden md:block" />
              ) : (
                <div className="absolute -bottom-6 -right-4 w-32 h-32 rounded-xl bg-muted animate-pulse shadow-xl border-4 border-background hidden md:block" />
              )}
            </div>
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">About us</span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Our Background</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These kids come from families labouring at construction sites of which most are immigrants from different states and some from neighbouring countries as well foraging for livelihood. Their quality of life is so impoverished that they couldn't even provide basic necessities for the growth of their children.
              </p>
              <p className="text-muted-foreground italic leading-relaxed mb-6">
                "Every child must know that he is a miracle, that since the beginning of the world there hasn't been, and until the end of the world there will not be, another child like him"
              </p>
              <a href="#" className="inline-block border border-primary text-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition">
                Learn More →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE / PRESENT DAY */}
      <section className="bg-primary px-6 py-20 text-center relative overflow-hidden">
        <p className="text-xs uppercase tracking-[3px] text-primary-foreground/70 font-semibold mb-6">Present Day</p>
        <p className="max-w-3xl mx-auto text-lg md:text-xl leading-[1.8] text-primary-foreground">
          Literacy Mission started in 2004, earned its identity in 2006 when it was made an extra-curricular activity for students at NITH. Since then the Mission has attracted many students of the institute. The daily classes of Literacy Mission are held at the Vivekanand Lecture Hall Complex (VLHC) of NITH which enrolls more than 120 kids and several volunteers.
        </p>
      </section>

      {/* STATS */}
      <section className="bg-background px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[3px] text-primary font-semibold mb-4">Times We've Spent</p>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm leading-relaxed mb-12">
            Literacy Mission organizes various activities throughout the year including educational sessions, cultural events, and skill development programs. Our volunteers work tirelessly to create an engaging and nurturing environment for the children.
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {defaultStats.map((s) => (
              <div key={s.label} className="bg-card rounded-2xl p-8 shadow-sm border border-border">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{s.num}</div>
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="overflow-hidden">
        <div className="flex">
          {galleryImages.map((src, i) => (
            src ? (
              <img key={i} src={cloudinaryUrl(src, "card")} alt="" className="flex-1 min-w-0 h-[250px] object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" loading="lazy" />
            ) : (
              <div key={i} className="flex-1 min-w-0 h-[250px] bg-muted animate-pulse border-r border-background last:border-r-0" />
            )
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
