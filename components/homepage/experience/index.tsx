// @flow strict
import { MotionGroup, MotionItem, MotionSection } from "@/components/motion/section-reveal";
import { experiences } from "@/utils/data/experience";
import Image from "next/image";
import { BsPersonWorkspace } from "react-icons/bs";
import experience from "../../../assets/lottie/code.json";
import AnimationLottie from "../../helper/animation-lottie";
import GlowCard from "../../helper/glow-card";

const Experience: React.FC = () => {
  return (
    <MotionSection
      id="experience"
      className="relative z-50 my-12 border-t border-[#25213b] lg:my-24"
    >
      <Image
        src="/section.svg"
        alt="Hero"
        width={1572}
        height={795}
        className="absolute top-0 -z-10 opacity-80"
      />

      <MotionItem className="flex justify-center py-6 lg:py-8">
        <div className="flex items-center">
          <span className="h-[2px] w-24 bg-[#1a1443]"></span>
          <span className="w-fit rounded-md bg-[#1a1443] px-5 py-2 text-xl text-white">
            Experiences
          </span>
          <span className="h-[2px] w-24 bg-[#1a1443]"></span>
        </div>
      </MotionItem>

      <MotionGroup className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-2 lg:gap-16">
        <MotionItem className="flex items-start justify-center">
          <div className="w-full h-full rounded-[2rem] border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm">
            <AnimationLottie animationPath={experience} />
          </div>
        </MotionItem>

        <MotionGroup className="flex flex-col gap-6" stagger={0.14} delayChildren={0.08}>
          {experiences.map((experienceItem) => (
            <MotionItem key={experienceItem.id}>
              <GlowCard identifier={`experience-${experienceItem.id}`}>
                <div className="relative p-3">
                  <Image
                    src="/blur-23.svg"
                    alt="Hero"
                    width={1080}
                    height={200}
                    className="absolute bottom-0 opacity-80"
                  />
                  <div className="flex justify-center">
                    <p className="text-xs text-[#16f2b3] sm:text-sm">
                      {experienceItem.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-x-8 px-3 py-5">
                    <div className="text-violet-500 transition-all duration-300 hover:scale-125">
                      <BsPersonWorkspace size={36} />
                    </div>
                    <div>
                      <p className="mb-2 text-base font-medium uppercase sm:text-xl">
                        {experienceItem.title}
                      </p>
                      <p className="text-sm text-white/75 sm:text-base">
                        {experienceItem.company}
                      </p>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </MotionItem>
          ))}
        </MotionGroup>
      </MotionGroup>
    </MotionSection>
  );
};

export default Experience;
