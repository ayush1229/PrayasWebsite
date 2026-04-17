import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { API_BASE_URL } from "@/lib/api";

interface SocialLinks {
  [platform: string]: string;
}

export interface GlobalConfig {
  logoUrl?: string;
  contactEmail?: string;
  socialLinks?: SocialLinks;
  donation?: {
    upi?: {
      upiId: string;
      qrCodeUrl: string;
    }
  }
}

const ConfigContext = createContext<GlobalConfig | undefined>(undefined);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  return context || {};
};

const Layout = ({ children, globalConfig: externalConfig }: { children: ReactNode; globalConfig?: GlobalConfig }) => {
  const [config, setConfig] = useState<GlobalConfig>(externalConfig || {});

  useEffect(() => {
    if (externalConfig) {
      setConfig(externalConfig);
      return;
    }
    fetch(`${API_BASE_URL}/global`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: GlobalConfig | null) => { if (data) setConfig(data); })
      .catch(() => {});
  }, [externalConfig]);

  return (
    <ConfigContext.Provider value={config}>
      <div className="min-h-screen flex flex-col">
        <Navbar logoUrl={config.logoUrl} />
        <main className="flex-1 pt-16">{children}</main>
        <Footer globalConfig={config} />
      </div>
    </ConfigContext.Provider>
  );
};

export default Layout;
