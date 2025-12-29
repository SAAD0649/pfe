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

    const conversations = await db
      .collection("messages")
      .aggregate([
        {
          $match: {
            $or: [{ senderId: new ObjectId(payload.userId) }, { recipientId: new ObjectId(payload.userId) }],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: {
              otherUserId: {
                $cond: [{ $eq: ["$senderId", new ObjectId(payload.userId)] }, "$recipientId", "$senderId"],
              },
              needId: "$needId",
            },
            lastMessage: { $first: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id.otherUserId",
            foreignField: "_id",
            as: "otherUser",
          },
        },
        {
          $unwind: "$otherUser",
        },
        {
          $project: {
            _id: 1,
            "otherUser._id": 1,
            "otherUser.name": 1,
            "lastMessage.content": 1,
            "lastMessage.createdAt": 1,
            needId: "$_id.needId",
          },
        },
      ])
      .toArray()

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
