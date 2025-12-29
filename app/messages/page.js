"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, Send, ArrowLeft, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function MessagesContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin")
    } else if (user) {
      fetchConversations()

      // Check if redirected from need card
      const userId = searchParams.get("userId")
      const needId = searchParams.get("needId")
      if (userId && needId) {
        startNewConversation(userId, needId)
      }
    }
  }, [user, isLoading, router, searchParams])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Fetch conversations error:", error)
    }
  }

  const startNewConversation = async (recipientId, needId) => {
    setSelectedConversation({ recipientId, needId })
    await fetchMessages(recipientId, needId)
  }

  const fetchMessages = async (recipientId, needId) => {
    setIsLoadingMessages(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/messages?recipientId=${recipientId}&needId=${needId || ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Fetch messages error:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setIsSending(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedConversation.recipientId,
          needId: selectedConversation.needId,
          content: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        await fetchMessages(selectedConversation.recipientId, selectedConversation.needId)
        fetchConversations()
      } else {
        throw new Error("Erreur lors de l'envoi")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Messagerie</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune conversation</p>
              ) : (
                conversations.map((conv) => (
                  <Button
                    key={conv._id}
                    variant={selectedConversation?.recipientId === conv.otherUser._id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => startNewConversation(conv.otherUser._id, conv.needId)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{conv.otherUser.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</span>
                    </div>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{selectedConversation ? "Discussion" : "Sélectionnez une conversation"}</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedConversation ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageCircle className="mb-4 h-12 w-12" />
                  <p>Sélectionnez ou démarrez une conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-[400px] overflow-y-auto space-y-3 p-4 bg-muted/20 rounded-lg">
                    {isLoadingMessages ? (
                      <div className="text-center text-muted-foreground">Chargement...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted-foreground">Aucun message. Commencez la conversation!</div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.senderId === user.userId ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.senderId === user.userId
                                ? "bg-primary text-primary-foreground"
                                : "bg-background border"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <span className="text-xs opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      disabled={isSending}
                    />
                    <Button type="submit" disabled={isSending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
