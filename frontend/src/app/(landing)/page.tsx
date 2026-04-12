import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { BentoFeatures } from "@/components/bento-features"
import { PricingSection } from "@/components/pricing-section"

export default function Home() {
  return (
    <main className="dark">
      <Header />
      <HeroSection />
      <BentoFeatures />
      <PricingSection />
    </main>
  )
}
