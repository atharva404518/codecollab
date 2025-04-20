"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion } from "framer-motion"

interface NavbarProps {
  scrolled: boolean
}

export default function Navbar({ scrolled }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Security", href: "/#security" },
    { name: "Docs", href: "/#docs" },
    { name: "FAQ", href: "/#faq" },
    { name: "Contact", href: "/contact" },
  ]

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.div variants={itemVariants} className="flex items-center">
            <Link href="/" className="text-2xl font-bold flex items-center">
              <span className="text-white mr-1">Code -</span>
              <span className="text-primary">Collab</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <motion.div key={link.name} variants={itemVariants}>
                <Link
                  href={link.href}
                  className="text-gray-300 hover:text-primary transition-colors nav-link text-sm"
                  onClick={(e) => {
                    if (link.href.startsWith("/#")) {
                      e.preventDefault()
                      document.querySelector(link.href.substring(1))?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                  }}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            <motion.div variants={itemVariants}>
              <Link href="/signin">
                <Button className="glow-button bg-primary hover:bg-primary/90 text-white">Get Started</Button>
              </Link>
            </motion.div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-black/95 backdrop-blur-sm"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-primary transition-colors"
                  onClick={(e) => {
                    if (link.href.startsWith("/#")) {
                      e.preventDefault()
                      setMobileMenuOpen(false)
                      document.querySelector(link.href.substring(1))?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                  }}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navLinks.length * 0.1 }}
            >
              <Link href="/signin">
                <Button className="w-full mt-2 glow-button bg-primary hover:bg-primary/90 text-white">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

