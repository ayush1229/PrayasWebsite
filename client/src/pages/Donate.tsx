import Layout from "@/components/Layout";
import { CreditCard, Landmark, User, FileText, MapPin, Code, Hash } from "lucide-react";

const Donate = () => {
  const bankDetails = [
    { label: "Branch", value: "State Bank of India, NIT Hamirpur (H.P.)", icon: MapPin },
    { label: "IFSC", value: "SBIN0010367", icon: Code },
    { label: "MICR", value: "177002003", icon: Hash },
    { label: "Bank Code", value: "10367", icon: CreditCard },
    { label: "Account Name", value: "Literacy Mission NITH", icon: User },
    { label: "Account Signatories", value: "Anjali Maurya and Jay Pratap", icon: FileText },
    { label: "Account Number", value: "30172923495", icon: Landmark },
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="bg-secondary px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[3px] text-primary font-semibold mb-3">Support Our Mission</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Donate Now
        </h1>
        <p className="max-w-xl mx-auto text-muted-foreground leading-relaxed">
          Your contribution helps us provide quality education and resources to children in need. 
          Every donation makes a significant difference in their lives.
        </p>
      </section>

      {/* Bank Details Section */}
      <section className="bg-background px-6 py-12 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-8 border-b border-border bg-secondary/30">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Landmark className="text-primary" />
                Bank Account Details
              </h2>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {bankDetails.map((detail) => (
                  <div key={detail.label} className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                      <detail.icon size={14} className="text-primary/70" />
                      {detail.label}
                    </p>
                    <p className="text-base font-medium text-foreground">{detail.value}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-border">
                <button 
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                  onClick={() => window.open('https://razorpay.com/', '_blank')} // Placeholder or actual link if known
                >
                  Pay Now
                  <span className="text-xl">↗</span>
                </button>
                <p className="text-center text-sm text-muted-foreground mt-4 italic">
                  * Secure payment options available through our official channels.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10">
            <h3 className="text-lg font-bold text-primary mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Important Note:</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              After making a donation, please share a screenshot of the transaction with our student coordinators 
              via the <a href="/contact" className="text-primary hover:underline font-semibold">Contact Page</a> to receive your acknowledgement receipt.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;
