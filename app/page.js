import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Users, Gift, TrendingUp, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b glass-effect">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              Entraide
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="ghost" className="hover-lift">
                Se connecter
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-linear-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-accent/10 to-secondary/10 px-4 py-24 mt-8">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

          <div className="relative mx-auto max-w-3xl text-center animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Plateforme de Solidarité
            </div>

            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
              Ensemble pour une{" "}
              <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                communauté solidaire
              </span>
            </h1>

            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              Connectez donnateurs et personnes dans le besoin. Partagez, aidez et créez des liens dans votre
              communauté.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-linear-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
                >
                  Commencer maintenant
                </Button>
              </Link>
              <Link href="/signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto hover-lift bg-transparent">
                  J'ai déjà un compte
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 mb-16 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border-2 bg-card p-8 hover-lift animate-fade-in">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Pour les Nécessiteux</h3>
            <p className="text-muted-foreground leading-relaxed">
              Publiez vos besoins avec photos et descriptions. La communauté est là pour vous aider.
            </p>
          </div>

          <div
            className="group rounded-2xl border-2 bg-card p-8 hover-lift animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-accent/20 to-primary/20 group-hover:from-accent/30 group-hover:to-primary/30 transition-colors">
              <Gift className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Pour les Donnateurs</h3>
            <p className="text-muted-foreground leading-relaxed">
              Découvrez les besoins par ville, contactez directement et partagez ce que vous avez.
            </p>
          </div>

          <div
            className="group rounded-2xl border-2 bg-card p-8 hover-lift animate-fade-in md:col-span-2 lg:col-span-1"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-success/20 to-accent/20 group-hover:from-success/30 group-hover:to-accent/30 transition-colors">
              <Shield className="h-6 w-6 text-success" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Sécurisé et Fiable</h3>
            <p className="text-muted-foreground leading-relaxed">
              Authentification sécurisée, profils vérifiés et suivi en temps réel de vos actions.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl rounded-2xl bg-linear-to-br from-primary to-accent p-12 text-center text-primary-foreground mb-16 animate-scale-in">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <div className="text-4xl font-bold">100%</div>
              </div>
              <div className="text-sm opacity-90">Gratuit et accessible</div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                <div className="text-4xl font-bold">24/7</div>
              </div>
              <div className="text-sm opacity-90">Support communautaire</div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-center gap-2">
                <Heart className="h-6 w-6" />
                <div className="text-4xl font-bold">∞</div>
              </div>
              <div className="text-sm opacity-90">Actes de générosité</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-muted/30 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Plateforme d'entraide communautaire - Ensemble, nous sommes plus forts</p>
        </div>
      </footer>
    </div>
  )
}
