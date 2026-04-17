import { useState } from "react";
import Layout from "@/components/Layout";
import { CreditCard, Landmark, User, FileText, MapPin, Code, Hash, Copy, Check, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Donate = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const upiId = "85092936696@sbi";

  const bankDetails = [
    { label: "Branch", value: "State Bank of India, NIT Hamirpur (H.P.)", icon: MapPin },
    { label: "IFSC", value: "SBIN0010367", icon: Code },
    { label: "MICR", value: "177002003", icon: Hash },
    { label: "Bank Code", value: "10367", icon: CreditCard },
    { label: "Account Name", value: "Literacy Mission NITH", icon: User },
    { label: "Account Signatories", value: "Anjali Maurya and Jay Pratap", icon: FileText },
    { label: "Account Number", value: "30172923495", icon: Landmark },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

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
                <Dialog>
                  <DialogTrigger asChild>
                    <button 
                      className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                    >
                      Pay Now
                      <span className="text-xl">↗</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white border-2 border-primary/20 shadow-2xl overflow-hidden p-0">
                    <div className="bg-primary/5 py-6 px-6 border-b border-primary/10">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Scan to Pay via UPI
                        </DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground">
                          Scan the QR code below using any UPI app to donate.
                        </DialogDescription>
                      </DialogHeader>
                    </div>
                    
                    <div className="p-8 flex flex-col items-center gap-6">
                      <div className="relative group p-4 bg-white rounded-2xl border-2 border-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.05)] transition-all hover:border-primary/30">
                        <img 
                          src="/qr-code.png" 
                          alt="UPI QR Code" 
                          className="w-64 h-64 object-contain rounded-lg"
                        />
                        <div className="absolute inset-0 border-2 border-primary/5 rounded-2xl pointer-events-none" />
                      </div>
                      
                      <div className="w-full space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-center text-muted-foreground">
                          UPI ID
                        </p>
                        <div className="flex items-center gap-2 bg-secondary/50 p-4 rounded-xl border border-primary/10 transition-colors hover:bg-secondary">
                          <code className="flex-1 text-center font-bold text-lg text-foreground tracking-wide">
                            {upiId}
                          </code>
                          <button 
                            onClick={copyToClipboard}
                            className="p-2.5 rounded-lg bg-background border border-border text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                            title="Copy UPI ID"
                          >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-2">
                        <span className="flex items-center gap-1"><QrCode size={12} /> Google Pay</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>PhonePe</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>Paytm</span>
                      </div>
                    </div>
                    
                    <div className="bg-secondary/30 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-70">
                        Thank you for your generous contribution
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
                
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
