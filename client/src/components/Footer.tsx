import { Link } from "react-router-dom";
import { GlobalConfig } from "./Layout";

const socialIcons: Record<string, string> = {
  instagram: "◉",
  twitter: "𝕏",
  x: "𝕏",
  facebook: "f",
  linkedin: "in",
};

const Footer = ({ globalConfig }: { globalConfig?: GlobalConfig }) => {
  const email = globalConfig?.contactEmail;
  const logo = globalConfig?.logoUrl || "/logo.png";
  const socials = globalConfig?.socialLinks
    ? Object.entries(globalConfig.socialLinks).filter(([, url]) => url)
    : [];

  return (
    <footer className="bg-foreground text-background py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Literacy Mission" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-lg font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
              LITERACY MISSION
            </span>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            Empowering lives through education since 2004. Join us in our mission to create a brighter future.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest opacity-60">Quick Links</h4>
          <div className="space-y-2">
            {[
              { to: "/", label: "Home" },
              { to: "/achievements", label: "Achievements" },
              { to: "/activities/GyanManthan", label: "Activities" },
              { to: "/financials", label: "Financial Docs" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="block text-sm opacity-70 hover:opacity-100 transition">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest opacity-60">Contact</h4>
          <div className="text-sm opacity-70 leading-relaxed space-y-1">
            {email ? (
              <a href={`mailto:${email}`} className="block hover:opacity-100 transition">{email}</a>
            ) : (
              <p>NIT Hamirpur<br />Hamirpur, Himachal Pradesh<br />India – 177005</p>
            )}
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest opacity-60">Follow Us</h4>
          <div className="flex gap-3 flex-wrap">
            <a
              href="https://www.instagram.com/literacy_mission_nith/"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition"
              title="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a
              href="https://m.youtube.com/user/literacynith"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition"
              title="YouTube"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
            <a
              href="https://www.facebook.com/share/18GeX5gBDE/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition"
              title="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            
            {socials.filter(([platform]) => !['instagram', 'youtube', 'facebook'].includes(platform.toLowerCase())).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center text-sm hover:bg-primary transition"
                title={platform}
              >
                {socialIcons[platform.toLowerCase()] || platform.charAt(0).toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-background/20 text-center text-sm opacity-50">
        © {new Date().getFullYear()} Prayas — Literacy Mission, NIT Hamirpur. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
