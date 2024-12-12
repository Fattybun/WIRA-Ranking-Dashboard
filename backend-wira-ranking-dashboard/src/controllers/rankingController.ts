import { Request, Response } from "express";
import pool from "../config/db";

export const getRankings = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, class_id, search } = req.query;

  const offset = (Number(page) - 1) * Number(pageSize);
  try {
    const query = `
      WITH RankedScores AS (
        SELECT 
          accounts.username, 
          characters.class_id, 
          scores.reward_score,
          DENSE_RANK() OVER (PARTITION BY characters.class_id ORDER BY scores.reward_score DESC) AS rank
        FROM scores
        JOIN characters ON scores.char_id = characters.char_id
        JOIN accounts ON characters.acc_id = accounts.acc_id
        WHERE characters.class_id = $1 
          AND accounts.username ILIKE $2
      )
      SELECT username, class_id, reward_score AS top_score, rank
      FROM RankedScores
      WHERE rank <= $3
      ORDER BY reward_score DESC
      LIMIT $4 OFFSET $5
    `;

    const values = [
      class_id ?? 1,
      `%${search || ""}%`,
      Number(pageSize),
      Number(pageSize),
      offset,
    ];

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
};
