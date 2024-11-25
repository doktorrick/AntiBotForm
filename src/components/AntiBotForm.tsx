"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import { GoogleReCaptcha } from "react-google-recaptcha-v3";

export default function ContactForm() {
  const [honeypot, setHoneypot] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [startTime] = useState<number>(Date.now());
  const [isWebDriverDetected, setIsWebDriverDetected] =
    useState<boolean>(false);

  const handleReCaptchaVerify = useCallback((token: string) => {
    setRecaptchaToken(token);
  }, []);

  useEffect(() => {
    if (
      navigator.webdriver ||
      window.outerWidth === 0 ||
      window.outerHeight === 0
    ) {
      setIsWebDriverDetected(true);
    }
  }, []);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch("/api/auth/csrf-token");
        if (!res.ok) throw new Error("Failed to fetch CSRF token.");
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (honeypot) {
      console.warn("Bot detected via honeypot!");
      return;
    }

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)
      .value;

    const timeElapsed = (Date.now() - startTime) / 1000;
    if (timeElapsed < 3) {
      console.warn("Form submitted too quickly. Likely a bot.");
      return;
    }

    if (isWebDriverDetected) {
      console.warn("Bot detected via WebDriver.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("message", message);
    formData.append("csrfToken", csrfToken);
    formData.append("g-recaptcha-response", recaptchaToken);

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.isSuccess) {
        alert("Message sent successfully!");
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <form
      className="flex flex-col max-w-lg mx-auto p-8 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg shadow-lg space-y-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-3xl font-bold text-center">Contact Us</h2>
      <p className="text-center text-sm opacity-80">
        {"Have questions or feedback? We'd love to hear from you!"}
      </p>

      <input name="csrfToken" type="hidden" value={csrfToken} />

      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          name="name"
          type="text"
          placeholder="Enter your name"
          required
          className="w-full p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          className="w-full p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea
          name="message"
          placeholder="Enter your message"
          required
          rows={5}
          className="w-full p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
        ></textarea>
      </div>

      {/* Honeypot field for bot detection */}
      <input
        type="text"
        className="hidden"
        name="trap"
        onChange={(e) => setHoneypot(e.target.value)}
      />

      <GoogleReCaptcha onVerify={handleReCaptchaVerify} />

      <button
        type="submit"
        className="w-full py-3 bg-white text-blue-500 font-bold rounded-md hover:bg-teal-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Send Message"
      >
        Send Message
      </button>
    </form>
  );
}
