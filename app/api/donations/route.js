import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

// GET all donations
export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db("donation_platform")

    const donations = await db
      .collection("donations")
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
            createdAt: 1,
            status: 1,
            "user.name": 1,
            "user.email": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ donations })
  } catch (error) {
    console.error("Get donations error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST create new donation
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

    if (payload.userType !== "donnateur") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { title, description, imageUrl } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description requis" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("donation_platform")

    const result = await db.collection("donations").insertOne({
      userId: new ObjectId(payload.userId),
      title,
      description,
      imageUrl: imageUrl || null,
      status: "available",
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: "Donation publiée avec succès",
      donationId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Create donation error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
