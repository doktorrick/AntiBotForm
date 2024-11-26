"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import { GoogleReCaptcha } from "react-google-recaptcha-v3";

/**
 * AntiBotForm Component
 * A form designed to protect against bots using various anti-bot mechanisms, including:
 * - A hidden "trap" field
 * - Time-based validation
 * - WebDriver detection
 * - reCAPTCHA verification
 */
export default function AntiBotForm() {
  // Anti-bot mechanism states
  const [trap, setTrap] = useState<string | null>(null); // Hidden field trap for bot detection
  const [csrfToken, setCsrfToken] = useState<string>(""); // CSRF token for form submission security
  const [startTime, setStartTime] = useState<number>(0); // Form load time for time-based validation
  const [webdriver, setWebDriver] = useState<boolean>(false); // WebDriver detection (common in bots)
  const [recaptchaToken, setRecaptchaToken] = useState<string>(""); // reCAPTCHA token for backend verification

  /**
   * Initialize start time on component mount
   */
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  /**
   * reCAPTCHA verification handler
   * @param token - reCAPTCHA token returned by Google
   */
  const handleReCaptchaVerify = useCallback((token: string) => {
    if (!token) return;
    setRecaptchaToken(token);
  }, []);

  /**
   * WebDriver detection to identify potential bot behavior
   */
  useEffect(() => {
    if (
      navigator.webdriver || // Standard WebDriver detection
      window.outerWidth === 0 || // Unusual browser dimensions
      window.outerHeight === 0
    ) {
      setWebDriver(true);
    }
  }, []);

  /**
   * Fetch CSRF token for enhanced form security
   */
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch("/api/auth/csrf-token");
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  /**
   * Form submission handler with anti-bot checks
   * @param e - Form event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Anti-bot checks
    if (trap) return alert("Bot detected!"); // Trap field filled
    const timeElapsed = (Date.now() - startTime) / 1000;
    if (timeElapsed < 3) return alert("Submission too quick!"); // Minimum 3 seconds required
    if (webdriver) return alert("Bot behavior detected!"); // WebDriver detected

    // Prepare form data for submission
    const formData = new FormData();
    formData.append("username", e.currentTarget.username.value);
    formData.append("email", e.currentTarget.email.value);
    formData.append("csrfToken", csrfToken);
    formData.append("recaptchaToken", recaptchaToken);

    // Send data to the server
    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      // Display success or error message
      if (result.isSuccess) {
        alert("Form submitted successfully!");
      } else {
        alert("Failed to submit form. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <form
      className="flex flex-col max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6"
      onSubmit={handleSubmit}
    >
      {/* Form Header */}
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Anti-Bot Verification
      </h2>

      {/* Hidden CSRF Token Field */}
      <input name="csrfToken" type="hidden" value={csrfToken} />

      {/* Username Input */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
          required
          className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-emerald-600 focus:border-emerald-600"
        />
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-emerald-600 focus:border-emerald-600"
        />
      </div>

      {/* Hidden Trap Field */}
      <input
        type="text"
        className="hidden"
        name="trap"
        onChange={(e) => setTrap(e.target.value)} // Bot detection via trap field
      />

      {/* Google reCAPTCHA */}
      <GoogleReCaptcha onVerify={handleReCaptchaVerify} />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-opacity-50"
      >
        Submit
      </button>
    </form>
  );
}
