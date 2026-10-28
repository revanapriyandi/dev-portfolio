"use client";

import { MotionConfig } from "framer-motion";
import { Hero, Nav } from "@/components/home/hero";
import { About, Contact, Education, Experience, Footer, Projects, Repos, Ticker } from "@/components/home/sections";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
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
      </main>
      <Footer />
    </MotionConfig>
  );
}
