"use client";
import Link from "next/link";
import localFont from "next/font/local";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HoverBorderGradient } from "@/components/button";

export default function Home() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-100 via-white to-indigo-200 min-h-screen overflow-x-hidden">
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden pt-24">
        <motion.img
          src="https://png.pngtree.com/png-vector/20240602/ourmid/pngtree-luxurious-golden-metal-texture-with-shimmering-shine-png-image_12357421.png"
          alt="Form illustration"
          style={{ transform: `translateY(${offsetY * 0.3}px)` }}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
        />

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
        >
          Upload
          <motion.span
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
            style={{
              backgroundImage:
                "linear-gradient(160deg, #6f70ff, #efa9ff, #6f70ff)", // golden shimmer
              backgroundSize: "200% 200%",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              display: "inline-block",
            }}
          >
            Justice™
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`relative text-xl text-gray-600 max-w-2xl mx-auto mb-10`}
        >
          Automatically transfer your handwritten legal aid forms into
          structured digital data accurately and quickly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative flex gap-4"
        >
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-8 py-4 text-l font-bold"
          >
            <Link
              href="/demo"
              className="w-full h-full flex items-center justify-center"
            >
              Try the Demo.
            </Link>
          </HoverBorderGradient>

          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-white bg-black text-black dark:text-black flex items-center space-x-2 px-8 py-4 text-l font-bold"
          >
            <Link
              href="/about"
              className="w-full h-full flex items-center justify-center"
            >
              Learn More
            </Link>
          </HoverBorderGradient>
        </motion.div>
      </section>

      <section className="relative z-10 py-24 px-6 bg-white/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl shadow-md bg-white/60 backdrop-blur-md"
          >
            <h3 className="text-2xl font-semibold mb-4">OCR Recognition</h3>
            <p className="text-gray-700">
              Advanced handwriting recognition that adapts to messy, informal
              responses and varying writing styles.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl shadow-md bg-white/60 backdrop-blur-md"
          >
            <h3 className="text-2xl font-semibold mb-4">AI Processing</h3>
            <p className="text-gray-700">
              Intelligent mapping of handwritten responses to structured
              formats, with built-in human review flagging.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl shadow-md bg-white/60 backdrop-blur-md"
          >
            <h3 className="text-2xl font-semibold mb-4">Export & Save</h3>
            <p className="text-gray-700">
              Download as CSV or integrate directly into your case management
              system for instant use.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Built for the Public Defender’s Office
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Designed to handle the real-world challenges of criminal defence aid
            applications, reducing manual workload while keeping hardcopy
            accessibility.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
