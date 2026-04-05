/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { personalData } from "@/utils/data/personal-data";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BsGithub,
  BsInstagram,
  BsLinkedin,
  BsStackOverflow,
} from "react-icons/bs";
import { MdDownload } from "react-icons/md";
import { RiContactsFill } from "react-icons/ri";
import { SiFreelancer } from "react-icons/si";

interface MicrolinkPreview {
  title: string;
  description: string;
  image: {
    url: string;
  };
}

const heroHighlights = ["Next.js", "Laravel", "React", "Docker"];

const HeroSection: React.FC = () => {
  const [namePreview, setNamePreview] = useState<MicrolinkPreview | null>(null);
  const [designationPreview, setDesignationPreview] =
    useState<MicrolinkPreview | null>(null);
  const [isNameHovered, setIsNameHovered] = useState(false);
  const [isDesignationHovered, setIsDesignationHovered] = useState(false);

  const socialLinks = [
    {
      href: personalData.socialLinks.github,
      label: "GitHub",
      icon: <BsGithub size={28} />,
    },
    {
      href: personalData.socialLinks.linkedIn,
      label: "LinkedIn",
      icon: <BsLinkedin size={28} />,
    },
    {
      href: personalData.socialLinks.fastwork,
      label: "Fastwork",
      icon: <SiFreelancer size={28} />,
    },
    {
      href: personalData.socialLinks.instagram,
      label: "Instagram",
      icon: <BsInstagram size={28} />,
    },
    {
      href: personalData.socialLinks.stackOverflow,
      label: "Stack Overflow",
      icon: <BsStackOverflow size={28} />,
    },
  ];

  const fetchPreview = async (
    url: string,
    setPreview: React.Dispatch<React.SetStateAction<MicrolinkPreview | null>>
  ) => {
    try {
      const response = await axios.get(
        `https://api.microlink.io?url=${encodeURIComponent(url)}`
      );
      if (response.data.status === "success") {
        const data: MicrolinkPreview = {
          title: response.data.data.title,
          description: response.data.data.description,
          image: {
            url: response.data.data.image.url,
          },
        };
        setPreview(data);
      }
    } catch (error) {
      console.error("Error fetching preview:", error);
    }
  };

  useEffect(() => {
    if (isNameHovered && !namePreview) {
      fetchPreview(personalData.socialLinks.github, setNamePreview);
    }

    if (isDesignationHovered && !designationPreview) {
      fetchPreview(personalData.socialLinks.fastwork, setDesignationPreview);
    }
  }, [isNameHovered, isDesignationHovered]);

  return (
    <motion.section
      className="relative flex flex-col items-center justify-between py-6 lg:py-14"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute -left-10 top-12 hidden h-40 w-40 rounded-full bg-[#16f2b3]/10 blur-3xl lg:block"
        animate={{ y: [-12, 10, -12], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-6 top-32 hidden h-48 w-48 rounded-full bg-violet-500/10 blur-3xl lg:block"
        animate={{ y: [10, -16, 10], opacity: [0.28, 0.55, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <Image
        src="/hero.svg"
        alt="Hero"
        width={1572}
        height={795}
        className="absolute -top-[98px] -z-10 opacity-90"
      />

      <div className="grid grid-cols-1 items-center gap-y-10 lg:grid-cols-2 lg:gap-12">
        <div className="order-1 flex flex-col items-start justify-center p-2 pb-16 md:pb-10 lg:-mt-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-[#16f2b3]" />
            Open to freelance, remote, and product work
          </motion.div>

          <motion.h1
            className="relative text-3xl font-bold leading-10 text-white md:font-extrabold lg:text-[2.8rem] lg:leading-[3.7rem]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.14 }}
          >
            Hello, <br />
            This is{" "}
            <span
              className="relative cursor-pointer text-[#16f2b3]"
              onMouseEnter={() => setIsNameHovered(true)}
              onMouseLeave={() => setIsNameHovered(false)}
            >
              {personalData.name}
              <AnimatePresence>
                {isNameHovered && namePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full z-50 mt-3 w-64 rounded-2xl border border-white/10 bg-[#0f172a]/95 p-3 text-white shadow-2xl shadow-[#16f2b3]/10 backdrop-blur-xl md:w-80 lg:w-96"
                  >
                    <Image
                      src={namePreview.image.url}
                      alt={personalData.name}
                      className="w-full rounded-xl"
                      width={200}
                      height={100}
                    />
                    <p className="mt-3 text-sm font-bold">{namePreview.title}</p>
                    <p className="mt-1 text-sm text-white/80">
                      {namePreview.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
            {`, I'm a Professional `}
            <span
              className="relative cursor-pointer text-red-400"
              onMouseEnter={() => setIsDesignationHovered(true)}
              onMouseLeave={() => setIsDesignationHovered(false)}
            >
              {personalData.designation}
              <AnimatePresence>
                {isDesignationHovered && designationPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full z-50 mt-3 w-64 rounded-2xl border border-white/10 bg-[#0f172a]/95 p-3 text-white shadow-2xl shadow-violet-500/10 backdrop-blur-xl md:w-80 lg:w-96"
                  >
                    <Image
                      src={designationPreview.image.url}
                      alt={personalData.designation}
                      className="w-full rounded-xl"
                      width={200}
                      height={100}
                    />
                    <p className="mt-3 text-sm font-bold">
                      {designationPreview.title}
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      {designationPreview.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
            .
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
          >
            {personalData.description}
          </motion.p>

          <motion.div
            className="my-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
          >
            {socialLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                aria-label={item.label}
                className="rounded-full border border-white/10 bg-white/5 p-3 text-[#16f2b3] transition-all duration-300 hover:-translate-y-1 hover:border-[#16f2b3]/40 hover:bg-[#16f2b3]/10"
              >
                {item.icon}
              </Link>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34 }}
          >
            <Link
              href="#contact"
              className="rounded-full bg-gradient-to-r from-[#16f2b3] to-violet-500 p-[1px] transition-all duration-300 hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2 rounded-full bg-[#0d1224] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white md:px-8 md:py-4 md:text-sm">
                <span>Contact me</span>
                <RiContactsFill size={16} />
              </span>
            </Link>

            <Link
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16f2b3] to-violet-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition-all duration-300 hover:-translate-y-1 md:px-8 md:py-4 md:text-sm"
              role="button"
              target="_blank"
              href={personalData.resume}
            >
              <span>Get Resume</span>
              <MdDownload size={16} />
            </Link>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {heroHighlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/80 backdrop-blur"
              >
                {highlight}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="order-2 relative"
          initial={{ opacity: 0, x: 24, rotateX: 12 }}
          animate={{ opacity: 1, x: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -8 }}
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#16f2b3]/10 via-transparent to-violet-500/20 blur-2xl" />
          <div className="relative rounded-3xl border border-[#1b2c68a0] bg-gradient-to-r from-[#0d1224] to-[#0a0d37] shadow-[0_25px_80px_-40px_rgba(22,242,179,0.45)]">
            <div className="flex flex-row">
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#16f2b3] to-violet-600"></div>
              <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
            </div>
            <div className="flex items-center justify-between px-4 py-5 lg:px-8">
              <div className="flex flex-row space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-orange-400"></div>
                <div className="h-3 w-3 rounded-full bg-green-200"></div>
              </div>
              <span className="text-xs uppercase tracking-[0.32em] text-white/40">
                profile.ts
              </span>
            </div>
            <div className="overflow-hidden border-t-[2px] border-indigo-900 px-4 py-4 lg:px-8 lg:py-8">
              <code className="font-mono text-xs md:text-sm lg:text-base">
                <div className="blink">
                  <span className="mr-2 text-[#16f2b3]">const</span>
                  <span className="mr-2 text-white">coder</span>
                  <span className="mr-2 text-[#16f2b3]">=</span>
                  <span className="text-gray-400">{"{"}</span>
                </div>
                <div>
                  <span className="mr-2 ml-4 text-white lg:ml-8">name:</span>
                  <span className="text-gray-400">{`'`}</span>
                  <span className="text-amber-300">{personalData.name}</span>
                  <span className="text-gray-400">{`',`}</span>
                </div>
                <div className="mr-2 ml-4 lg:ml-8">
                  <span className="text-white">skills:</span>
                  <span className="text-gray-400">{`['`}</span>
                  <span className="text-amber-300">Laravel</span>
                  <span className="text-gray-400">{`', `}</span>
                  <span className="text-amber-300">CodeIgniter</span>
                  <span className="text-gray-400">{`', `}</span>
                  <span className="text-amber-300">React</span>
                  <span className="text-gray-400">{`', `}</span>
                  <span className="text-amber-300">TypeScript</span>
                  <span className="text-gray-400">{"', '"}</span>
                  <span className="text-amber-300">Next.js</span>
                  <span className="text-gray-400">{"', '"}</span>
                  <span className="text-amber-300">Express</span>
                  <span className="text-gray-400">{"', '"}</span>
                  <span className="text-amber-300">MySql</span>
                  <span className="text-gray-400">{"', '"}</span>
                  <span className="text-amber-300">MongoDB</span>
                  <span className="text-gray-400">{"', '"}</span>
                  <span className="text-amber-300">Docker</span>
                  <span className="text-gray-400">{"', '"}</span>
                  <span className="text-amber-300">AWS</span>
                  <span className="text-gray-400">{"'],"}</span>
                </div>
                <div>
                  <span className="mr-2 ml-4 text-white lg:ml-8">hardWorker:</span>
                  <span className="text-orange-400">true</span>
                  <span className="text-gray-400">,</span>
                </div>
                <div>
                  <span className="mr-2 ml-4 text-white lg:ml-8">
                    quickLearner:
                  </span>
                  <span className="text-orange-400">true</span>
                  <span className="text-gray-400">,</span>
                </div>
                <div>
                  <span className="mr-2 ml-4 text-white lg:ml-8">
                    problemSolver:
                  </span>
                  <span className="text-orange-400">true</span>
                  <span className="text-gray-400">,</span>
                </div>
                <div>
                  <span className="mr-2 ml-4 text-green-400 lg:ml-8">
                    hireable:
                  </span>
                  <span className="text-orange-400">function</span>
                  <span className="text-gray-400">{"() {"}</span>
                </div>
                <div>
                  <span className="mr-2 ml-8 text-orange-400 lg:ml-16">
                    return
                  </span>
                  <span className="text-gray-400">{`(`}</span>
                </div>
                <div>
                  <span className="ml-12 text-cyan-400 lg:ml-24">this.</span>
                  <span className="mr-2 text-white">hardWorker</span>
                  <span className="text-amber-300">&amp;&amp;</span>
                </div>
                <div>
                  <span className="ml-12 text-cyan-400 lg:ml-24">this.</span>
                  <span className="mr-2 text-white">problemSolver</span>
                  <span className="text-amber-300">&amp;&amp;</span>
                </div>
                <div>
                  <span className="ml-12 text-cyan-400 lg:ml-24">this.</span>
                  <span className="mr-2 text-white">skills.length</span>
                  <span className="mr-2 text-amber-300">&gt;=</span>
                  <span className="text-orange-400">5</span>
                </div>
                <div>
                  <span className="mr-2 ml-8 text-gray-400 lg:ml-16">{`);`}</span>
                </div>
                <div>
                  <span className="ml-4 text-gray-400 lg:ml-8">{`};`}</span>
                </div>
                <div>
                  <span className="text-gray-400">{`};`}</span>
                </div>
              </code>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
