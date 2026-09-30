"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.includes("@") || !form.message.trim()) {
      setError("Please fill in all fields with a valid email.");
      setStatus("error");
      return;
    }
    setError("");
    setStatus("sending");
    await new Promise(r => setTimeout(r, 1200));
    setStatus("sent");
  };

  return (
    <main className="px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>

      {status === "sent" ? (
        <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500 text-center">
          <p className="text-green-400 font-semibold text-lg">Message sent!</p>
          <p className="text-gray-400 mt-2">We&apos;ll get back to you within 24 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === "error" && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500 text-red-400 text-sm">{error}</div>
          )}
          <input placeholder="Your name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-green-500 outline-none" />
          <input placeholder="you@example.com" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-green-500 outline-none" />
          <textarea placeholder="How can we help?" rows={5} value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-green-500 outline-none resize-none" />
          <button disabled={status === "sending"}
            className="w-full py-3 rounded-xl bg-green-500 text-black font-semibold hover:bg-green-400 disabled:opacity-50 transition">
            {status === "sending" ? "Sending" : "Send Message"}
          </button>
        </form>
      )}
    </main>
  );
}
