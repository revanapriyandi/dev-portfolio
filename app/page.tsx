"use client";

import { MotionConfig } from "framer-motion";
import { Hero, Nav } from "@/components/home/hero";
import Splash from "@/components/home/splash";
import { About, Contact, Education, Experience, Footer, Projects, QuickConnect, Repos, Ticker } from "@/components/home/sections";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <Splash />
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <About />
        <Experience />
        <Projects />
        <Repos />
        <Education />
        <Contact />
        <QuickConnect />
      </main>
      <Footer />
    </MotionConfig>
  );
}
