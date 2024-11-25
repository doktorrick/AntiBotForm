"use client";

import AntiBotForm from "@/components/AntiBotForm";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function Home() {
  const googleReCaptchaKey = "6LcByj0cAAAAAJTvwZYcM4YpDWhaqXxs3g_1du3m";

  return (
    <main className="bg-black min-h-screen flex items-center justify-center flex-col">
      <div className="w-full px-4">
        <GoogleReCaptchaProvider reCaptchaKey={googleReCaptchaKey}>
          <AntiBotForm />
        </GoogleReCaptchaProvider>
      </div>
    </main>
  );
}
