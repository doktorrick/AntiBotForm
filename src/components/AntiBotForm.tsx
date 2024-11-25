// pages/form.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";

export default function AntiBotForm() {
  // State to track the trap field value (to detect bots)
  const [trap, setTrap] = useState<string | null>(null);

  // State to store the CSRF token for form submission security
  const [csrfToken, setCsrfToken] = useState<string>("");

  // State to track the time when the form was loaded (used for time-based validation)
  const [startTime, setStartTime] = useState<number>(0);

  // State to detect if the browser is using WebDriver (which is common in automated bots)
  const [webdriver, setWebDriver] = useState<boolean>(false);

  // Initialize start time when the component mounts
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // Detect if the browser is a WebDriver (common for bots)
  useEffect(() => {
    if (navigator.webdriver || window.outerWidth === 0 || window.outerHeight === 0) {
      setWebDriver(true);
    }
  }, []);

  // Fetch CSRF token for security purposes
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const res = await fetch("/api/auth/csrf-token");
      const data = await res.json();
      setCsrfToken(data.csrfToken); // Set the CSRF token in state
    };
    fetchCsrfToken();
  }, []);

  // Handle form submission and apply anti-bot checks
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if the trap field is filled, which indicates a bot
    if (trap) return null;

    // Check if the form submission happened too quickly (bot-like behavior)
    const currentTime: number = Date.now();
    const timeElapsed = (currentTime - startTime) / 1000;
    if (timeElapsed < 3) return null; // Enforce a minimum 3 seconds time between form load and submission

    // Check if the form is being submitted from a WebDriver (bot-like behavior)
    if (webdriver) return null;

    // Prepare the form data for submission
    const formData = new FormData();
    formData.append("username", e.currentTarget.username.value);
    formData.append("email", e.currentTarget.email.value);
    formData.append("csrfToken", e.currentTarget.csrfToken.value);

    // Send the form data to the server via POST request
    const response = await fetch("/api/submit-form", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    // Show success or failure message based on the result from the API
    if (result.isSuccess) {
      alert("Form submitted successfully!");
    } else {
      alert("Failed to submit form. Please try again.");
    }
  };

  return (
    <form
      className="flex flex-col max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Anti-Bot Verification
      </h2>

      {/* Hidden CSRF Token Field */}
      <input name="csrfToken" type="hidden" value={csrfToken} />

      {/* Username Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          name="username"
          type="text"
          placeholder="Enter your username"
          required
          className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-emerald-600 focus:border-emerald-600"
        />
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
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
        onChange={(e) => setTrap(e.target.value)} // If this field is filled, it indicates a bot
      />

      {/* Submit Button */}
      <button
        className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-opacity-50"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}
