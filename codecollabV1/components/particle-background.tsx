"use client"

import { useEffect, useRef } from "react"

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight

    // Clear any existing particles
    container.innerHTML = ""

    // Create particles
    const particleCount = 20
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.classList.add("particle")

      // Random size between 5px and 20px
      const size = Math.random() * 15 + 5
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      // Random position
      const posX = Math.random() * containerWidth
      const posY = Math.random() * containerHeight
      particle.style.left = `${posX}px`
      particle.style.top = `${posY}px`

      // Random animation duration and delay
      const duration = Math.random() * 10 + 10
      const delay = Math.random() * 5
      particle.style.animationDuration = `${duration}s`
      particle.style.animationDelay = `${delay}s`

      // Random opacity
      particle.style.opacity = (Math.random() * 0.3 + 0.1).toString()

      container.appendChild(particle)
    }
  }, [])

  return <div ref={containerRef} className="particles-bg"></div>
}

