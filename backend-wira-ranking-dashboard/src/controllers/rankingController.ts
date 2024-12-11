import { Request, Response } from "express";
import pool from "../config/db";

export const getRankings = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, class_id, search } = req.query;

  const offset = (Number(page) - 1) * Number(pageSize);
  try {
    const query = `
      SELECT 
        accounts.username, characters.class_id, scores.reward_score AS top_score, 
        RANK() OVER (PARTITION BY characters.class_id ORDER BY scores.reward_score DESC) AS rank
      FROM accounts
      JOIN characters ON accounts.acc_id = characters.acc_id
      JOIN scores ON characters.char_id = scores.char_id
      WHERE characters.class_id = $1 
      AND accounts.username ILIKE $2
      ORDER BY top_score DESC
      LIMIT $3 OFFSET $4
    `;

    const values = [class_id ?? 1, `%${search || ""}%`, pageSize, offset];
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
};
