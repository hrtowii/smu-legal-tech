"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Brain, Download, Shield, Zap, Users } from "lucide-react";

export default function Home() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-24 pb-12 bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/50 dark:from-slate-900/50 dark:via-background dark:to-slate-800/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          {/*<Badge variant="outline" className="mb-6 text-sm font-medium">
            Powered by AI • Trusted by Legal Professionals
          </Badge>*/}

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
            Upload
            <motion.span
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
              }}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_100%]"
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
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              asChild
            >
              <Link href="/demo" className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Try the Demo
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/about" className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Learn More
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 px-6">
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
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Upload & Scan</CardTitle>
                  <CardDescription>
                    Upload handwritten forms in PDF, JPG, or PNG format. Our OCR
                    technology handles messy handwriting and informal responses.
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
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>AI Processing</CardTitle>
                  <CardDescription>
                    Our AI intelligently maps handwritten responses to
                    structured formats with confidence scoring and human review
                    flagging.
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
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Export & Integrate</CardTitle>
                  <CardDescription>
                    Download as CSV or integrate directly into your case
                    management system for immediate use by your team.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                  <Badge variant="outline">Trusted Solution</Badge>
                </div>
                <CardTitle className="text-2xl">
                  Built for the Public Defender's Office
                </CardTitle>
                <CardDescription className="text-lg">
                  Designed to handle real-world challenges of criminal defence
                  aid applications, reducing manual workload while maintaining
                  hardcopy accessibility for all applicants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">95%</div>
                    <div className="text-sm text-muted-foreground">
                      Accuracy Rate
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      10x
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Faster Processing
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      100%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Accessible Forms
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
