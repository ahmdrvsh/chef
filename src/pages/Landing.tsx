import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingHowItWorks } from '../components/landing/LandingHowItWorks';
import { LandingSmartCooking } from '../components/landing/LandingSmartCooking';
import { LandingShowcase } from '../components/landing/LandingShowcase';
import { LandingFAQ } from '../components/landing/LandingFAQ';
import { LandingCTA } from '../components/landing/LandingCTA';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 font-vazir antialiased selection:bg-emerald-700 selection:text-white overflow-x-hidden">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingSmartCooking />
        <LandingShowcase />
        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
