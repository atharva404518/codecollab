"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import {
  ArrowLeft,
  Send,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Zap,
  Copy,
  Users,
  Plus,
  Search,
  PlayCircle,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Mock data
const MOCK_USERS = [
  { id: 1, name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40", online: true },
  { id: 2, name: "Sarah Chen", avatar: "/placeholder.svg?height=40&width=40", online: true },
  { id: 3, name: "Michael Rodriguez", avatar: "/placeholder.svg?height=40&width=40", online: false },
]

const MOCK_CHAT_MESSAGES = [
  { id: 1, userId: 1, text: "Hey team, I'm working on the authentication module.", timestamp: "10:30 AM" },
  { id: 2, userId: 2, text: "Great! I'll focus on the UI components then.", timestamp: "10:32 AM" },
  { id: 3, userId: 1, text: "Let me know if you need any help with the API integration.", timestamp: "10:35 AM" },
  { id: 4, userId: 3, text: "I just pushed some updates to the database schema.", timestamp: "10:40 AM" },
  { id: 5, userId: 2, text: "Looks good! I'll update my components to match.", timestamp: "10:42 AM" },
]

const MOCK_SONGS = [
  { id: 1, title: "Coding Focus", artist: "Lo-Fi Beats", cover: "/placeholder.svg?height=60&width=60", duration: 183 },
  {
    id: 2,
    title: "Deep Concentration",
    artist: "Ambient Sounds",
    cover: "/placeholder.svg?height=60&width=60",
    duration: 240,
  },
  { id: 3, title: "Productivity Mix", artist: "Chillhop", cover: "/placeholder.svg?height=60&width=60", duration: 195 },
  {
    id: 4,
    title: "Coding Rhythm",
    artist: "Electronic Vibes",
    cover: "/placeholder.svg?height=60&width=60",
    duration: 210,
  },
  {
    id: 5,
    title: "Late Night Coding",
    artist: "Synthwave",
    cover: "/placeholder.svg?height=60&width=60",
    duration: 225,
  },
]

// Additional songs for the "Add More Music" feature
const ADDITIONAL_SONGS = [
  { id: 6, title: "Focus Flow", artist: "Ambient Works", cover: "/placeholder.svg?height=60&width=60", duration: 245 },
  { id: 7, title: "Deep Work", artist: "Study Beats", cover: "/placeholder.svg?height=60&width=60", duration: 198 },
  { id: 8, title: "Coding Jazz", artist: "Smooth Vibes", cover: "/placeholder.svg?height=60&width=60", duration: 220 },
  { id: 9, title: "Night Coding", artist: "Chill Hop", cover: "/placeholder.svg?height=60&width=60", duration: 205 },
  {
    id: 10,
    title: "Algorithm Beats",
    artist: "Tech Sounds",
    cover: "/placeholder.svg?height=60&width=60",
    duration: 230,
  },
]

const INITIAL_CODE = `// Welcome to Code-Collab!
// Start coding together in real-time.

function greet(name) {
  return "Hello, " + name + "!";
}

// Try the AI Enhancer to improve this code
console.log(greet("World"));
`

const ENHANCED_CODE = `// Welcome to Code-Collab!
// Start coding together in real-time.

/**
 * Greets a user with a personalized message
 * @param {string} name - The name to greet
 * @returns {string} - The greeting message
 */
function greet(name) {
  // Handle edge cases
  if (!name || typeof name !== 'string') {
    return "Hello, friend!";
  }
  
  // Return the greeting with proper string interpolation
  return \`Hello, \${name}!\`;
}

// Try the AI Enhancer to improve this code
console.log(greet("World"));
`

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const [code, setCode] = useState(INITIAL_CODE)
  const [language, setLanguage] = useState("javascript")
  const [chatMessage, setChatMessage] = useState("")
  const [messages, setMessages] = useState(MOCK_CHAT_MESSAGES)
  const [currentSong, setCurrentSong] = useState(MOCK_SONGS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([70])
  const [currentTime, setCurrentTime] = useState(0)
  const [enhancedCode, setEnhancedCode] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [playlist, setPlaylist] = useState(MOCK_SONGS)
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<Array<{ type: string; content: string }>>([])
  const [isRunning, setIsRunning] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Scroll to bottom of terminal when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  // Simulate song progress
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && currentTime < currentSong.duration) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentSong.duration) {
            clearInterval(interval)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentTime, currentSong.duration])

  // Simulate typing indicator
  useEffect(() => {
    if (chatMessage.length > 0) {
      setIsTyping(true)
    } else {
      setIsTyping(false)
    }
  }, [chatMessage])

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value)
      // Reset enhanced code state when user makes changes
      if (enhancedCode) {
        setEnhancedCode(false)
      }
    }
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        userId: 1, // Current user
        text: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages([...messages, newMessage])
      setChatMessage("")
    }
  }

  const handleEnhanceCode = () => {
    // Simulate AI enhancement with loading state
    setIsEnhancing(true)

    setTimeout(() => {
      setCode(ENHANCED_CODE)
      setEnhancedCode(true)
      setIsEnhancing(false)

      toast({
        title: "Code Enhanced",
        description: "AI has improved your code with better practices and documentation.",
      })
    }, 1500)
  }

  const handleRunCode = () => {
    setIsRunning(true)
    setTerminalOutput((prev) => [...prev, { type: "info", content: "> Running code..." }])

    // Simulate code execution
    setTimeout(() => {
      try {
        // For JavaScript, we can actually try to evaluate the code
        if (language === "javascript") {
          // Create a safe evaluation environment
          const consoleLog = (output: any) => {
            setTerminalOutput((prev) => [
              ...prev,
              {
                type: "success",
                content: typeof output === "object" ? JSON.stringify(output) : String(output),
              },
            ])
          }

          // Replace console.log with our custom function
          const codeToEval = code.replace(/console\.log\(/g, "consoleLog(")

          // Try to evaluate the code
          try {
            // eslint-disable-next-line no-new-func
            new Function("consoleLog", codeToEval)(consoleLog)
            setTerminalOutput((prev) => [...prev, { type: "info", content: "> Code executed successfully" }])
          } catch (error) {
            if (error instanceof Error) {
              setTerminalOutput((prev) => [...prev, { type: "error", content: `Error: ${error.message}` }])
            }
          }
        } else {
          // For other languages, just simulate output
          if (code.includes("print") || code.includes("console.log") || code.includes("echo")) {
            setTerminalOutput((prev) => [...prev, { type: "success", content: "Hello, World!" }])
          }
          setTerminalOutput((prev) => [...prev, { type: "info", content: "> Code executed successfully" }])
        }
      } catch (error) {
        if (error instanceof Error) {
          setTerminalOutput((prev) => [...prev, { type: "error", content: `Error: ${error.message}` }])
        }
      } finally {
        setIsRunning(false)
      }
    }, 1000)
  }

  const handleClearTerminal = () => {
    setTerminalOutput([])
  }

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    toast({
      title: "Room ID Copied",
      description: "Room ID has been copied to clipboard.",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleNextSong = () => {
    const currentIndex = playlist.findIndex((song) => song.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    setCurrentSong(playlist[nextIndex])
    setCurrentTime(0)
  }

  const handlePrevSong = () => {
    const currentIndex = playlist.findIndex((song) => song.id === currentSong.id)
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length
    setCurrentSong(playlist[prevIndex])
    setCurrentTime(0)
  }

  const handleAddSong = (song: (typeof ADDITIONAL_SONGS)[0]) => {
    if (!playlist.some((s) => s.id === song.id)) {
      setPlaylist([...playlist, song])
      toast({
        title: "Song Added",
        description: `"${song.title}" by ${song.artist} has been added to your playlist.`,
      })
    } else {
      toast({
        title: "Song Already in Playlist",
        description: `"${song.title}" is already in your playlist.`,
      })
    }
  }

  const filteredAdditionalSongs = ADDITIONAL_SONGS.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-secondary border-b border-gray-800 p-4"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold flex items-center">
                <span className="text-white">Code</span>
                <span className="text-primary">Collab</span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-black/50 px-3 py-1 rounded-md flex items-center">
              <span className="text-sm text-gray-400 mr-2">Room ID: {roomId}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyRoomId}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-1" />
              <span className="text-sm">{MOCK_USERS.filter((u) => u.online).length}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Editor Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 p-4 flex flex-col"
        >
          <div className="mb-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-secondary text-white border border-gray-700 rounded-md px-3 py-1 text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleRunCode} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
                <PlayCircle className={`h-4 w-4 mr-2 ${isRunning ? "animate-pulse" : ""}`} />
                {isRunning ? "Running..." : "Run Code"}
              </Button>

              <Button
                onClick={handleEnhanceCode}
                disabled={isEnhancing || enhancedCode}
                className={`ai-enhancer-button ${
                  enhancedCode ? "bg-green-700 hover:bg-green-700/90" : "bg-primary hover:bg-primary/90"
                }`}
              >
                <Zap className={`h-4 w-4 mr-2 ${isEnhancing ? "animate-pulse" : ""}`} />
                {isEnhancing ? "Enhancing..." : enhancedCode ? "Enhanced" : "Enhance Code"}
              </Button>
            </div>
          </div>

          <div className="h-[calc(100vh-20rem)] border border-gray-800 rounded-md overflow-hidden shadow-lg mb-4">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          {/* Terminal Output */}
          <div className="terminal">
            <div className="terminal-header">
              <span className="text-sm font-medium">Terminal Output</span>
              <Button variant="ghost" size="sm" onClick={handleClearTerminal} className="h-6 w-6 p-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div ref={terminalRef} className="terminal-body">
              {terminalOutput.length === 0 ? (
                <p className="text-gray-500 text-sm">Run your code to see output here</p>
              ) : (
                terminalOutput.map((line, index) => (
                  <pre key={index} className={`terminal-line ${line.type}`}>
                    {line.content}
                  </pre>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col"
        >
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start px-2 pt-2 bg-secondary border-b border-gray-800">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-20rem)] max-h-[calc(100vh-20rem)]"
              >
                {messages.map((message) => {
                  const user = MOCK_USERS.find((u) => u.id === message.userId)
                  const isCurrentUser = message.userId === 1

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}

                      <div className="max-w-[75%]">
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary text-white"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {isCurrentUser ? "You" : user?.name} • {message.timestamp}
                        </p>
                      </div>

                      {isCurrentUser && (
                        <Avatar className="h-8 w-8 ml-2">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  )
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-lg px-3 py-2 flex space-x-1">
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-800">
                <div className="flex space-x-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-secondary border-gray-700 form-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Music Tab */}
            <TabsContent value="music" className="flex-1 flex flex-col p-0 m-0">
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center space-x-4">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      src={currentSong.cover || "/placeholder.svg"}
                      alt={currentSong.title}
                      className="w-16 h-16 rounded-md"
                    />
                    <div>
                      <h3 className="font-medium">{currentSong.title}</h3>
                      <p className="text-sm text-gray-400">{currentSong.artist}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="relative w-full h-1 bg-gray-700 rounded-full">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full"
                        style={{ width: `${(currentTime / currentSong.duration) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(currentSong.duration)}</span>
                    </div>
                  </div>

                  <div className="flex justify-center items-center space-x-4 mt-4 music-player-controls">
                    <Button variant="ghost" size="icon" onClick={handlePrevSong}>
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary/90 h-10 w-10 rounded-full"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextSong}>
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Volume2 className="h-4 w-4 text-gray-400" />
                    <Slider value={volume} max={100} step={1} className="w-full" onValueChange={setVolume} />
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Playlist</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Plus className="h-3 w-3 mr-1" /> Add Music
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Music to Playlist</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search songs..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="form-input"
                            />
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {filteredAdditionalSongs.map((song) => (
                              <div
                                key={song.id}
                                className="flex items-center p-2 rounded-md hover:bg-secondary/50 cursor-pointer"
                                onClick={() => handleAddSong(song)}
                              >
                                <img
                                  src={song.cover || "/placeholder.svg"}
                                  alt={song.title}
                                  className="w-10 h-10 rounded-md mr-3"
                                />
                                <div>
                                  <h4 className="text-sm font-medium">{song.title}</h4>
                                  <p className="text-xs text-gray-400">{song.artist}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-auto h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAddSong(song)
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {filteredAdditionalSongs.length === 0 && (
                              <p className="text-sm text-gray-400 text-center py-4">No songs found</p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="space-y-2">
                    {playlist.map((song) => (
                      <div
                        key={song.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer playlist-item ${
                          currentSong.id === song.id ? "active pl-2 bg-secondary" : "hover:bg-secondary/50"
                        }`}
                        onClick={() => {
                          setCurrentSong(song)
                          setCurrentTime(0)
                          setIsPlaying(true)
                        }}
                      >
                        <img
                          src={song.cover || "/placeholder.svg"}
                          alt={song.title}
                          className="w-10 h-10 rounded-md mr-3"
                        />
                        <div>
                          <h4 className="text-sm font-medium">{song.title}</h4>
                          <p className="text-xs text-gray-400">{song.artist}</p>
                        </div>
                        {currentSong.id === song.id && isPlaying && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="flex-1 p-4 m-0">
              <h3 className="font-medium mb-3">Online Users</h3>
              <div className="space-y-2">
                {MOCK_USERS.map((user) => (
                  <motion.div key={user.id} whileHover={{ x: 5 }} className="flex items-center p-2 rounded-md">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                          user.online ? "bg-green-500" : "bg-gray-500"
                        }`}
                      ></span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.online ? "Online" : "Offline"}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

