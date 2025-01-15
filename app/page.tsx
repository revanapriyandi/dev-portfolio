"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/navbar";
import ScrollToTop from "@/components/helper/scroll-to-top";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";
import { MultiStepLoader } from "@/components/helper/loader";

const HeroSection = dynamic(() => import("@/components/homepage/hero-section"));
const AboutSection = dynamic(() => import("@/components/homepage/about"));
const Experience = dynamic(() => import("@/components/homepage/experience"));
const Skills = dynamic(() => import("@/components/homepage/skills"));
const Projects = dynamic(() => import("@/components/homepage/projects"));
const Education = dynamic(() => import("@/components/homepage/education"));
const RepositoryPage = dynamic(() => import("@/components/homepage/repository"));
const ContactSection = dynamic(() => import("@/components/homepage/contact"));
const Certificate = dynamic(() => import("@/components/homepage/certificate"));

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  const loaderDuration = 9 * 200;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), loaderDuration);
    return () => clearTimeout(timer);
  }, [loaderDuration]);

  if (isLoading) {
    return <MultiStepLoader initialLoading={isLoading} />;
  }



  return (
    <>
      <main className="min-h-screen relative z-40 mx-auto px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
        <Navbar />
        <div suppressHydrationWarning>
          <HeroSection />
          <AboutSection />
          <Experience />
          <Skills />
          <Projects />
          <Education />
          <Certificate />
          <RepositoryPage />
          <ContactSection />
        </div>
        <ScrollToTop />
      </main>
      <MobileNav />
      <Footer />
    </>
  );
}