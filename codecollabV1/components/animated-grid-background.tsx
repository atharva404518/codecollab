"use client"

import { useEffect, useRef } from "react"

export default function AnimatedGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight

    // Clear any existing grid items
    container.innerHTML = ""

    // Create grid
    const gridSize = 30
    const cols = Math.ceil(containerWidth / gridSize)
    const rows = Math.ceil(containerHeight / gridSize)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const gridItem = document.createElement("div")
        gridItem.classList.add("grid-item")

        // Position
        gridItem.style.left = `${i * gridSize}px`
        gridItem.style.top = `${j * gridSize}px`

        // Random animation delay
        const delay = Math.random() * 5
        gridItem.style.animationDelay = `${delay}s`

        // Significantly increased opacity for better visibility
        const opacity = Math.random() * 0.3 + 0.15
        gridItem.style.opacity = opacity.toString()

        container.appendChild(gridItem)
      }
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <div ref={containerRef} className="animated-grid-bg absolute inset-0 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/60 z-1"></div>
    </div>
  )
}

