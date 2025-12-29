"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Heart, Gift, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [userType, setUserType] = useState("donnateur")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, city, userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur d'inscription")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      toast({
        title: "Compte créé avec succès",
        description: `Bienvenue ${data.user.name}!`,
      })

      if (data.user.userType === "donnateur") {
        router.push("/dashboard/donnateur")
      } else {
        router.push("/dashboard/necessiteux")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>Rejoignez la communauté d'entraide</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                type="text"
                placeholder="Ex: Paris, Lyon, Marseille..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-3">
              <Label>Type de compte</Label>
              <RadioGroup value={userType} onValueChange={setUserType}>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="donnateur" id="donnateur" />
                  <Label htmlFor="donnateur" className="flex flex-1 cursor-pointer items-center gap-3">
                    <Gift className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Donnateur</div>
                      <div className="text-sm text-muted-foreground">Je veux aider et donner</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="necessiteux" id="necessiteux" />
                  <Label htmlFor="necessiteux" className="flex flex-1 cursor-pointer items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Nécessiteux</div>
                      <div className="text-sm text-muted-foreground">J'ai besoin d'aide</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer mon compte"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Vous avez déjà un compte?{" "}
            <Link href="/signin" className="text-primary underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
