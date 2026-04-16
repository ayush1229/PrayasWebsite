import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { API_BASE_URL, normaliseList } from "@/lib/api";

const defaultStats = [
  { num: "120+", label: "Students" },
  { num: "18+", label: "Years" },
  { num: "50+", label: "Volunteers" },
];

const defaultHeroImages = [
  "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1594608661623-aa0bd3a69799?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=300&fit=crop",
];

const defaultGalleryImages = [
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1594608661623-aa0bd3a69799?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=500&h=350&fit=crop",
];

// Default about images (same as old HTML fallbacks)
const DEFAULT_MISSION_MAIN  = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=400&fit=crop";
const DEFAULT_MISSION_SMALL = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=300&fit=crop";
const DEFAULT_VISION_MAIN   = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop";
const DEFAULT_VISION_SMALL  = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop";

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
  const [heroImages, setHeroImages] = useState<string[]>(defaultHeroImages);
  const [galleryImages, setGalleryImages] = useState<string[]>(defaultGalleryImages);
  const [about, setAbout] = useState<AboutImages>({
    missionMain:  DEFAULT_MISSION_MAIN,
    missionSmall: DEFAULT_MISSION_SMALL,
    visionMain:   DEFAULT_VISION_MAIN,
    visionSmall:  DEFAULT_VISION_SMALL,
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

        // Update about section images if found
        setAbout({
          missionMain:  specific["volunteer1.JPG"] ?? DEFAULT_MISSION_MAIN,
          missionSmall: specific["extra2.jpg"]     ?? DEFAULT_MISSION_SMALL,
          visionMain:   specific["extra3.jpg"]     ?? DEFAULT_VISION_MAIN,
          visionSmall:  specific["spardha3.JPG"]   ?? DEFAULT_VISION_SMALL,
        });

        // Fill hero grid and gallery with remaining images
        const usedUrls = new Set(Object.values(specific).filter(Boolean));
        const unused = allUrls.filter((u) => !usedUrls.has(u));

        if (unused.length >= 4) {
          // Seeded pseudo-random shuffle (mirrors old logic)
          let seed = 42;
          const random = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
          const shuffled = [...unused].sort(() => random() - 0.5);
          setHeroImages(shuffled.slice(0, 7));
          setGalleryImages(shuffled.slice(0, 4));
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
            PARASPARAM BHAW YANTU
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed text-base md:text-lg">
            Literacy Mission started with the vision of adorning the lives of kids residing in the nearby slums with a garland of education so that their childhood would remain as precious as that of other children.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {heroImages.map((src, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden ${i === 0 || i === 3 ? "row-span-2" : ""}`}>
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
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
              <img
                id="about-mission-main"
                src={about.missionMain}
                alt="Our Mission"
                className="rounded-2xl w-full h-[300px] md:h-[380px] object-cover shadow-lg"
              />
              <img
                id="about-mission-small"
                src={about.missionSmall}
                alt=""
                className="absolute -bottom-6 -left-4 w-32 h-32 rounded-xl object-cover shadow-xl border-4 border-background hidden md:block"
              />
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
              <img
                id="about-vision-main"
                src={about.visionMain}
                alt="Our Vision"
                className="rounded-2xl w-full h-[300px] md:h-[380px] object-cover shadow-lg"
              />
              <img
                id="about-vision-small"
                src={about.visionSmall}
                alt=""
                className="absolute -bottom-6 -right-4 w-32 h-32 rounded-xl object-cover shadow-xl border-4 border-background hidden md:block"
              />
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
          Literacy Mission earned its identity in 2006 when it was made an extra-curricular activity for students at NITH. Since then the Mission has attracted many students of the institute. The daily classes of Literacy Mission are held at the Vivekanand Lecture Hall Complex (VLHC) of NITH which enrolls more than 120 kids and several volunteers.
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
            <img key={i} src={src} alt="" className="flex-1 min-w-0 h-[250px] object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" loading="lazy" />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
