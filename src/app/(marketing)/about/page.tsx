"use client";

import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Users,
  Building,
  Scale,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function About() {
  return (
    <div className="container mx-auto py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        {/*<Badge variant="outline" className="mb-4">
          Trusted by Legal Professionals
        </Badge>*/}
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Transforming Legal Workflows
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Why law firms, compliance officers, and courts choose our intelligent
          form processing solution
        </p>
      </motion.div>

      <div className="space-y-16">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-8">The Challenge</h2>
          <Alert className="mb-8 border-destructive/50 text-destructive dark:border-destructive bg-red-50 dark:bg-red-950/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Workflow Inefficiency</AlertTitle>
            <AlertDescription className="text-lg leading-relaxed mt-2">
              Criminal defence aid applications face a fundamental accessibility
              challenge: they must remain available through hardcopy forms to
              ensure non-tech savvy applicants can access legal support. Yet,
              this creates significant workflow inefficiencies for government
              officers processing these applications.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  What Officers Deal With Daily
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Informal language responses: "not sure," "don't remember,"
                      "maybe"
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Structural non-compliance: lengthy narratives in single
                      boxes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Incomplete mandatory fields scattered throughout forms
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Varying handwriting quality requiring interpretation
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Manual Processing Burden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Decode handwritten text across varying legibility levels
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Hunt for mandatory information in unexpected locations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Translate informal language into system terminology
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Make judgment calls about ambiguous responses
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-8">Who Benefits</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-justice-blue/20 dark:bg-justice-blue/30 border-justice-blue/50 dark:border-justice-blue/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-justice-blue dark:text-justice-blue/80">
                  <Scale className="h-5 w-5" />
                  Law Firms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-justice-blue dark:text-justice-blue/70">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-justice-blue" />
                    Reduce manual data entry time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-justice-blue" />
                    Minimize transcription errors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-justice-blue" />
                    Accelerate case intake process
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Improve client data accuracy
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-50/50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Users className="h-5 w-5" />
                  Compliance Officers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-600 dark:text-green-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Ensure mandatory field completion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Standardize data formats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Flag uncertain interpretations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Maintain audit trails
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-justice-pink/20 dark:bg-justice-pink/30 border-justice-pink/50 dark:border-justice-pink/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-justice-pink dark:text-justice-pink/80">
                  <Building className="h-5 w-5" />
                  Courts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-justice-pink dark:text-justice-pink/70">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-justice-pink" />
                    Streamline case processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-justice-pink" />
                    Improve data searchability
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-justice-pink" />
                    Reduce administrative burden
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-justice-pink" />
                    Enable digital case management
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-8">Our Solution</h2>

          <Card className="bg-gradient-to-r from-justice-blue to-justice-pink text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Intelligent OCR + AI Processing
              </CardTitle>
              <CardDescription className="text-blue-100 dark:text-blue-200 text-lg">
                We don't just recognize text – we understand context, handle
                ambiguity, and ensure compliance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-50">
                    Smart Recognition:
                  </h4>
                  <p className="text-blue-100 dark:text-blue-200">
                    Our AI handles messy handwriting, informal language, and
                    non-compliant responses that traditional OCR tools fail on.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-50">
                    Human-in-the-Loop:
                  </h4>
                  <p className="text-blue-100 dark:text-blue-200">
                    Uncertain interpretations are flagged for human review,
                    ensuring accuracy while maintaining efficiency.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                Ready to Transform Your Workflow?
              </CardTitle>
              <CardDescription className="text-lg">
                Join the Public Defender's Office and other legal organizations
                in modernizing form processing while maintaining accessibility
                for all applicants.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/demo" className="flex items-center gap-2">
                    Try the Demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href="mailto:contact@legalformai.com"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Us
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
