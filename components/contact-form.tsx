"use client";

import emailjs from "@emailjs/browser";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (website) {
      form.reset();
      setStatus("sent");
      return;
    }

    if (!isValidContactInput({ name, email, subject, message })) {
      setErrorMessage("Please enter a valid name, email, subject, and message.");
      setStatus("error");
      return;
    }

    if (!serviceId || !templateId || !publicKey) {
      setErrorMessage(
        "Contact delivery is not configured for this environment. Please use the email link beside the form."
      );
      setStatus("error");
      return;
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          name,
          from_name: name,
          email,
          reply_to: email,
          subject,
          message,
          time: new Date().toLocaleString("en-IN"),
        },
        { publicKey }
      );
      form.reset();
      setStatus("sent");
    } catch (error) {
      const response = error as { status?: number; text?: string };
      const detail =
        response.text || (error instanceof Error ? error.message : "Unknown EmailJS error");
      setErrorMessage(
        `Message delivery failed${response.status ? ` (${response.status})` : ""}: ${detail}. Please use the email link beside the form.`
      );
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-12 w-12 text-[#a7442d]" />
        <h2 className="mt-5 font-serif text-4xl">Message received.</h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-black/55">
          Thank you. We will get back to you within one business day.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-7 text-sm font-bold underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" placeholder="Your name" />
        <Field label="Email address" name="email" type="email" placeholder="you@example.com" />
      </div>
      <div>
        <label className="form-label" htmlFor="subject">
          I am interested in
        </label>
        <select id="subject" name="subject" required className="form-control" defaultValue="">
          <option value="" disabled>
            Select a subject
          </option>
          <option>Artwork enquiry</option>
          <option>Private viewing</option>
          <option>Shipping and delivery</option>
          <option>Order support</option>
          <option>Partnership</option>
        </select>
      </div>
      <div>
        <label className="form-label" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={7}
          required
          className="form-control h-auto py-3"
          placeholder="Tell us about the artwork or support you need."
        />
      </div>
      <button disabled={status === "sending"} className="premium-button w-fit disabled:opacity-50">
        {status === "sending" ? "Sending..." : "Send message"}
        <ArrowRight className="h-4 w-4" />
      </button>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm text-[#a7442d]">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

function isValidContactInput({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return (
    name.length >= 2 &&
    name.length <= 120 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    email.length <= 180 &&
    subject.length >= 2 &&
    subject.length <= 120 &&
    message.length >= 10 &&
    message.length <= 3000
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} required className="form-control" placeholder={placeholder} />
    </div>
  );
}
