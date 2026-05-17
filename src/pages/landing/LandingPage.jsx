import Navbar          from '../../components/layout/Navbar';
import Footer          from '../../components/layout/Footer';
import HeroSection     from './sections/HeroSection';
import HowItWorksSection from './sections/HowItWorksSection';
import StatsSection    from './sections/StatsSection';
import PartnersSection from './sections/PartnersSection';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <StatsSection />
        <PartnersSection />
      </main>
      <Footer />
    </>
  );
}
