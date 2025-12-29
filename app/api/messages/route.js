import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

// GET messages
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

    const { searchParams } = new URL(request.url)
    const recipientId = searchParams.get("recipientId")
    const needId = searchParams.get("needId")

    const client = await clientPromise
    const db = client.db("donation_platform")

    const query = {
      $or: [
        { senderId: new ObjectId(payload.userId), recipientId: new ObjectId(recipientId) },
        { senderId: new ObjectId(recipientId), recipientId: new ObjectId(payload.userId) },
      ],
    }

    if (needId) {
      query.needId = new ObjectId(needId)
    }

    const messages = await db.collection("messages").find(query).sort({ createdAt: 1 }).toArray()

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST send message
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

    const { recipientId, needId, content } = await request.json()

    if (!recipientId || !content) {
      return NextResponse.json({ error: "Destinataire et contenu requis" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("donation_platform")

    const result = await db.collection("messages").insertOne({
      senderId: new ObjectId(payload.userId),
      recipientId: new ObjectId(recipientId),
      needId: needId ? new ObjectId(needId) : null,
      content,
      read: false,
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: "Message envoyé",
      messageId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}