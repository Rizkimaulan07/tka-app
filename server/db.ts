import "dotenv/config"
import pg from "pg"

const { Pool } = pg

export const connectionString =
  process.env.DATABASE_URL ??
  "postgres://postgres@127.0.0.1:55432/siap_tka"

export const pool = new Pool({
  connectionString,
  ssl:
    process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
  max: 10,
})

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error)
})
