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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Plus, LogOut, Package, Users, MapPin, Filter, Phone, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DonnateurDashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [myDonations, setMyDonations] = useState([])
  const [allNeeds, setAllNeeds] = useState([])
  const [filteredNeeds, setFilteredNeeds] = useState([])
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedNeedType, setSelectedNeedType] = useState("all")
  const [cities, setCities] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  })

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.userType !== "donnateur") {
        router.push("/signin")
      } else {
        fetchData()
      }
    }
  }, [user, isLoading, router])

  useEffect(() => {
    let filtered = allNeeds

    if (selectedCity !== "all") {
      filtered = filtered.filter((need) => need.user.city === selectedCity)
    }

    if (selectedNeedType !== "all") {
      filtered = filtered.filter((need) => need.needType === selectedNeedType)
    }

    setFilteredNeeds(filtered)
  }, [selectedCity, selectedNeedType, allNeeds])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")

      const donationsResponse = await fetch("/api/donations/my-donations", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json()
        setMyDonations(donationsData.donations)
      }

      const needsResponse = await fetch("/api/needs")

      if (needsResponse.ok) {
        const needsData = await needsResponse.json()
        setAllNeeds(needsData.needs)
        setFilteredNeeds(needsData.needs)

        const uniqueCities = [...new Set(needsData.needs.map((need) => need.user.city))].filter(Boolean)
        setCities(uniqueCities)
      }
    } catch (error) {
      console.error("Fetch data error:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/donations", {
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
        title: "Donation publiée",
        description: "Votre donation a été publiée avec succès",
      })

      setIsDialogOpen(false)
      setFormData({ title: "", description: "", imageUrl: "" })
      fetchData()
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
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Entraide</span>
            <span className="ml-2 text-sm text-muted-foreground">Donnateur</span>
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">Gérez vos donations et découvrez les besoins</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Publier une donation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Publier une nouvelle donation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Vêtements d'hiver disponibles"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez ce que vous offrez..."
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

        <Tabs defaultValue="needs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="needs" className="gap-2">
              <Users className="h-4 w-4" />
              Besoins disponibles
            </TabsTrigger>
            <TabsTrigger value="donations" className="gap-2">
              <Package className="h-4 w-4" />
              Mes donations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="needs" className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="city-filter" className="text-sm font-medium">
                  Ville:
                </Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger id="city-filter" className="w-48">
                    <SelectValue placeholder="Toutes les villes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Label htmlFor="type-filter" className="text-sm font-medium">
                  Type:
                </Label>
                <Select value={selectedNeedType} onValueChange={setSelectedNeedType}>
                  <SelectTrigger id="type-filter" className="w-48">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="nourriture">🍞 Nourriture</SelectItem>
                    <SelectItem value="vetements">👕 Vêtements</SelectItem>
                    <SelectItem value="soins">🏥 Soins médicaux</SelectItem>
                    <SelectItem value="logement">🏠 Logement</SelectItem>
                    <SelectItem value="scolarite">🎒 Scolarité</SelectItem>
                    <SelectItem value="medicaments">💊 Médicaments</SelectItem>
                    <SelectItem value="financier">💼 Aide financière</SelectItem>
                    <SelectItem value="autre">📦 Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedCity !== "all" || selectedNeedType !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCity("all")
                    setSelectedNeedType("all")
                  }}
                >
                  Réinitialiser
                </Button>
              )}
            </div>

            {isLoadingData ? (
              <div className="text-center text-muted-foreground">Chargement des besoins...</div>
            ) : filteredNeeds.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">
                    {selectedCity === "all" ? "Aucun besoin disponible" : `Aucun besoin à ${selectedCity}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCity === "all"
                      ? "Il n'y a pas de besoins publiés pour le moment"
                      : "Essayez de sélectionner une autre ville"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredNeeds.map((need) => (
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
                      <div className="mb-2">
                        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {need.needType === "nourriture" && "🍞 Nourriture"}
                          {need.needType === "vetements" && "👕 Vêtements"}
                          {need.needType === "soins" && "🏥 Soins médicaux"}
                          {need.needType === "logement" && "🏠 Logement"}
                          {need.needType === "scolarite" && "🎒 Scolarité"}
                          {need.needType === "medicaments" && "💊 Médicaments"}
                          {need.needType === "financier" && "💼 Aide financière"}
                          {need.needType === "autre" && "📦 Autre"}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2">{need.title}</CardTitle>
                      <CardDescription className="text-xs">
                        Par {need.user.name} • {new Date(need.createdAt).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-3 text-sm text-muted-foreground">{need.description}</p>
                      <div className="space-y-1 border-t pt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{need.user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{need.user.city}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-3 bg-transparent"
                        variant="outline"
                        onClick={() => (window.location.href = `/messages?userId=${need.userId}&needId=${need._id}`)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contacter
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="donations">
            {isLoadingData ? (
              <div className="text-center text-muted-foreground">Chargement de vos donations...</div>
            ) : myDonations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">Aucune donation publiée</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Commencez par publier votre première donation</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Publier une donation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myDonations.map((donation) => (
                  <Card key={donation._id}>
                    {donation.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={donation.imageUrl || "/placeholder.svg"}
                          alt={donation.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{donation.title}</CardTitle>
                      <CardDescription className="text-xs">
                        Publié le {new Date(donation.createdAt).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-muted-foreground">{donation.description}</p>
                      <div className="mt-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            donation.status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {donation.status === "available" ? "Disponible" : "Non disponible"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
