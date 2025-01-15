import { personalData } from "@/utils/data/personal-data";
import { IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";

function Navbar() {
  return (
    <nav className="bg-transparent sticky top-0 z-50" style={{ backdropFilter: "blur(10px)", zIndex: 9999 }}>
      <div className="sm:hidden md:flex lg:flex items-center justify-between py-5">
        <div className="hidden md:flex flex-shrink-0 items-center">
          <Link
            href="/"
            className=" text-[#16f2b3] text-3xl font-bold"
          >
            {personalData.name}
          </Link>
        </div>

        <ul className="mt-4 hidden lg:flex h-screen max-h-0 w-full flex-col items-start text-sm opacity-0 lg:mt-0 lg:h-auto lg:max-h-screen lg:w-auto lg:flex-row lg:space-x-1 lg:border-0 lg:opacity-100" id="navbar-default">
          <li>
            <Link className="block px-4 py-2 no-underline outline-none hover:no-underline" href="/#about">
              <div className="text-sm text-white transition-colors duration-300 hover:text-[#16f2b3]">ABOUT</div>
            </Link>
          </li>
          <li>
            <Link className="block px-4 py-2 no-underline outline-none hover:no-underline" href="/#experience"><div className="text-sm text-white transition-colors duration-300 hover:text-[#16f2b3]">EXPERIENCE</div></Link>
          </li>
          <li>
            <Link className="block px-4 py-2 no-underline outline-none hover:no-underline" href="/#skills"><div className="text-sm text-white transition-colors duration-300 hover:text-[#16f2b3]">SKILLS</div></Link>
          </li>
          <li>
            <Link className="block px-4 py-2 no-underline outline-none hover:no-underline" href="/#education"><div className="text-sm text-white transition-colors duration-300 hover:text-[#16f2b3]">EDUCATION</div></Link>
          </li>
          <li>
            <Link className="block px-4 py-2 no-underline outline-none hover:no-underline" href="/#repositorie"><div className="text-sm text-white transition-colors duration-300 hover:text-[#16f2b3]">REPOSITORIES</div></Link>
          </li>
          <li>
            <Link className="block px-4 py-2 no-underline outline-none hover:no-underline" href="/#projects"><div className="text-sm text-white transition-colors duration-300 hover:text-[#16f2b3]">PROJECTS</div></Link>
          </li>
          <li>
            <Link className="block px-4 py-2 no-underline outline-none hover:no-underline rounded-lg bg-slate-800" href={personalData.socialLinks.github} target="_blank">
              <IconBrandGithub size={24} />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
