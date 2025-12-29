import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyPassword, createToken } from "@/lib/auth"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("donation_platform")

    // Find user
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    // Create JWT token
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType,
    })

    return NextResponse.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    })
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
