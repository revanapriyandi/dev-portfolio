"use client";

import { personalData } from "@/utils/data/personal-data";
import { sendGAEvent } from "@next/third-parties/google";
import { motion } from "framer-motion";
import Link from "next/link";
import { IoStar } from "react-icons/io5";

const trackClick = (href: string) => {
  sendGAEvent("event", "buttonClicked", { value: href });
};

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative border-t border-[#353951] bg-[#0d1224]/80 text-white backdrop-blur-xl"
    >
      <div className="w-full px-6 py-6 sm:px-12 lg:py-10">
        <div className="flex justify-center -z-40">
          <div className="absolute top-0 h-[1px] w-1/2 bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-white/75 md:text-left">
            Copyright Developer Portfolio by{" "}
            <Link
              target="_blank"
              href={personalData.socialLinks.github}
              onClick={() => trackClick(personalData.socialLinks.github)}
              className="text-[#16f2b3]"
            >
              {personalData.name}
            </Link>
          </p>
          <div className="flex items-center gap-5">
            <Link
              target="_blank"
              href={personalData.socialLinks.github}
              onClick={() => trackClick(personalData.socialLinks.github)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 uppercase transition-all duration-300 hover:border-[#16f2b3]/40 hover:text-[#16f2b3]"
            >
              <IoStar />
              <span>Star</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
