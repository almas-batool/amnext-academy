// ─────────────────────────────────────────────────────────────
//  src/app/(marketing)/page.tsx
//  Public landing page — hero, features, pricing, CTA.
// ─────────────────────────────────────────────────────────────
import { HeroSection }       from "@/components/landing/hero";
import { FeaturesSection }   from "@/components/landing/features";
import { CertsSection }      from "@/components/landing/certs-section";
import { PricingSection }    from "@/components/landing/pricing";
import { FAQSection }        from "@/components/landing/faq";
import { LandingFooter }     from "@/components/landing/footer";
import { LandingNav }        from "@/components/landing/nav";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <CertsSection />
      <PricingSection />
      <FAQSection />
      <LandingFooter />
    </div>
  );
}

