import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PATCH(request, { params }) {
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

    const { status } = await request.json()

    if (!["active", "in-progress", "completed"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("donation_platform")

    const needId = (await params).id

    const result = await db
      .collection("needs")
      .updateOne(
        { _id: new ObjectId(needId), userId: new ObjectId(payload.userId) },
        { $set: { status, updatedAt: new Date() } },
      )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Besoin non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ message: "Statut mis à jour" })
  } catch (error) {
    console.error("Update status error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
