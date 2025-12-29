import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword, createToken } from "@/lib/auth"

export async function POST(request) {
  try {
    const { name, email, password, phone, city, userType } = await request.json()

    if (!name || !email || !password || !phone || !city || !userType) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    if (!["donnateur", "necessiteux"].includes(userType)) {
      return NextResponse.json({ error: "Type utilisateur invalide" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("donation_platform")

    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      phone,
      city,
      userType,
      createdAt: new Date(),
    })

    const token = await createToken({
      userId: result.insertedId.toString(),
      email,
      userType,
    })

    return NextResponse.json({
      message: "Compte créé avec succès",
      token,
      user: {
        id: result.insertedId.toString(),
        name,
        email,
        phone,
        city,
        userType,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
