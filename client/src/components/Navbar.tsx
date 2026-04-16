import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

const activityTypes = ["Spardha", "Prayas", "GyanManthan", "Extra"] as const;

const moreLinks = [
  { href: "https://nith.ac.in/", label: "NIT Hamirpur", external: true },
  { to: "/volunteers", label: "Volunteers", external: false },
];

/** Returns open/close handlers with a delay so the mouse can move into the panel */
function useDropdown(delayMs = 120) {
  const [isOpen, setIsOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (timer.current) clearTimeout(timer.current);
    setIsOpen(true);
  };
  const close = () => {
    timer.current = setTimeout(() => setIsOpen(false), delayMs);
  };
  const forceClose = () => {
    if (timer.current) clearTimeout(timer.current);
    setIsOpen(false);
  };

  return { isOpen, open, close, forceClose };
}

const Navbar = ({ logoUrl }: { logoUrl?: string }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activities = useDropdown();
  const more = useDropdown();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const logo = logoUrl || "/logo.png";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Prayas Logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-lg font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
            LITERACY MISSION
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-7">
          <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
            Home
          </Link>

          {/* Activities dropdown */}
          <div
            className="relative"
            onMouseEnter={activities.open}
            onMouseLeave={activities.close}
          >
            <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${location.pathname.startsWith("/activities") ? "text-primary" : "text-muted-foreground"}`}>
              Activities <ChevronDown size={13} className={`transition-transform duration-200 ${activities.isOpen ? "rotate-180" : ""}`} />
            </button>
            {/* Invisible bridge: fills the gap between button and panel */}
            {activities.isOpen && <div className="absolute left-0 right-0 h-3 top-full" />}
            {activities.isOpen && (
              <div
                className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-background border border-border rounded-xl shadow-lg py-2 min-w-[160px] z-50"
                onMouseEnter={activities.open}
                onMouseLeave={activities.close}
              >
                {activityTypes.map((type) => (
                  <Link
                    key={type}
                    to={`/activities/${type}`}
                    className="block px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                    onClick={activities.forceClose}
                  >
                    {type}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/achievements" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/achievements") ? "text-primary" : "text-muted-foreground"}`}>
            Achievements
          </Link>
          <Link to="/contact" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/contact") ? "text-primary" : "text-muted-foreground"}`}>
            Contact Us
          </Link>

          {/* More dropdown */}
          <div
            className="relative"
            onMouseEnter={more.open}
            onMouseLeave={more.close}
          >
            <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary text-muted-foreground`}>
              More <ChevronDown size={13} className={`transition-transform duration-200 ${more.isOpen ? "rotate-180" : ""}`} />
            </button>
            {more.isOpen && <div className="absolute left-0 right-0 h-3 top-full" />}
            {more.isOpen && (
              <div
                className="absolute top-[calc(100%+8px)] right-0 bg-background border border-border rounded-xl shadow-lg py-2 min-w-[160px] z-50"
                onMouseEnter={more.open}
                onMouseLeave={more.close}
              >
                {moreLinks.map((l) =>
                  l.external ? (
                    <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                      className="block px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary transition-colors">
                      {l.label}
                    </a>
                  ) : (
                    <Link key={l.label} to={l.to!}
                      className="block px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                      onClick={more.forceClose}>
                      {l.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          <Link
            to="/contact"
            className="ml-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
          >
            Donate ↗
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-4 space-y-1">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">Home</Link>
          <div>
            <p className="py-2 text-sm font-semibold text-foreground">Activities</p>
            <div className="pl-4 space-y-1">
              {activityTypes.map((type) => (
                <Link key={type} to={`/activities/${type}`} onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-primary">
                  {type}
                </Link>
              ))}
            </div>
          </div>
          <Link to="/achievements" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">Achievements</Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">Contact Us</Link>
          <Link to="/volunteers" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">Volunteers</Link>
          <a href="https://nith.ac.in/" target="_blank" rel="noreferrer" className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">NIT Hamirpur</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
