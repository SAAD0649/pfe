"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Plus, LogOut, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NecessiteuxDashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [myNeeds, setMyNeeds] = useState([])
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    needType: "autre",
  })

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.userType !== "necessiteux") {
        router.push("/signin")
      } else {
        fetchMyNeeds()
      }
    }
  }, [user, isLoading, router])

  const fetchMyNeeds = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/needs/my-needs", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMyNeeds(data.needs)
      }
    } catch (error) {
      console.error("Fetch needs error:", error)
    } finally {
      setIsLoadingNeeds(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/needs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la publication")
      }

      toast({
        title: "Besoin publié",
        description: "Votre besoin a été publié avec succès",
      })

      setIsDialogOpen(false)
      setFormData({ title: "", description: "", imageUrl: "", needType: "autre" })
      fetchMyNeeds()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
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
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Entraide</span>
            <span className="ml-2 text-sm text-muted-foreground">Nécessiteux</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Besoins</h1>
            <p className="text-muted-foreground">Gérez et publiez vos besoins</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Publier un besoin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Publier un nouveau besoin</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="needType">Type de besoin</Label>
                  <select
                    id="needType"
                    value={formData.needType}
                    onChange={(e) => setFormData({ ...formData, needType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="nourriture">🍞 Nourriture</option>
                    <option value="vetements">👕 Vêtements</option>
                    <option value="soins">🏥 Soins médicaux</option>
                    <option value="logement">🏠 Logement</option>
                    <option value="scolarite">🎒 Scolarité</option>
                    <option value="medicaments">💊 Médicaments</option>
                    <option value="financier">💼 Aide financière</option>
                    <option value="autre">📦 Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Besoin de vêtements d'hiver"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre besoin en détail..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Publication..." : "Publier"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Needs List */}
        {isLoadingNeeds ? (
          <div className="text-center text-muted-foreground">Chargement de vos besoins...</div>
        ) : myNeeds.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Aucun besoin publié</h3>
              <p className="mb-4 text-sm text-muted-foreground">Commencez par publier votre premier besoin</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Publier un besoin
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myNeeds.map((need) => (
              <Card key={need._id}>
                {need.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={need.imageUrl || "/placeholder.svg"}
                      alt={need.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{need.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Publié le {new Date(need.createdAt).toLocaleDateString("fr-FR")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{need.description}</p>
                  <div className="mt-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        need.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {need.status === "active" ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

