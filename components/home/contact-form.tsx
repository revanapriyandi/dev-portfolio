"use client";
import { isValidEmail } from "@/utils/check-email";
import axios from "axios";
import { useState, ChangeEvent, FormEvent } from "react";
import { TbMailForward } from "react-icons/tb";
import { toast } from "react-toastify";

interface UserInput {
  name: string;
  email: string;
  message: string;
}

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-3 text-fg placeholder:text-muted/60 outline-none transition-colors focus:border-accent";

const ContactForm: React.FC = () => {
  const [emailError, setEmailError] = useState(false);
  const [requiredError, setRequiredError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState<UserInput>({ name: "", email: "", message: "" });

  const handleSendMail = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.email || !userInput.message || !userInput.name) {
      setRequiredError(true);
      return;
    }
    if (!isValidEmail(userInput.email)) {
      setEmailError(true);
      return;
    }
    setRequiredError(false);

    try {
      setIsLoading(true);
      const res = await axios.post("/api/contact", userInput);
      if (res.status !== 200) throw new Error("Failed to send message!");
      toast.success("Message sent successfully!");
      setUserInput({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSendMail} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">Name</span>
          <input className={field} type="text" maxLength={100} required name="name" autoComplete="name" value={userInput.name} onChange={handleInputChange} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">Email</span>
          <input
            className={field}
            type="email"
            maxLength={100}
            required
            name="email"
            autoComplete="email"
            value={userInput.email}
            onChange={handleInputChange}
            onBlur={() => setEmailError(!!userInput.email && !isValidEmail(userInput.email))}
            aria-invalid={emailError}
          />
          {emailError && <span className="text-sm text-red-400">Please provide a valid email.</span>}
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">Message</span>
        <textarea className={field} maxLength={500} name="message" required rows={6} value={userInput.message} onChange={handleInputChange} />
      </label>
      {requiredError && <p className="text-sm text-red-400">All fields are required.</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="group mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 font-semibold text-ink transition-all hover:gap-4 disabled:opacity-60"
      >
        {isLoading ? "Sending…" : <>Send message <TbMailForward size={20} /></>}
      </button>
    </form>
  );
};

export default ContactForm;
