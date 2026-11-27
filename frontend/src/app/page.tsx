import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OrderSteps from "@/components/OrderSteps";
import FeaturedWorksCarousel from "@/components/FeaturedWorksCarousel";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main style={{ backgroundColor: "#F3F0EE", minHeight: "100vh", overflowX: "clip" }}>
      <Navbar />
      <HeroSection />
      <OrderSteps />
      <FeaturedWorksCarousel />
      <TestimonialCarousel />
      <LocationSection />
      <Footer />
    </main>
  );
}
