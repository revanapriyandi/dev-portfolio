// @flow strict

import { MotionItem, MotionSection } from "@/components/motion/section-reveal";
import { skillsData } from "@/utils/data/skills";
import { skillsImage } from "@/utils/skill-image";
import Image from "next/image";
import Marquee from "react-fast-marquee";

const Skills: React.FC = () => {
  return (
    <MotionSection
      id="skills"
      className="relative z-50 my-12 border-t border-[#25213b] lg:my-24"
    >
      <div className="absolute left-[42%] top-6 h-[100px] w-[100px] translate-x-1/2 rounded-full bg-violet-100 opacity-20 blur-3xl filter"></div>

      <div className="flex justify-center -translate-y-[1px]">
        <div className="w-3/4">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        </div>
      </div>

      <MotionItem className="flex justify-center py-6 lg:py-8">
        <div className="flex items-center">
          <span className="h-[2px] w-24 bg-[#1a1443]"></span>
          <span className="w-fit rounded-md bg-[#1a1443] px-5 py-2 text-xl text-white">
            Skills
          </span>
          <span className="h-[2px] w-24 bg-[#1a1443]"></span>
        </div>
      </MotionItem>

      <MotionItem className="my-12 w-full">
        <Marquee
          gradient={false}
          speed={80}
          pauseOnHover
          pauseOnClick
          delay={0}
          play
          direction="left"
        >
          {skillsData.map((skill, id) => (
            <div
              className="group relative m-3 flex h-fit w-36 min-w-fit cursor-pointer flex-col items-center justify-center rounded-2xl transition-all duration-500 hover:-translate-y-2 sm:m-5"
              key={id}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#16f2b3]/0 to-violet-500/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative h-full w-full rounded-2xl border border-[#1f223c] bg-[#11152c]/90 shadow-none transition-all duration-500 group-hover:border-violet-500 group-hover:shadow-[0_20px_40px_-30px_rgba(139,92,246,0.75)]">
                <div className="flex -translate-y-[1px] justify-center">
                  <div className="w-3/4">
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 p-6">
                  <div className="h-8 sm:h-10">
                    <Image
                      src={skillsImage(skill)?.src}
                      alt={skill}
                      width={40}
                      height={40}
                      className="h-full w-auto rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-white sm:text-lg">{skill}</p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </MotionItem>
    </MotionSection>
  );
};

export default Skills;
