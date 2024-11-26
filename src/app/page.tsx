"use client"

import AntiBotForm from "@/components/AntiBotForm";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function Home() {
  const recaptchaKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY || "";

  return (
    <main className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-full px-4">
        <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
          <AntiBotForm />
        </GoogleReCaptchaProvider>
      </div>
    </main>
  );
}
