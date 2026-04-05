"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
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

  const loaderDuration = 8 * 160;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), loaderDuration);
    return () => clearTimeout(timer);
  }, [loaderDuration]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <MultiStepLoader initialLoading={isLoading} />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <main className="relative z-40 min-h-screen w-full px-6 text-white sm:px-12">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
