import { ContactForm } from "@/components/contact/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Portfolio",
  description: "Get in touch with me",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Contact</h1>
        <p className="text-muted-foreground mt-2">
          Have a project in mind or want to chat? Send me a message.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
