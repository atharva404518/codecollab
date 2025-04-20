"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Code, Server, Database, Cpu } from "lucide-react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import { useState, useEffect } from "react"

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const teamMembers = [
    {
        name: "Sanjana",
        role: "HR",
        image: "/placeholder.svg?height=200&width=200",
        bio: "Connecting developers with our platform and ensuring a seamless experience.",
        email: "sanjanalaturkar2112@gmail.com",
        github: "#",
    },
    {
        name: "Shreyas",
        role: "CFO",
        image: "/placeholder.svg?height=200&width=200",
        bio: "Driving growth and awareness for - through strategic financial initiatives.",
        email: "shreyashborade2@gmail.com",
        github: "#",
    },
    {
        name: "Atharva",
        role: "COO",
        image: "/placeholder.svg?height=200&width=200",
        bio: "Overseeing operations and ensuring the smooth running of the - platform.",
        email: "atharva404518@gmail.com",
        github: "#",
    },
    {
        name: "Prathamesh",
        role: "CEO",
        image: "/placeholder.svg?height=200&width=200",
        bio: "Building robust and scalable features for the - platform.",
        email: "prathameshbhatkande24@gmail.com",
        github: "#",
    },
];


  const techStack = [
    { name: "Next.js", icon: <Code className="h-5 w-5" /> },
    { name: "Tailwind CSS", icon: <Code className="h-5 w-5" /> },
    { name: "Monaco Editor", icon: <Code className="h-5 w-5" /> },
    { name: "Framer Motion", icon: <Code className="h-5 w-5" /> },
    { name: "WebSockets", icon: <Server className="h-5 w-5" /> },
    { name: "Node.js", icon: <Server className="h-5 w-5" /> },
    { name: "PostgreSQL", icon: <Database className="h-5 w-5" /> },
    { name: "AI Integration", icon: <Cpu className="h-5 w-5" /> },
  ]

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar scrolled={scrolled} />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About <span className="text-primary">-</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We're building the future of collaborative coding, where teams can work together seamlessly, enhance
                their code with AI, and stay in sync effortlessly.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-16 px-4 bg-secondary">
          <div className="max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeIn}>
              <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
              <div className="bg-black/50 p-8 rounded-lg border border-gray-800">
                <p className="text-lg text-gray-300 leading-relaxed">
                  At Code-Collab, we believe that coding should be a collaborative and enjoyable experience. Our mission
                  is to empower developers with AI-enhanced collaboration tools that make working together on code as
                  seamless as possible.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed mt-4">
                  We're focused on removing the friction from collaborative coding, allowing teams to focus on what
                  matters most: building great software together. By combining real-time collaboration, AI enhancements,
                  and integrated communication tools, we're creating a platform that transforms how developers work
                  together.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Our Team</h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  whileHover={{ y: -5 }}
                  className="bg-secondary p-6 rounded-lg border border-gray-800"
                >
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-center">{member.name}</h3>
                  <p className="text-primary text-center mb-2">{member.role}</p>
                  <p className="text-gray-400 text-center mb-3">{member.bio}</p>
                  {member.email && <p className="text-gray-400 text-center text-sm mb-3">📧 {member.email}</p>}
                  <div className="flex justify-center">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      <Github className="h-6 w-6" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16 px-4 bg-secondary">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Our Tech Stack</h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            >
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  whileHover={{ scale: 1.05 }}
                  className="bg-black/50 p-4 rounded-lg border border-gray-800 flex flex-col items-center"
                >
                  <div className="bg-primary/10 p-3 rounded-full mb-3">{tech.icon}</div>
                  <span className="text-sm font-medium">{tech.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeIn}>
              <h2 className="text-3xl font-bold mb-6">
                Ready to <span className="text-primary">Join Us</span>?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Start collaborating with your team today and experience the future of coding together.
              </p>
              <Link href="/">
                <Button size="lg" className="glow-button bg-primary hover:bg-primary/90 text-white">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">
                Code<span className="text-primary">Collab</span>
              </h3>
              <p className="text-gray-400 text-sm">© {new Date().getFullYear()} -. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-400 hover:text-primary transition-colors footer-link">
                Home
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-primary transition-colors footer-link">
                About
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-primary transition-colors footer-link">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

