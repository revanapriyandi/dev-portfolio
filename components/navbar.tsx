"use client";

import { personalData } from "@/utils/data/personal-data";
import { sendGAEvent } from "@next/third-parties/google";
import { IconBrandGithub } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/#about", label: "ABOUT" },
  { href: "/#experience", label: "EXPERIENCE" },
  { href: "/#skills", label: "SKILLS" },
  { href: "/#education", label: "EDUCATION" },
  { href: "/#repository", label: "REPOSITORIES" },
  { href: "/#projects", label: "PROJECTS" },
];

const trackClick = (href: string) => {
  sendGAEvent("event", "buttonClicked", { value: href });
};

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/5 bg-[#0d1224]/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="hidden items-center justify-between py-4 md:flex">
        <div className="flex flex-shrink-0 items-center">
          <Link
            href="/"
            onClick={() => trackClick("/")}
            className="bg-gradient-to-r from-[#16f2b3] to-cyan-200 bg-clip-text text-3xl font-bold text-transparent"
          >
            <span>&lt;</span>
            {personalData.name}
            <span> /&gt;</span>
          </Link>
        </div>

        <ul
          className="mt-0 hidden h-auto max-h-screen w-auto flex-row items-center gap-1 text-sm opacity-100 lg:flex"
          id="navbar-default"
        >
          {navItems.map((item, index) => (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 + index * 0.06 }}
            >
              <Link
                className="group block rounded-full px-4 py-2 no-underline outline-none hover:no-underline"
                href={item.href}
              >
                <div className="relative text-sm tracking-[0.2em] text-white/80 transition-colors duration-300 group-hover:text-[#16f2b3]">
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-[#16f2b3] transition-transform duration-300 group-hover:scale-x-100" />
                </div>
              </Link>
            </motion.li>
          ))}
          <motion.li
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.42 }}
          >
            <Link
              className="rounded-full border border-white/10 bg-white/5 p-3 no-underline outline-none transition-all duration-300 hover:border-[#16f2b3]/40 hover:bg-[#16f2b3]/10 hover:no-underline"
              href={personalData.socialLinks.github}
              onClick={() => trackClick(personalData.socialLinks.github)}
              target="_blank"
            >
              <IconBrandGithub size={24} />
            </Link>
          </motion.li>
        </ul>
      </div>
    </motion.nav>
  );
}

export default Navbar;
