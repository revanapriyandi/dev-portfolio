// @flow strict

import { MotionGroup, MotionItem, MotionSection } from "@/components/motion/section-reveal";
import { personalData } from "@/utils/data/personal-data";
import Image from "next/image";

const AboutSection: React.FC = () => {
  return (
    <MotionSection id="about" className="my-16 lg:my-24">
      <div className="pointer-events-none absolute -left-10 top-6 h-28 w-28 rounded-full bg-[#16f2b3]/10 blur-3xl" />

      <div className="hidden lg:flex flex-col items-center absolute top-16 -right-8">
        <span className="bg-[#1a1443] w-fit text-white rotate-90 p-2 px-5 text-xl rounded-md">
          ABOUT ME
        </span>
        <span className="h-36 w-[2px] bg-[#1a1443]"></span>
      </div>

      <MotionGroup className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        <MotionItem className="order-2 lg:order-1">
          <p className="mb-5 text-xl font-medium uppercase text-[#16f2b3]">
            Who I am?
          </p>
          <p className="max-w-2xl text-sm leading-7 text-gray-200 lg:text-lg">
            {personalData.description}
          </p>
        </MotionItem>

        <MotionItem className="order-1 flex justify-center lg:order-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#16f2b3]/20 to-violet-500/20 blur-2xl" />
            <Image
              src={personalData.profile}
              width={280}
              height={280}
              alt={personalData.name}
              className="relative rounded-[2rem] border border-white/10 bg-white/5 object-cover shadow-[0_30px_80px_-45px_rgba(22,242,179,0.6)] transition-all duration-700 grayscale hover:-translate-y-1 hover:grayscale-0 hover:scale-[1.03] cursor-pointer"
            />
          </div>
        </MotionItem>
      </MotionGroup>
    </MotionSection>
  );
};

export default AboutSection;
