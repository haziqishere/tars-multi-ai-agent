"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code,
  Database,
  Search,
  FileText,
  Server,
  ShieldCheck,
  ExternalLink,
  Cloud,
  CheckCircle,
  Cpu,
  Layers,
  Lock,
  BarChart,
  Zap,
  Users,
  Briefcase,
  Github,
  BookOpen,
  BrainCircuit,
  Bot,
  Cog,
  SearchCode,
  FileCode,
  MonitorSmartphone,
  DatabaseZap,
  ArrowLeft,
  Send,
  Globe,
  Target,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { Spotlight } from "@/components/ui/spotlight";
import { TextReveal } from "@/components/ui/text-reveal";
import { SparklesCore } from "@/components/ui/sparkles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Meteors } from "@/components/ui/meteors";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { WordRotate } from "@/components/ui/word-rotate";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [problemVisible, setProblemVisible] = useState(false);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [architectureVisible, setArchitectureVisible] = useState(false);
  const [innovationVisible, setInnovationVisible] = useState(false);
  const [impactVisible, setImpactVisible] = useState(false);
  const [implementationVisible, setImplementationVisible] = useState(false);
  const [techStackVisible, setTechStackVisible] = useState(false);
  const [responsibleAiVisible, setResponsibleAiVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    interface SetterFunction {
      (value: boolean): void;
    }

    const createObserver = (setter: SetterFunction): IntersectionObserver =>
      new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        if (entries[0]) {
          setter(entries[0].isIntersecting);
        }
      }, observerOptions);

    const problemObserver = createObserver(setProblemVisible);
    const solutionObserver = createObserver(setSolutionVisible);
    const architectureObserver = createObserver(setArchitectureVisible);
    const innovationObserver = createObserver(setInnovationVisible);
    const impactObserver = createObserver(setImpactVisible);
    const implementationObserver = createObserver(setImplementationVisible);
    const techStackObserver = createObserver(setTechStackVisible);
    const responsibleAiObserver = createObserver(setResponsibleAiVisible);
    const ctaObserver = createObserver(setCtaVisible);

    const sections = {
      "problem-section": problemObserver,
      "solution-section": solutionObserver,
      "architecture-section": architectureObserver,
      "innovation-section": innovationObserver,
      "impact-section": impactObserver,
      "implementation-section": implementationObserver,
      "tech-stack-section": techStackObserver,
      "responsible-ai-section": responsibleAiObserver,
      "cta-section": ctaObserver,
    };

    interface ObservedElement {
      element: HTMLElement;
      observer: IntersectionObserver;
    }

    const observedElements: ObservedElement[] = [];

    Object.entries(sections).forEach(([id, observer]) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        observedElements.push({ element, observer });
      } else {
        console.warn(`Element with id "${id}" not found.`);
      }
    });

    return () => {
      observedElements.forEach(({ element, observer }) => {
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-dark-base text-text-primary overflow-x-hidden">
      <div className="absolute inset-0 h-full w-full -z-10">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={50}
          className="h-full w-full"
          particleColor="#a9a9b2"
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-base/80 backdrop-blur-md border-b border-dark-border/50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/assets/images/TARS LOGO small.png"
              alt="TARS Logo"
              width={32}
              height={32}
              className="filter brightness-110"
            />
            <span className="font-bold text-xl text-text-primary">TARS</span>
            <span className="text-accent-green text-xl">AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#problem-section"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              Challenges
            </Link>
            <Link
              href="#solution-section"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              Solution
            </Link>
            <Link
              href="#architecture-section"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              Architecture
            </Link>
            <Link
              href="#innovation-section"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              Innovation
            </Link>
            <Link
              href="#impact-section"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              Impact
            </Link>
            <Link
              href="/login"
              className="text-text-primary px-4 py-1.5 rounded-md border border-dark-border hover:bg-dark-hover transition-colors text-sm"
            >
              Log In
            </Link>
          </div>

          <button className="md:hidden text-text-primary p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-10 bg-dark-base overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage: "url(/assets/images/grid-pattern.svg)",
            backgroundRepeat: "repeat",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-dark-base/50 to-dark-base z-0"></div>

        <div className="container mx-auto relative z-10 px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="relative inline-block p-1 rounded-2xl bg-gradient-to-br from-accent-green/30 via-dark-elevated to-accent-orange/30 shadow-xl shadow-dark-elevated/30">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl bg-dark-elevated border border-dark-border/50 flex items-center justify-center shadow-inner shadow-black/30">
                <Image
                  src="/assets/images/TARS LOGO small.png"
                  alt="TARS AI Agent Logo"
                  width={110}
                  height={110}
                  priority
                  className="filter brightness-110"
                />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: "easeOut",
            }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-4"
          >
            TARS: Multi-Agent Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.4,
              ease: "easeOut",
            }}
            className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-8"
          >
            Introducing a new paradigm for enterprise intelligence powered by{" "}
            <span className="text-accent-green font-medium">
              Azure AI Foundry
            </span>
            . Unlock insights, streamline workflows, and drive decisions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.6,
              ease: "easeOut",
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="#cta-section">
              <Button
                size="lg"
                className="bg-accent-orange hover:bg-accent-orange-muted text-text-primary shadow-neo-dark w-full sm:w-auto"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#architecture-section">
              <Button
                size="lg"
                variant="outline"
                className="border-dark-border text-text-secondary hover:bg-dark-hover hover:text-text-primary w-full sm:w-auto"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              delay: 0.8,
            }}
            className="mt-16 flex items-center justify-center gap-6 opacity-60"
          >
            <span className="text-sm text-text-muted">Powered by:</span>
            <Image
              src={"/assets/icons/image.png"}
              width={40}
              height={40}
              alt="Azure AI Foundry Logo"
            />
            <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient
                  id="a"
                  x1="-1032.17"
                  x2="-1059.21"
                  y1="145.31"
                  y2="65.43"
                  gradientTransform="matrix(1 0 0 -1 1075 158)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stop-color="#114a8b" />
                  <stop offset="1" stop-color="#0669bc" />
                </linearGradient>
                <linearGradient
                  id="b"
                  x1="-1023.73"
                  x2="-1029.98"
                  y1="108.08"
                  y2="105.97"
                  gradientTransform="matrix(1 0 0 -1 1075 158)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stop-opacity=".3" />
                  <stop offset=".07" stop-opacity=".2" />
                  <stop offset=".32" stop-opacity=".1" />
                  <stop offset=".62" stop-opacity=".05" />
                  <stop offset="1" stop-opacity="0" />
                </linearGradient>
                <linearGradient
                  id="c"
                  x1="-1027.16"
                  x2="-997.48"
                  y1="147.64"
                  y2="68.56"
                  gradientTransform="matrix(1 0 0 -1 1075 158)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stop-color="#3ccbf4" />
                  <stop offset="1" stop-color="#2892df" />
                </linearGradient>
              </defs>
              <path
                fill="url(#a)"
                d="M33.34 6.54h26.04l-27.03 80.1a4.15 4.15 0 0 1-3.94 2.81H8.15a4.14 4.14 0 0 1-3.93-5.47L29.4 9.38a4.15 4.15 0 0 1 3.94-2.83z"
              />
              <path
                fill="#0078d4"
                d="M71.17 60.26H29.88a1.91 1.91 0 0 0-1.3 3.31l26.53 24.76a4.17 4.17 0 0 0 2.85 1.13h23.38z"
              />
              <path
                fill="url(#b)"
                d="M33.34 6.54a4.12 4.12 0 0 0-3.95 2.88L4.25 83.92a4.14 4.14 0 0 0 3.91 5.54h20.79a4.44 4.44 0 0 0 3.4-2.9l5.02-14.78 17.91 16.7a4.24 4.24 0 0 0 2.67.97h23.29L71.02 60.26H41.24L59.47 6.55z"
              />
              <path
                fill="url(#c)"
                d="M66.6 9.36a4.14 4.14 0 0 0-3.93-2.82H33.65a4.15 4.15 0 0 1 3.93 2.82l25.18 74.62a4.15 4.15 0 0 1-3.93 5.48h29.02a4.15 4.15 0 0 0 3.93-5.48z"
              />
            </svg>
          </motion.div>
        </div>
      </section>

      <section
        id="problem-section"
        className="py-20 md:py-28 relative bg-dark-elevated border-t border-b border-dark-border/50 overflow-hidden"
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{
                opacity: problemVisible ? 1 : 0,
                x: problemVisible ? 0 : -30,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative rounded-lg overflow-hidden bg-dark-surface shadow-neo-dark aspect-video lg:aspect-square max-w-lg mx-auto flex items-center justify-center p-8 border border-dark-border">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">
                    <span className="text-text-primary">
                      New AI workflows to solve
                    </span>
                    <WordRotate
                      className="text-4xl font-bold text-accent-orange h-12"
                      words={[
                        "New Threats",
                        "New Challenges",
                        "New Complexities",
                      ]}
                      interval={2500}
                    />
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="bg-dark-elevated p-3 rounded-full shadow-neo-inset text-accent-orange border border-dark-border"
                    >
                      <Lock className="h-8 w-8" />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      className="bg-dark-elevated p-3 rounded-full shadow-neo-inset text-accent-orange border border-dark-border"
                    >
                      <Database className="h-8 w-8" />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="bg-dark-elevated p-3 rounded-full shadow-neo-inset text-accent-orange border border-dark-border"
                    >
                      <Layers className="h-8 w-8" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{
                opacity: problemVisible ? 1 : 0,
                x: problemVisible ? 0 : 30,
              }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm uppercase tracking-wider text-text-muted font-semibold">
                    The Problem
                  </h2>
                  <h3 className="text-3xl md:text-4xl font-bold mt-2 text-text-primary">
                    Enterprise Challenges in the AI Era
                  </h3>
                  <p className="text-xl text-accent-orange mt-2 font-medium">
                    Data Fragmentation & Inefficiency
                  </p>
                </div>

                <p className="text-text-secondary text-lg">
                  Modern enterprises grapple with siloed data and inefficient
                  knowledge workflows. Critical information is scattered across
                  platforms like SharePoint, Teams, and databases, hindering
                  access and slowing down decision-making.
                </p>

                <div className="mt-8 space-y-5">
                  {[
                    {
                      icon: Layers,
                      title: "Data scattered across platforms",
                      desc: "Critical information siloed in SharePoint, Teams, and various enterprise systems.",
                    },
                    {
                      icon: Search,
                      title: "Time wasted searching for information",
                      desc: "Employees spend significant time hunting for data instead of utilizing it.",
                    },
                    {
                      icon: BarChart,
                      title: "Inconsistent decision-making",
                      desc: "Limited data access leads to decisions based on incomplete pictures.",
                    },
                    {
                      icon: Cpu,
                      title: "Difficulty generating actionable intelligence",
                      desc: "Raw data lacks the context and analysis needed for strategic insights.",
                    },
                  ].map((challenge, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{
                        opacity: problemVisible ? 1 : 0,
                        x: problemVisible ? 0 : 20,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: 0.3 + index * 0.1,
                        ease: "easeOut",
                      }}
                      className="flex items-start gap-4"
                    >
                      <div className="mt-1 flex-shrink-0 bg-dark-surface p-2.5 rounded-lg shadow-neo-dark text-accent-orange border border-dark-border">
                        <challenge.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">
                          {challenge.title}
                        </h4>
                        <p className="text-text-secondary text-sm mt-1">
                          {challenge.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section
        id="architecture-section"
        className="py-20 md:py-28 relative bg-dark overflow-hidden"
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-text-primary">
                5-Agent Intelligence Architecture
              </span>
            </h2>
            <p className="mt-4 text-text-secondary text-lg md:text-xl">
              Our sophisticated multi-agent system collaborates to gather,
              analyze, predict, and act on enterprise data, delivering
              comprehensive insights and automated workflows.
            </p>
          </div>

          <Tabs
            defaultValue="orchestrator"
            className="w-full max-w-4xl mx-auto bg-dark-surface rounded-lg p-2 shadow-neo-dark"
          >
            <TabsList className="grid w-full grid-cols-3 bg-dark-elevated border-b border-dark-border rounded-t-lg">
              <TabsTrigger
                value="orchestrator"
                className="data-[state=active]:bg-dark-hover data-[state=active]:text-accent-orange data-[state=active]:shadow-inner"
              >
                Orchestrator
              </TabsTrigger>
              <TabsTrigger
                value="knowledge"
                className="data-[state=active]:bg-dark-hover data-[state=active]:text-accent-green data-[state=active]:shadow-inner"
              >
                Knowledge Agents
              </TabsTrigger>
              <TabsTrigger
                value="action"
                className="data-[state=active]:bg-dark-hover data-[state=active]:text-accent-green data-[state=active]:shadow-inner"
              >
                Action Agents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orchestrator" className="p-6">
              <Card className="bg-dark-elevated border-dark-border">
                <CardHeader className="flex flex-row items-center gap-4">
                  <BrainCircuit className="h-8 w-8 text-accent-orange" />
                  <div>
                    <CardTitle className="text-accent-orange">
                      Strategic Analyst Agent
                    </CardTitle>
                    <CardDescription className="text-text-muted">
                      Model: Llama-3.1-8B-Instruct (NIM Microservice)
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary mb-4">
                    The central coordinator of the TARS system. It receives user
                    requests, orchestrates the workflow between Knowledge and
                    Action agents, and synthesizes the final insights.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent-orange mr-2">✓</span>
                      <span className="text-text-secondary">
                        Orchestrates complex workflows
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-orange mr-2">✓</span>
                      <span className="text-text-secondary">
                        Synthesizes insights from multiple agents
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-orange mr-2">✓</span>
                      <span className="text-text-secondary">
                        Leverages NVIDIA NIM for ~2.5x faster token generation
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="knowledge"
              className="p-6 grid md:grid-cols-2 gap-6"
            >
              <Card className="bg-dark-elevated border-dark-border">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Globe className="h-8 w-8 text-accent-green" />
                  <div>
                    <CardTitle className="text-accent-green">
                      Global Intel Agent
                    </CardTitle>
                    <CardDescription className="text-text-muted">
                      Model: GPT-4o
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary mb-4">
                    Accesses external knowledge sources via MCP servers to
                    gather real-time global intelligence, market trends, and
                    news relevant to the user's query.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent-green mr-2">✓</span>
                      <span className="text-text-secondary">
                        Connects to BraveSearch, Firecrawl, Search1API
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-green mr-2">✓</span>
                      <span className="text-text-secondary">
                        Provides up-to-date external context
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-dark-elevated border-dark-border">
                <CardHeader className="flex flex-row items-center gap-4">
                  <FileText className="h-8 w-8 text-accent-green" />
                  <div>
                    <CardTitle className="text-accent-green">
                      Internal Docs Agent
                    </CardTitle>
                    <CardDescription className="text-text-muted">
                      Model: GPT-4o + RAG
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary mb-4">
                    Securely accesses and retrieves information from internal
                    enterprise data sources using Retrieval-Augmented Generation
                    (RAG).
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent-green mr-2">✓</span>
                      <span className="text-text-secondary">
                        Integrates with SharePoint, Fabric, Azure AI Foundry
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-green mr-2">✓</span>
                      <span className="text-text-secondary">
                        Ensures secure access to internal knowledge
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="action"
              className="p-6 grid md:grid-cols-2 gap-6"
            >
              <Card className="bg-dark-elevated border-dark-border">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Target className="h-8 w-8 text-accent-green" />
                  <div>
                    <CardTitle className="text-accent-green">
                      Prediction Agent
                    </CardTitle>
                    <CardDescription className="text-text-muted">
                      Model: GPT-4o
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary mb-4">
                    Analyzes potential actions or strategies, generates
                    different branches of possibilities, and predicts the likely
                    outcome for each branch based on available data.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent-green mr-2">✓</span>
                      <span className="text-text-secondary">
                        Generates action branches
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-green mr-2">✓</span>
                      <span className="text-text-secondary">
                        Predicts outcomes and impacts
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-dark-elevated border-dark-border">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Send className="h-8 w-8 text-accent-green" />
                  <div>
                    <CardTitle className="text-accent-green">
                      Task Dispatcher Agent
                    </CardTitle>
                    <CardDescription className="text-text-muted">
                      Model: GPT-4o
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary mb-4">
                    Drafts communications (like emails) or tasks based on the
                    synthesized insights and predicted outcomes, ready for
                    review and dispatch via Microsoft Graph MCP.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent-green mr-2">✓</span>
                      <span className="text-text-secondary">
                        Drafts emails and tasks
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-green mr-2">✓</span>
                      <span className="text-text-secondary">
                        Sends communications via Graph MCP
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <section
        id="solution-section"
        className="py-20 md:py-28 relative bg-dark-surface border-b border-dark-border/50 overflow-hidden"
      >
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(66, 184, 131, 0.1) 0%, transparent 60%)",
          }}
        ></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: solutionVisible ? 1 : 0,
              y: solutionVisible ? 0 : 30,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-text-primary">
                Centralized Intelligence with{" "}
              </span>
              <span className="text-accent-green">TARS</span>
            </h2>
            <p className="mt-4 text-text-secondary text-lg md:text-xl">
              A multi-agent system transforming how enterprises access and
              utilize information, built on Azure.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: solutionVisible ? 1 : 0,
              scale: solutionVisible ? 1 : 0.9,
            }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative flex justify-center items-center mb-16"
          >
            <OrbitingCircles
              className="h-[300px] w-[300px] md:h-[450px] md:w-[450px] border border-dark-border/30 rounded-full"
              duration={20}
              delay={10}
              radius={120}
              reverse
            >
              <OrbitingCircles
                className="h-[300px] w-[300px] md:h-[450px] md:w-[450px] border border-dark-border/30 rounded-full"
                duration={20}
                delay={5}
                radius={120}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.5,
                    type: "spring",
                    stiffness: 150,
                  }}
                  className="flex items-center justify-center h-20 w-20 md:h-28 md:w-28 rounded-full bg-dark-elevated border border-accent-green text-accent-green shadow-neo-dark text-2xl md:text-3xl font-bold"
                >
                  TARS
                </motion.div>

                <FileText className="block h-8 w-8 md:h-10 md:w-10 text-accent-orange opacity-75" />
                <Database className="block h-8 w-8 md:h-10 md:w-10 text-accent-orange opacity-75" />
                <Code className="block h-8 w-8 md:h-10 md:w-10 text-accent-orange opacity-75" />
                <Server className="block h-8 w-8 md:h-10 md:w-10 text-accent-orange opacity-75" />
              </OrbitingCircles>
            </OrbitingCircles>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: solutionVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <TextReveal
              text="TARS unifies your enterprise data ecosystem. Our multi-agent system understands context, intent, and business needs, making information accessible and actionable."
              className="text-text-secondary text-lg md:text-xl leading-relaxed"
            />
            <Link href="#architecture-section" className="mt-8 inline-block">
              <Button
                variant="link"
                className="text-accent-green hover:text-accent-green-muted text-lg"
              >
                Explore the Architecture <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
