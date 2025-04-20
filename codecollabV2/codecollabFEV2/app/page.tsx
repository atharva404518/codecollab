"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Code2,
  MessageSquare,
  Zap,
  Globe,
  Star,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Shield,
  Lock,
  Eye,
  Check,
  X,
  Users,
  Server,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/navbar";
import AnimatedGridBackground from "@/components/animated-grid-background";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CreateRoomDialog from "@/components/CreateRoomDialog";
import JoinRoomDialog from "@/components/JoinRoomDialog";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Amit Sharma",
      role: "Senior Developer",
      image: "/placeholder.svg?height=80&width=80",
      text: "Code-Collab has transformed how our team works together. The real-time collaboration and AI features are game-changers!",
    },
    {
      id: 2,
      name: "Neha Verma",
      role: "Tech Lead",
      image: "/placeholder.svg?height=80&width=80",
      text: "I love how seamless the experience is. The built-in chat and music sharing create a fun, productive environment.",
    },
    {
      id: 3,
      name: "Rohan Iyer",
      role: "Freelance Developer",
      image: "/placeholder.svg?height=80&width=80",
      text: "As someone who works with different clients, Code-Collab makes it easy to collaborate without any setup. Highly recommended!",
    },
    {
      id: 4,
      name: "Pooja Nair",
      role: "Software Architect",
      image: "/placeholder.svg?height=80&width=80",
      text: "The AI code enhancement feature has saved our team countless hours of refactoring and debugging. It's like having an extra team member!",
    },
    {
      id: 5,
      name: "Arjun Mehta",
      role: "Open Source Contributor",
      image: "/placeholder.svg?height=80&width=80",
      text: "I use Code-Collab for all my open-source projects now. The ability to quickly spin up a room and collaborate is unmatched.",
    },
    {
      id: 6,
      name: "Priya Patel",
      role: "CS Student",
      image: "/placeholder.svg?height=80&width=80",
      text: "As a student, Code-Collab has been invaluable for group projects. We can code together in real-time, even when we're not in the same location.",
    },
  ];

  // Features data
  const features = [
    {
      icon: <Code2 className="h-10 w-10 text-primary feature-icon" />,
      title: "Real-time Collaborative Coding",
      description:
        "Work on the same codebase simultaneously with your team. See changes as they happen with syntax highlighting.",
      size: "span-4 span-row-2",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary feature-icon" />,
      title: "AI-Assisted Coding",
      description:
        "Click once, and AI instantly improves your code with better practices, documentation, and optimizations.",
      size: "span-2 span-row-2",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary feature-icon" />,
      title: "Independent Chat System",
      description:
        "Communicate inside the room seamlessly with your team. Share ideas and discuss code in real-time.",
      size: "span-3",
    },
    {
      icon: <Globe className="h-10 w-10 text-primary feature-icon" />,
      title: "Multi-Language Support",
      description:
        "JavaScript, Python, C++, and many more languages supported with full syntax highlighting and formatting.",
      size: "span-3",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary feature-icon" />,
      title: "Secure Authentication",
      description:
        "Protect your code with modern authentication. Control who can view and edit your collaborative projects.",
      size: "span-3",
    },
    {
      icon: <Server className="h-10 w-10 text-primary feature-icon" />,
      title: "Fast & Lightweight",
      description:
        "Enjoy a low-latency experience with our optimized infrastructure. No lag, just smooth real-time collaboration.",
      size: "span-3",
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "How does real-time collaboration work?",
      answer:
        "Our platform uses WebSockets to enable real-time collaboration. When you make changes to your code, they're instantly transmitted to everyone else in the room. This allows multiple developers to work on the same codebase simultaneously without conflicts or delays.",
    },
    {
      question: "Can I use this for pair programming?",
      answer:
        "Code-Collab is perfect for pair programming. You can see each other's changes in real-time, communicate through the built-in chat, and even use the AI assistant to help improve your code. It's like sitting next to each other, even when you're miles apart.",
    },
    {
      question: "What programming languages are supported?",
      answer:
        "We support a wide range of programming languages including JavaScript, TypeScript, Python, Java, C++, C#, Ruby, PHP, Go, Rust, and many more. Each language comes with syntax highlighting and formatting to enhance your coding experience.",
    },
    {
      question: "Is my code secure on Code-Collab?",
      answer:
        "Yes, security is our top priority. All connections are encrypted end-to-end, and we never store your code permanently unless you explicitly save it. You have complete control over who can access your coding rooms through secure invitation links.",
    },
    {
      question: "Do I need to create an account to use Code-Collab?",
      answer:
        "No, you can start using Code-Collab without creating an account. Simply create a room and share the link with your collaborators. However, creating an account gives you additional features like saving your coding sessions and managing your rooms.",
    },
    {
      question: "How does the AI code enhancement work?",
      answer:
        "Our AI code enhancement analyzes your code and suggests improvements for readability, performance, and best practices. It can add documentation, fix bugs, and optimize your code with a single click. The AI is trained on millions of code repositories to provide the best suggestions possible.",
    },
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      scale: 1.03,
      rotateX: "2deg",
      rotateY: "2deg",
      boxShadow: "0 0 15px 2px rgba(16, 185, 129, 0.2)",
    },
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar scrolled={scrolled} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden py-20">
        {/* Background grid with proper z-index */}
        <AnimatedGridBackground />

        {/* Content container with proper z-index */}
        <div className="container mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Headline with improved visibility */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="mb-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
                Code Together,{" "}
                <span className="text-primary">Effortlessly!</span>
              </h1>
            </motion.div>

            {/* Subheading with improved visibility */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-xl md:text-2xl mb-10 text-gray-200"
            >
              Real-time collaboration with AI-powered enhancements for seamless
              coding experiences.
            </motion.p>

            {/* Trust Badges with improved visibility */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex flex-wrap justify-center mb-8 gap-2"
            >
              <div className="trust-badge bg-black/30 backdrop-blur-sm">
                <Users className="h-4 w-4 trust-badge-icon" />
                <span className="text-sm">Used by 10,000+ developers</span>
              </div>
              <div className="trust-badge bg-black/30 backdrop-blur-sm">
                <Shield className="h-4 w-4 trust-badge-icon" />
                <span className="text-sm">End-to-end encrypted</span>
              </div>
              <div className="trust-badge bg-black/30 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 trust-badge-icon" />
                <span className="text-sm">AI-powered enhancements</span>
              </div>
            </motion.div>

            {/* CTA Buttons with improved visibility */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <CreateRoomDialog />
              <JoinRoomDialog />
            </motion.div>

            {/* Demo Room Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6"
            >
              <Link href="/room/qwerty">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  Join Demo Room 🚀
                  <span className="ml-2 text-xs bg-black text-white px-2 py-1 rounded-full">
                    No Setup Required
                  </span>
                </Button>
              </Link>
              <p className="text-xs text-gray-400 mt-2">
                Instantly join our demo room to try the platform without any
                setup
              </p>
            </motion.div>

            {/* Illustration with improved visibility and responsive design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-12 max-w-3xl mx-auto"
            >
              <div className="relative bg-black/40 p-2 rounded-lg border border-gray-800 shadow-xl">
                <img
                  src="./live-coding-illustration.png"
                  alt="Live coding illustration"
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-lg pointer-events-none"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with Bento Grid */}
      <section id="features" ref={featuresRef} className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-primary">Powerful</span> Features
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="bento-grid md:grid-cols-6 grid-cols-1"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={featureCardVariants}
                whileHover={{ y: -5, borderColor: "rgba(16, 185, 129, 0.3)" }}
                className={`bento-item ${feature.size}`}
              >
                <div className="bento-item-icon">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-secondary">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose <span className="text-primary">Code-Collab</span>?
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeIn}
            className="overflow-x-auto"
          >
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="text-left">Features</th>
                  <th className="text-center">Sandbox</th>
                  <th className="text-center">Replit</th>
                  <th className="text-center">Code-Collab</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>No Bloatware</td>
                  <td className="text-center">
                    <X className="h-5 w-5 comparison-x inline" />
                  </td>
                  <td className="text-center">
                    <X className="h-5 w-5 comparison-x inline" />
                  </td>
                  <td className="text-center">
                    <Check className="h-5 w-5 comparison-check inline" />
                  </td>
                </tr>
                <tr>
                  <td>Low-Latency Real-Time Sync</td>
                  <td className="text-center">
                    <X className="h-5 w-5 comparison-x inline" />
                  </td>
                  <td className="text-center">
                    <Check className="h-5 w-5 comparison-check inline" />
                  </td>
                  <td className="text-center">
                    <Check className="h-5 w-5 comparison-check inline" />
                  </td>
                </tr>
                <tr>
                  <td>Privacy-Focused</td>
                  <td className="text-center">
                    <X className="h-5 w-5 comparison-x inline" />
                  </td>
                  <td className="text-center">
                    <X className="h-5 w-5 comparison-x inline" />
                  </td>
                  <td className="text-center">
                    <Check className="h-5 w-5 comparison-check inline" />
                  </td>
                </tr>
                <tr>
                  <td>AI Code Enhancement</td>
                  <td className="text-center">
                    <Check className="h-5 w-5 comparison-check inline" />
                  </td>
                  <td className="text-center">
                    <X className="h-5 w-5 comparison-x inline" />
                  </td>
                  <td className="text-center">
                    <Check className="h-5 w-5 comparison-check inline" />
                  </td>
                </tr>
                <tr>
                  <td>Instant Setup</td>
                  <td className="text-center">
                    <X className="h-5 w-5 comparison-x inline" />
                  </td>
                  <td className="text-center">
                    <Check className="h-5 w-5 comparison-check inline" />
                  </td>
                  <td className="text-center">
                    <Check className="h-5 w-5 comparison-check inline" />
                  </td>
                </tr>
                <tr>
                  <td>Built-in Music Player</td>
                  <td className="text-center">
                    <X className="h-5 w-5 comparison-x inline" />
                  </td>
                  <td className="text-center">
                    <X className="h-5 w-5 comparison-x inline" />
                  </td>
                  <td className="text-center">
                    <Check className="h-5 w-5 comparison-check inline" />
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              What <span className="text-primary">Developers</span> Say
            </h2>
          </motion.div>

          <div className="relative h-64">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: index === currentTestimonial ? 1 : 0,
                  x: index === currentTestimonial ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute top-0 left-0 w-full ${
                  index === currentTestimonial
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                }`}
              >
                <div className="bg-secondary p-6 rounded-lg border border-gray-800">
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                    <div className="ml-auto flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.text}"</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full mx-1 ${
                  index === currentTestimonial ? "bg-primary" : "bg-gray-600"
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section id="security" ref={securityRef} className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Security & <span className="text-primary">Compliance</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Your code and data security is our top priority. We implement
              industry-leading security measures to keep your information safe.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={fadeIn}
              className="security-card p-6 rounded-lg"
            >
              <div className="flex justify-center mb-4">
                <Lock className="h-12 w-12 security-icon" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                End-to-End Encryption
              </h3>
              <p className="text-gray-400 text-center">
                All communications between users are encrypted, ensuring your
                code and messages remain private and secure.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="security-card p-6 rounded-lg"
            >
              <div className="flex justify-center mb-4">
                <Eye className="h-12 w-12 security-icon" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                No Data Tracking
              </h3>
              <p className="text-gray-400 text-center">
                We don't track or store your code permanently. Your privacy is
                respected at all times.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="security-card p-6 rounded-lg"
            >
              <div className="flex justify-center mb-4">
                <Github className="h-12 w-12 security-icon" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Open Source Transparency
              </h3>
              <p className="text-gray-400 text-center">
                Our commitment to security is backed by open-source
                transparency, allowing the community to verify our practices.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeIn}
            className="mt-12 text-center"
          >
            <div className="inline-block border border-gray-800 rounded-lg p-4 bg-secondary/30">
              <p className="text-gray-300">
                <Shield className="h-5 w-5 inline-block mr-2 text-primary" />
                Our platform undergoes regular security audits to ensure the
                highest standards of protection.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        ref={faqRef}
        className="py-20 px-4 bg-gradient-to-b from-secondary to-black"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="space-y-4"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <AccordionItem
                    value={`item-${index}`}
                    className="border border-gray-800 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-secondary/50 transition-all">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4 bg-black/50">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-black via-secondary/30 to-black">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Coding in <span className="text-primary">Real-Time</span> Now!
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of developers who are already coding smarter, not
            harder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CreateRoomDialog />
            <JoinRoomDialog />
          </div>
          <p className="text-gray-400 mt-6 text-sm">
            No installation needed, start instantly!
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800 bg-black backdrop-blur-sm bg-opacity-80">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1 - About */}
            <div>
              <h3 className="text-xl font-bold mb-4">
                Code<span className="text-primary">Collab</span>
              </h3>
              <p className="text-gray-400 mb-4">
                A real-time collaborative coding platform with AI enhancements
                and built-in communication tools.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="social-icon text-gray-400 hover:text-primary"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="social-icon text-gray-400 hover:text-primary"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="social-icon text-gray-400 hover:text-primary"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Column 2 - Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-primary footer-link"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="text-gray-400 hover:text-primary footer-link"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#security"
                    className="text-gray-400 hover:text-primary footer-link"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="text-gray-400 hover:text-primary footer-link"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-primary footer-link"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-primary footer-link"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-primary footer-link"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-primary footer-link"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-400 mb-4">
                Subscribe to our newsletter for the latest updates and features.
              </p>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-secondary/50 border-gray-700 form-input rounded-r-none"
                />
                <Button className="rounded-l-none">Subscribe</Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Code-Collab. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-primary mx-3 footer-link"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-primary mx-3 footer-link"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-primary mx-3 footer-link"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
