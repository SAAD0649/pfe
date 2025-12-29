import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

// GET all needs
export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db("donation_platform")

    const needs = await db
      .collection("needs")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            title: 1,
            description: 1,
            imageUrl: 1,
            needType: 1, // Added needType to projection
            createdAt: 1,
            status: 1,
            userId: 1, // Added userId to projection for messaging
            "user.name": 1,
            "user.email": 1,
            "user.phone": 1,
            "user.city": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ needs })
  } catch (error) {
    console.error("Get needs error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST create new need
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }

    if (payload.userType !== "necessiteux") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { title, description, imageUrl, needType } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description requis" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("donation_platform")

    const result = await db.collection("needs").insertOne({
      userId: new ObjectId(payload.userId),
      title,
      description,
      imageUrl: imageUrl || null,
      needType: needType || "autre",
      status: "active",
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: "Besoin publié avec succès",
      needId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Create need error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
