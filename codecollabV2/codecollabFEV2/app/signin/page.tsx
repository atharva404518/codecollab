"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github, Mail } from "lucide-react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"

export default function SignInPage() {
  const [scrolled, setScrolled] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate sign in process
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/"
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar scrolled={scrolled} />

      <main className="pt-20">
        <section className="py-20 px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="bg-secondary p-8 rounded-lg border border-gray-800 shadow-lg"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">
                  Sign In to <span className="text-primary">Code-Collab</span>
                </h1>
                <p className="text-gray-400 mt-2">Continue your collaborative coding journey</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="form-input bg-black/50 border-gray-700"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password
                    </label>
                    <Link href="#" className="text-xs text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="form-input bg-black/50 border-gray-700"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full glow-button bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
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
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-secondary px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="border-gray-700 hover:bg-primary/10 hover:text-primary">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button variant="outline" className="border-gray-700 hover:bg-primary/10 hover:text-primary">
                  <Mail className="h-4 w-4 mr-2" />
                  Google
                </Button>
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-400">Don't have an account?</span>{" "}
                <Link href="#" className="text-primary hover:underline">
                  Sign Up
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 bg-black">
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

