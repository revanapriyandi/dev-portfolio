"use client";

import clsx from "clsx";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import type { PropsWithChildren } from "react";

const entryEase = [0.22, 1, 0.36, 1] as const;

interface MotionSectionProps extends PropsWithChildren {
  id?: string;
  className?: string;
  delay?: number;
  amount?: number;
}

interface MotionGroupProps extends PropsWithChildren {
  className?: string;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
}

type MotionItemProps = PropsWithChildren<HTMLMotionProps<"div">>;

const createSectionVariants = (reduceMotion: boolean): Variants => {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1, y: 0 },
      show: { opacity: 1, y: 0 },
    };
  }

  return {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: entryEase },
    },
  };
};

const createGroupVariants = (
  reduceMotion: boolean,
  stagger: number,
  delayChildren: number
): Variants => {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1 },
      show: { opacity: 1 },
    };
  }

  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren,
        staggerChildren: stagger,
      },
    },
  };
};

const createItemVariants = (reduceMotion: boolean): Variants => {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1, y: 0 },
      show: { opacity: 1, y: 0 },
    };
  }

  return {
    hidden: { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: entryEase,
      },
    },
  };
};

export function MotionSection({
  children,
  className,
  id,
  delay = 0,
  amount = 0.2,
}: MotionSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={clsx("relative", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={createSectionVariants(Boolean(reduceMotion))}
      transition={{ delay }}
    >
      {children}
    </motion.section>
  );
}

export function MotionGroup({
  children,
  className,
  stagger = 0.12,
  delayChildren = 0.04,
  amount = 0.15,
}: MotionGroupProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={createGroupVariants(Boolean(reduceMotion), stagger, delayChildren)}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  className,
  ...props
}: MotionItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={createItemVariants(Boolean(reduceMotion))}
      {...props}
    >
      {children}
    </motion.div>
  );
}
