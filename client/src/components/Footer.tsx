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
              { to: "/volunteers", label: "Volunteers" },
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
          {socials.length > 0 ? (
            <div className="flex gap-3 flex-wrap">
              {socials.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center text-sm hover:bg-primary transition"
                >
                  {socialIcons[platform.toLowerCase()] || platform.charAt(0).toUpperCase()}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-70">Connect with us on social media to stay updated.</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-background/20 text-center text-sm opacity-50">
        © {new Date().getFullYear()} Prayas — Literacy Mission, NIT Hamirpur. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
