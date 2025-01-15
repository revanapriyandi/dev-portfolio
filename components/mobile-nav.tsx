"use client";
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconTerminal2,
  IconSchool,
  IconBriefcase,
  IconUserCircle,
  IconGitBranch,
} from "@tabler/icons-react";

const MobileNav: React.FC = () => {
  const links = [
    {
      title: "About",
      icon: (
        <IconUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#about",
    },
    {
      title: "Experience",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#experience",
    },
    {
      title: "Education",
      icon: (
        <IconSchool className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#education",
    },
    {
      title: "Repository",
      icon: (
        <IconGitBranch className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#repository",
    },
    {
      title: "Projects",
      icon: (
        <IconBriefcase className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#projects",
    },
  ];

  return (
    <div className="fixed bottom-4 z-50 flex duration-300 ease-out items-center justify-center w-screen md:hidden">
      <FloatingDock items={links} />
    </div>
  );
};

export default MobileNav;
