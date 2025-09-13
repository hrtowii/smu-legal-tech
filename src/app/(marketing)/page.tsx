"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Upload, Brain, Download, Shield } from "lucide-react";
import { HoverBorderGradient } from "@/components/button";

export default function Home() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-24 pb-12 bg-gradient-to-br from-justice-blue/20 via-background to-justice-pink/20 dark:from-slate-900/50 dark:via-background dark:to-slate-800/50">
        <motion.img
          src="https://png.pngtree.com/png-vector/20240602/ourmid/pngtree-luxurious-golden-metal-texture-with-shimmering-shine-png-image_12357421.png"
          alt="Form illustration"
          style={{ transform: `translateY(${offsetY * 0.3}px)` }}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
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
              className="bg-[linear-gradient(160deg,theme(colors.justice.blue),theme(colors.justice.pink),theme(colors.justice.blue))] bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              Justice™
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Transform handwritten legal aid forms into structured digital data
            with AI-powered OCR and intelligent field mapping. Built for legal
            professionals who need accuracy and efficiency.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
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
                <Upload className="h-5 w-5 mr-2" />
                Try the Demo
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
                <Shield className="h-5 w-5 mr-2" />
                Learn More
              </Link>
            </HoverBorderGradient>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 px-6 bg-white/30 backdrop-blur-xl dark:bg-black/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your legal forms from paper to
              digital
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/60 backdrop-blur-md dark:bg-black/60">
                <CardHeader>
                  <div className="w-12 h-12 bg-justice-blue/10 dark:bg-justice-blue/20 rounded-lg flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-justice-blue dark:text-justice-blue/80" />
                  </div>
                  <CardTitle>OCR Recognition</CardTitle>
                  <CardDescription>
                    Advanced handwriting recognition that adapts to messy,
                    informal responses and varying writing styles.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/60 backdrop-blur-md dark:bg-black/60">
                <CardHeader>
                  <div className="w-12 h-12 bg-justice-pink/10 dark:bg-justice-pink/20 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-justice-pink dark:text-justice-pink/80" />
                  </div>
                  <CardTitle>AI Processing</CardTitle>
                  <CardDescription>
                    Intelligent mapping of handwritten responses to structured
                    formats, with built-in human review flagging.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/60 backdrop-blur-md dark:bg-black/60">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Export & Save</CardTitle>
                  <CardDescription>
                    Download as CSV or integrate directly into your case
                    management system for instant use.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-24"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Built for the Public Defender’s Office
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Designed to handle the real-world challenges of criminal defence
              aid applications, reducing manual workload while keeping hardcopy
              accessibility.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
