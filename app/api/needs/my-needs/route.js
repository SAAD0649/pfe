import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request) {
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

    const client = await clientPromise
    const db = client.db("donation_platform")

    const needs = await db
      .collection("needs")
      .find({ userId: new ObjectId(payload.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ needs })
  } catch (error) {
    console.error("Get my needs error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
