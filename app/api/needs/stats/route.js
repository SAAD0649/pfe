import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

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

    const stats = await db
      .collection("needs")
      .aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [{ $match: { status: "active" } }, { $count: "count" }],
            inProgress: [{ $match: { status: "in-progress" } }, { $count: "count" }],
            completed: [{ $match: { status: "completed" } }, { $count: "count" }],
            cities: [
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "user",
                },
              },
              { $unwind: "$user" },
              { $group: { _id: "$user.city", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
          },
        },
      ])
      .toArray()

    const result = {
      total: stats[0].total[0]?.count || 0,
      active: stats[0].active[0]?.count || 0,
      inProgress: stats[0].inProgress[0]?.count || 0,
      completed: stats[0].completed[0]?.count || 0,
      topCities: stats[0].cities,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}