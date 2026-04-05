import { MotionGroup, MotionItem, MotionSection } from "@/components/motion/section-reveal";
import { projectsData } from "@/utils/data/projects-data";
import ProjectCard from "./project-card";
import { Project } from "@/types/project";

const shuffleArray = (array: Project[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const shuffledProjects = shuffleArray([...projectsData]);

const Projects: React.FC = () => {
  return (
    <MotionSection id="projects" className="relative z-50 my-12 lg:my-24">
      <div className="sticky top-10">
        <div className="absolute -top-3 left-0 h-[80px] w-[80px] translate-x-1/2 rounded-full bg-violet-100 opacity-30 blur-3xl filter"></div>
        <div className="relative flex items-center justify-start">
          <span className="absolute left-0 w-fit rounded-md bg-[#1a1443] px-5 py-3 text-xl text-white">
            PROJECTS
          </span>
          <span className="h-[2px] w-full bg-[#1a1443]"></span>
        </div>
      </div>

      <MotionItem className="mt-10 flex flex-col items-center justify-center">
        <h1 className="text-center text-xl font-bold leading-10 text-white md:font-extrabold lg:text-[2.6rem] lg:leading-[3.5rem]">
          Some of my recent projects
        </h1>
        <p className="mt-3 max-w-2xl text-center text-sm leading-7 text-white/70 md:text-base">
          A curated mix of web builds, product experiments, and interfaces shaped
          for real users.
        </p>
      </MotionItem>

      <MotionGroup className="flex flex-col gap-6 pt-24" stagger={0.14} delayChildren={0.08}>
        {shuffledProjects.slice(0, 4).map((project: Project, index: number) => (
          <MotionItem
            id={`sticky-card-${index + 1}`}
            key={project.name}
            className="sticky-card sticky mx-auto w-full max-w-2xl"
          >
            <div className="box-border flex items-center justify-center rounded shadow-[0_0_30px_0_rgba(0,0,0,0.3)] transition-all duration-500">
              <ProjectCard project={project} />
            </div>
          </MotionItem>
        ))}
      </MotionGroup>
    </MotionSection>
  );
};

export default Projects;
