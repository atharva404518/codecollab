"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Check } from "lucide-react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"

export default function ContactPage() {
  const [scrolled, setScrolled] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setName("")
      setEmail("")
      setMessage("")

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    }, 1500)
  }

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
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Have questions or feedback? We'd love to hear from you. Reach out to our team and we'll get back to you
                as soon as possible.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeIn}
                className="bg-secondary p-8 rounded-lg border border-gray-800"
              >
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary/20 border border-primary rounded-lg p-4 flex items-center"
                  >
                    <Check className="h-6 w-6 text-primary mr-2" />
                    <p>Thank you for your message! We'll get back to you soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Name
                      </label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                        className="form-input bg-black/50 border-gray-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        required
                        className="form-input bg-black/50 border-gray-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Your message"
                        required
                        className="form-input bg-black/50 border-gray-700 min-h-[150px]"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full glow-button bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer}
              >
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                <div className="space-y-6">
                  <motion.div variants={fadeIn} className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-gray-400">info@code-collab.com</p>
                      <p className="text-gray-400">support@code-collab.com</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeIn} className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-gray-400">+1 (555) 123-4567</p>
                      <p className="text-gray-400">+1 (555) 987-6543</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeIn} className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-gray-400">123 Innovation Drive</p>
                      <p className="text-gray-400">San Francisco, CA 94103</p>
                    </div>
                  </motion.div>
                </div>

                {/* Map (Static for now) */}
                <motion.div variants={fadeIn} className="mt-8 rounded-lg overflow-hidden border border-gray-800">
                  <img
                    src="/placeholder.svg?height=300&width=600"
                    alt="Map"
                    className="w-full h-[300px] object-cover"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-secondary">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.div variants={fadeIn} className="bg-black/50 p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-semibold mb-2">Is Code-Collab free to use?</h3>
                <p className="text-gray-400">
                  Yes, Code-Collab offers a free tier with basic features. We also offer premium plans for teams and
                  organizations that need advanced features and higher usage limits.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="bg-black/50 p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-semibold mb-2">How many people can collaborate in a single room?</h3>
                <p className="text-gray-400">
                  Our free tier supports up to 5 concurrent users in a room. Premium plans allow for larger teams with
                  up to 50 users per room.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="bg-black/50 p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-semibold mb-2">Is my code secure on Code-Collab?</h3>
                <p className="text-gray-400">
                  Yes, we take security seriously. All code and communications are encrypted, and we never store your
                  code permanently unless you explicitly save it to your account.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="bg-black/50 p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-semibold mb-2">How does the AI code enhancement work?</h3>
                <p className="text-gray-400">
                  Our AI analyzes your code and suggests improvements for readability, performance, and best practices.
                  It can add documentation, fix bugs, and optimize your code with a single click.
                </p>
              </motion.div>
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
              <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Code-Collab. All rights reserved.</p>
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

