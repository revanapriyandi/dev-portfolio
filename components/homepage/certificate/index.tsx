import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Card } from "@/types/card";
import GlowCard from "@/components/helper/glow-card";

const CertificateSection: React.FC = () => {
    const [active, setActive] = useState<Card | null>(null);
    const [visibleCards, setVisibleCards] = useState(1);
    const id = useId();
    const ref = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(null);
            }
        }

        if (active) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    // Fungsi untuk menambah jumlah kartu yang terlihat
    const loadMore = () => {
        setVisibleCards((prev) => prev + 1);
    };

    return (
        <>
            <div id="certificate" className="relative z-50 border-t my-12 lg:my-24 border-[#25213b]">
                <Image
                    src="/section.svg"
                    alt="Hero"
                    width={1572}
                    height={795}
                    className="absolute top-0 -z-10"
                />
                <div className="flex justify-center -translate-y-[1px]">
                    <div className="w-3/4">
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent  w-full" />
                    </div>
                </div>

                <div className="flex justify-center my-5 lg:py-8">
                    <div className="flex items-center">
                        <span className="w-24 h-[2px] bg-[#1a1443]"></span>
                        <span className="bg-[#1a1443] w-fit text-white p-2 px-5 text-xl rounded-md">
                            Certificates and Courses
                        </span>
                        <span className="w-24 h-[2px] bg-[#1a1443]"></span>
                    </div>
                </div>

                <AnimatePresence>
                    {active && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 h-full w-full z-10"
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {active && (
                        <div className="fixed inset-0 grid place-items-center z-[999909]">
                            <motion.div
                                layoutId={`card-${active.title}-${id}`}
                                ref={ref}
                                className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
                            >
                                <motion.div layoutId={`image-${active.title}-${id}`}>
                                    <Image
                                        priority
                                        width={1200}
                                        height={800}
                                        src={active.src}
                                        alt={active.title}
                                        className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top bg-white"
                                    />
                                </motion.div>

                                <div>
                                    <div className="flex justify-between items-start p-4">
                                        <div>
                                            <motion.h3
                                                layoutId={`title-${active.title}-${id}`}
                                                className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                                            >
                                                {active.title}
                                            </motion.h3>
                                            <motion.p
                                                layoutId={`description-${active.description}-${id}`}
                                                className="text-neutral-600 dark:text-neutral-400 text-base"
                                            >
                                                {active.description}
                                            </motion.p>
                                        </div>

                                        <motion.a
                                            layout
                                            href={active.ctaLink}
                                            target="_blank"
                                            className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                                        >
                                            {active.ctaText}
                                        </motion.a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <ul className="flex flex-col gap-6 lg:gap-8">
                    {cards.slice(0, visibleCards).map((card) => (
                        <GlowCard key={card.id} identifier={`card-${card.id}`}>
                            <motion.div
                                layoutId={`card-${card.id}-${id}`}
                                onClick={() => setActive(card)}
                                className="p-4 relative text-neutral-900 dark:text-neutral-100 rounded-lg shadow-lg hover:shadow-xl transition-shadow object-cover"
                            >
                                <div className="flex flex-col w-full h-full">
                                    <motion.div layoutId={`image-${card.title}-${id}`} className="flex-shrink-0">
                                        <Image
                                            width={1200}
                                            height={800}
                                            src={card.src}
                                            alt={card.title}
                                            className="h-60 w-full rounded-lg object-cover object-center bg-white"
                                        />
                                    </motion.div>
                                    <div className="flex flex-col justify-between h-full mt-4">
                                        <motion.h3
                                            layoutId={`title-${card.title}-${id}`}
                                            className="font-semibold text-center md:text-left text-xl"
                                        >
                                            {card.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${card.description}-${id}`}
                                            className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-sm mt-2 line-clamp-3"
                                        >
                                            {card.description}
                                        </motion.p>
                                        {card.description.length > 100 && (
                                            <motion.a
                                                href="#"
                                                className="text-sm text-blue-500 hover:underline mt-2 self-center md:self-start"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActive(card);
                                                }}
                                            >
                                                Read More
                                            </motion.a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </GlowCard>
                    ))}
                </ul>

                {/* Tombol Load More */}
                {visibleCards < cards.length && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={loadMore}
                            className="px-6 py-3 rounded-full bg-violet-600 text-white text-sm font-bold hover:bg-violet-700"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CertificateSection;


export const CloseIcon = () => {
    return (
        <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
                opacity: 0,
                transition: {
                    duration: 0.05,
                },
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-black"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
        </motion.svg>
    );
};

const cards: Card[] = [
    {
        id: 1,
        title: "Cybersecurity Foundation Professional Certificate (CSFPC)",
        description: "Cybersecurity Foundation Professional Certificate (CSFPC) from CertiProf and Accredited by ANSI",
        src: "/image/certificate/csfpc.png",
        ctaText: "Visit",
        ctaLink: "https://drive.google.com/file/d/1_vJssm70FEQ8PjOQGnLGuBPLTVPyqIb3/view?usp=sharing",
    },
    {
        id: 2,
        title: "Computer Security (MBKM)",
        description: "Computer Security course from Universitas Binus under the MBKM (Merdeka Belajar Kampus Merdeka) program focuses on providing students with a deep understanding of computer security principles and practices. It covers a wide range of topics, including network security, cryptography, ethical hacking, and secure software development. ",
        src: "/image/certificate/binus.png",
        ctaText: "Visit",
        ctaLink: "https://drive.google.com/file/d/1AXpgv4I9rq0cNAKPqCte1thPVsLUNxf6/view?usp=sharing",
    },
    {
        id: 3,
        title: "PMM MBKM",
        description: "Provision and Implementation of Independent Learning Independent Campus National Defense",
        src: "/image/certificate/mbkm.png",
        ctaText: "Visit",
        ctaLink: "https://drive.google.com/file/d/1PdP5ju-rcx0Plo7Jn1AN-THeIhNw47Fk/view?usp=sharing",
    },
    {
        id: 4,
        title: "MSIB Angkatan 6 (2024)",
        description: "Merdeka Campus is part of the Merdeka Belajar policy by the Ministry of Education, Culture, Research, and Technology (Kemendikbudristek) which provides all students with the opportunity to hone their abilities according to their talents and interests by entering the world of work directly as a career preparation step.",
        src: "/image/certificate/msib.jpeg",
        ctaText: "Visit",
        ctaLink: "https://drive.google.com/file/d/13RYXq18caqrKV-H4OWqxC8cbZ2Op8UPN/view?usp=sharing",
    },

];
