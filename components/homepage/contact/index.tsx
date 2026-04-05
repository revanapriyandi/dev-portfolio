// @flow strict
import { MotionGroup, MotionItem, MotionSection } from "@/components/motion/section-reveal";
import { personalData } from "@/utils/data/personal-data";
import Link from "next/link";
import { BiLogoLinkedin } from "react-icons/bi";
import { CiLocationOn } from "react-icons/ci";
import { FaStackOverflow } from "react-icons/fa";
import { IoLogoGithub, IoMdCall } from "react-icons/io";
import { MdAlternateEmail } from "react-icons/md";
import ContactForm from "./contact-form";
import { BsInstagram } from "react-icons/bs";
import { SiFreelancer } from "react-icons/si";

function ContactSection() {
  const formatInternationalNumber = (phone: string, countryCode = "62") => {
    const cleanedPhone = phone.replace(/\D+/g, "");
    if (!cleanedPhone.startsWith(countryCode)) {
      return `${countryCode}${cleanedPhone.replace(/^0/, "")}`;
    }
    return cleanedPhone;
  };

  return (
    <MotionSection id="contact" className="relative mt-24 text-white">
      <div className="pointer-events-none absolute left-0 top-10 h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="hidden lg:flex flex-col items-center absolute top-24 -right-8">
        <span className="bg-[#1a1443] w-fit text-white rotate-90 p-2 px-5 text-xl rounded-md">
          CONTACT
        </span>
        <span className="h-36 w-[2px] bg-[#1a1443]"></span>
      </div>

      <MotionGroup className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <MotionItem>
          <ContactForm />
        </MotionItem>

        <MotionItem className="lg:w-3/4">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-5 lg:gap-6">
              <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm md:text-xl">
                <MdAlternateEmail
                  className="rounded-full bg-[#8b98a5] p-2 text-gray-800 transition-all duration-300 hover:scale-110 hover:bg-[#16f2b3] cursor-pointer"
                  size={36}
                />
                <span>{personalData.contact.email}</span>
              </p>
              <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm md:text-xl">
                <IoMdCall
                  className="rounded-full bg-[#8b98a5] p-2 text-gray-800 transition-all duration-300 hover:scale-110 hover:bg-[#16f2b3] cursor-pointer"
                  size={36}
                />
                <Link
                  href={`https://wa.me/${formatInternationalNumber(personalData.contact.phone)}`}
                >
                  {personalData.contact.phone}
                </Link>
              </p>
              <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm md:text-xl">
                <CiLocationOn
                  className="rounded-full bg-[#8b98a5] p-2 text-gray-800 transition-all duration-300 hover:scale-110 hover:bg-[#16f2b3] cursor-pointer"
                  size={36}
                />
                <span>{personalData.contact.address}</span>
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 lg:mt-12">
              <Link
                target="_blank"
                href={personalData.socialLinks.github}
                className="rounded-full bg-[#8b98a5] p-3 text-gray-800 transition-all duration-300 hover:-translate-y-1 hover:bg-[#16f2b3] cursor-pointer"
              >
                <IoLogoGithub size={24} />
              </Link>
              <Link
                target="_blank"
                href={personalData.socialLinks.linkedIn}
                className="rounded-full bg-[#8b98a5] p-3 text-gray-800 transition-all duration-300 hover:-translate-y-1 hover:bg-[#16f2b3] cursor-pointer"
              >
                <BiLogoLinkedin size={24} />
              </Link>
              <Link
                target="_blank"
                href={personalData.socialLinks.stackOverflow}
                className="rounded-full bg-[#8b98a5] p-3 text-gray-800 transition-all duration-300 hover:-translate-y-1 hover:bg-[#16f2b3] cursor-pointer"
              >
                <FaStackOverflow size={24} />
              </Link>
              <Link
                href={personalData.socialLinks.fastwork}
                target="_blank"
                className="rounded-full bg-[#8b98a5] p-3 text-gray-800 transition-all duration-300 hover:-translate-y-1 hover:bg-[#16f2b3] cursor-pointer"
              >
                <SiFreelancer size={20} />
              </Link>
              <Link
                href={personalData.socialLinks.instagram}
                target="_blank"
                className="rounded-full bg-[#8b98a5] p-3 text-gray-800 transition-all duration-300 hover:-translate-y-1 hover:bg-[#16f2b3] cursor-pointer"
              >
                <BsInstagram size={20} />
              </Link>
            </div>
          </div>
        </MotionItem>
      </MotionGroup>
    </MotionSection>
  );
}

export default ContactSection;
