/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { personalData } from "@/utils/data/personal-data";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsGithub, BsInstagram, BsLinkedin, BsStackOverflow } from "react-icons/bs";
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

const HeroSection: React.FC = () => {
  const [namePreview, setNamePreview] = useState<MicrolinkPreview | null>(null);
  const [designationPreview, setDesignationPreview] = useState<MicrolinkPreview | null>(null);
  const [isNameHovered, setIsNameHovered] = useState(false);
  const [isDesignationHovered, setIsDesignationHovered] = useState(false);

  const fetchPreview = async (
    url: string,
    setPreview: React.Dispatch<React.SetStateAction<MicrolinkPreview | null>>
  ) => {
    try {
      const response = await axios.get(`https://api.microlink.io?url=${url}`);
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
    <section className="relative flex flex-col items-center justify-between py-4 lg:py-12">
      <Image
        src="/hero.svg"
        alt="Hero"
        width={1572}
        height={795}
        className="absolute -top-[98px] -z-10"
      />

      <div className="grid grid-cols-1 items-start lg:grid-cols-2 lg:gap-12 gap-y-8">
        <div className="order-1 lg:order-1 flex flex-col items-start justify-center p-2 pb-20 md:pb-10 lg:pt-10">
          <h1 className="text-3xl font-bold leading-10 text-white md:font-extrabold lg:text-[2.6rem] lg:leading-[3.5rem] relative">
            Hello, <br />
            This is{" "}
            <span
              className="relative text-[#16f2b3] cursor-pointer"
              onMouseEnter={() => setIsNameHovered(true)}
              onMouseLeave={() => setIsNameHovered(false)}
            >
              {personalData.name}
              {isNameHovered && namePreview && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-lg bg-gray-800 text-white shadow-lg p-3 z-50 md:w-80 lg:w-96">
                  <Image
                    src={namePreview.image.url}
                    alt={personalData.name}
                    className="rounded-lg w-full"
                    width={200}
                    height={100}
                  />
                  <p className="text-sm mt-2 font-bold">{namePreview.title}</p>
                  <p className="text-sm">{namePreview.description}</p>
                </div>
              )}
            </span>
            {`, I'm a Professional `}
            <span
              className="relative text-red-500 cursor-pointer"
              onMouseEnter={() => setIsDesignationHovered(true)}
              onMouseLeave={() => setIsDesignationHovered(false)}
            >
              {personalData.designation}
              {isDesignationHovered && designationPreview && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-lg bg-gray-800 text-white shadow-lg p-3 z-50 md:w-80 lg:w-96">
                  <Image
                    src={designationPreview.image.url}
                    alt={personalData.designation}
                    className="rounded-lg w-full"
                    width={200}
                    height={100}
                  />
                  <p className="text-sm mt-2 font-bold">{designationPreview.title}</p>
                  <p className="text-sm">{designationPreview.description}</p>
                </div>
              )}
            </span>
            .
          </h1>
          <div className="my-12 flex items-center gap-5">
            <Link
              href={personalData.socialLinks.github}
              target='_blank'
              className="transition-all text-[#16f2b3] hover:scale-125 duration-300"
            >
              <BsGithub size={30} />
            </Link>
            <Link
              href={personalData.socialLinks.linkedIn}
              target='_blank'
              className="transition-all text-[#16f2b3] hover:scale-125 duration-300"
            >
              <BsLinkedin size={30} />
            </Link>
            <Link
              href={personalData.socialLinks.fastwork}
              target='_blank'
              className="transition-all text-[#16f2b3] hover:scale-125 duration-300"
            >
              <SiFreelancer size={30} />
            </Link>
            <Link
              href={personalData.socialLinks.instagram}
              target='_blank'
              className="transition-all text-[#16f2b3] hover:scale-125 duration-300"
            >
              <BsInstagram size={30} />
            </Link>
            <Link
              href={personalData.socialLinks.stackOverflow}
              target='_blank'
              className="transition-all text-[#16f2b3] hover:scale-125 duration-300"
            >
              <BsStackOverflow size={30} />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="#contact" className="bg-gradient-to-r to-[#16f2b3] from-violet-600 p-[1px] rounded-full transition-all duration-300 hover:from-[#16f2b3] hover:to-violet-600">
              <button className="px-3 text-xs md:px-8 py-3 md:py-4 bg-[#0d1224] rounded-full border-none text-center md:text-sm font-medium uppercase tracking-wider text-[#ffff] no-underline transition-all duration-200 ease-out  md:font-semibold flex items-center gap-1 hover:gap-3">
                <span>Contact me</span>
                <RiContactsFill size={16} />
              </button>
            </Link>

            <Link className="flex items-center gap-1 hover:gap-3 rounded-full bg-gradient-to-r from-[#16f2b3] to-violet-600 px-3 md:px-8 py-3 md:py-4 text-center text-xs md:text-sm font-medium uppercase tracking-wider text-white no-underline transition-all duration-200 ease-out hover:text-white hover:no-underline md:font-semibold" role="button" target="_blank" href={personalData.resume}
            >
              <span>Get Resume</span>
              <MdDownload size={16} />
            </Link>
          </div>

        </div>
        <div className="order-2 lg:order-2 from-[#0d1224] border-[#1b2c68a0] relative rounded-lg border bg-gradient-to-r to-[#0a0d37] shadow-lg">
          <div className="flex flex-row">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#16f2b3] to-violet-600"></div>
            <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
          </div>
          <div className="px-4 lg:px-8 py-5">
            <div className="flex flex-row space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <div className="h-3 w-3 rounded-full bg-orange-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-200"></div>
            </div>
          </div>
          <div className="overflow-hidden border-t-[2px] border-indigo-900 px-4 lg:px-8 py-4 lg:py-8">
            <code className="font-mono text-xs md:text-sm lg:text-base">
              <div className="blink">
                <span className="mr-2 text-[#16f2b3]">const</span>
                <span className="mr-2 text-white">coder</span>
                <span className="mr-2 text-[#16f2b3]">=</span>
                <span className="text-gray-400">{'{'}</span>
              </div>
              <div>
                <span className="ml-4 lg:ml-8 mr-2 text-white">name:</span>
                <span className="text-gray-400">{`'`}</span>
                <span className="text-amber-300">{personalData.name}</span>
                <span className="text-gray-400">{`',`}</span>
              </div>
              <div className="ml-4 lg:ml-8 mr-2">
                <span className="text-white">skills:</span>
                <span className="text-gray-400">{`['`}</span>
                <span className="text-amber-300">Laravel</span>
                <span className="text-gray-400">{`', `}</span>
                <span className="text-amber-300">Codeigniter</span>
                <span className="text-gray-400">{`', `}</span>
                <span className="text-amber-300">React</span>
                <span className="text-gray-400">{`', `}</span>
                <span className="text-amber-300">React</span>
                <span className="text-gray-400">{"', '"}</span>
                <span className="text-amber-300">NextJS</span>
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
                <span className="ml-4 lg:ml-8 mr-2 text-white">hardWorker:</span>
                <span className="text-orange-400">true</span>
                <span className="text-gray-400">,</span>
              </div>
              <div>
                <span className="ml-4 lg:ml-8 mr-2 text-white">quickLearner:</span>
                <span className="text-orange-400">true</span>
                <span className="text-gray-400">,</span>
              </div>
              <div>
                <span className="ml-4 lg:ml-8 mr-2 text-white">problemSolver:</span>
                <span className="text-orange-400">true</span>
                <span className="text-gray-400">,</span>
              </div>
              <div>
                <span className="ml-4 lg:ml-8 mr-2 text-green-400">hireable:</span>
                <span className="text-orange-400">function</span>
                <span className="text-gray-400">{'() {'}</span>
              </div>
              <div>
                <span className="ml-8 lg:ml-16 mr-2 text-orange-400">return</span>
                <span className="text-gray-400">{`(`}</span>
              </div>
              <div>
                <span className="ml-12 lg:ml-24 text-cyan-400">this.</span>
                <span className="mr-2 text-white">hardWorker</span>
                <span className="text-amber-300">&amp;&amp;</span>
              </div>
              <div>
                <span className="ml-12 lg:ml-24 text-cyan-400">this.</span>
                <span className="mr-2 text-white">problemSolver</span>
                <span className="text-amber-300">&amp;&amp;</span>
              </div>
              <div>
                <span className="ml-12 lg:ml-24 text-cyan-400">this.</span>
                <span className="mr-2 text-white">skills.length</span>
                <span className="mr-2 text-amber-300">&gt;=</span>
                <span className="text-orange-400">5</span>
              </div>
              <div><span className="ml-8 lg:ml-16 mr-2 text-gray-400">{`);`}</span></div>
              <div><span className="ml-4 lg:ml-8 text-gray-400">{`};`}</span></div>
              <div><span className="text-gray-400">{`};`}</span></div>
            </code>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;