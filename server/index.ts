import { randomUUID } from "node:crypto"
import express, { type ErrorRequestHandler } from "express"
import cors from "cors"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"
import { pool } from "./db.js"

const app = express()
const port = Number(process.env.PORT ?? 3001)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, "../dist")

app.use(cors())
app.use(express.json({ limit: "2mb" }))

const subjectIdSchema = z.enum([
  "matematika",
  "bahasa-indonesia",
  "bahasa-inggris",
  "penalaran-umum",
])

const difficultySchema = z.enum(["mudah", "sedang", "sulit"])
const questionTypeSchema = z.enum([
  "pilihan-ganda",
  "pilihan-ganda-kompleks",
  "benar-salah",
])

const questionDraftSchema = z.object({
  subjectId: subjectIdSchema,
  topic: z.string().trim().min(1),
  difficulty: difficultySchema,
  type: questionTypeSchema,
  prompt: z.string().trim().min(1),
  options: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        text: z.string().trim().min(1),
      }),
    )
    .min(2),
  correctOptionIds: z.array(z.string().trim().min(1)).min(1),
  explanation: z.string().trim().min(1),
})

const attemptSchema = z.object({
  id: z.string().min(1),
  examId: z.string().min(1),
  examTitle: z.string().min(1),
  subjectIds: z.array(subjectIdSchema),
  startedAt: z.string().min(1),
  finishedAt: z.string().min(1),
  answers: z.record(z.string(), z.array(z.string())),
  flagged: z.array(z.string()),
  score: z.number().int().min(0).max(100),
  correctCount: z.number().int().min(0),
  total: z.number().int().min(0),
  timeSpentSeconds: z.number().int().min(0),
})

const questionColumns = `
  id,
  subject_id AS "subjectId",
  topic,
  difficulty,
  type,
  prompt,
  options,
  correct_option_ids AS "correctOptionIds",
  explanation
`

const attemptColumns = `
  id,
  exam_id AS "examId",
  exam_title AS "examTitle",
  subject_ids AS "subjectIds",
  started_at AS "startedAt",
  finished_at AS "finishedAt",
  answers,
  flagged,
  score,
  correct_count AS "correctCount",
  total,
  time_spent_seconds AS "timeSpentSeconds"
`

async function getQuestions() {
  const result = await pool.query(
    `SELECT ${questionColumns}
     FROM questions
     ORDER BY sort_order ASC, created_at ASC`,
  )
  return result.rows
}

async function getAttempts() {
  const result = await pool.query(
    `SELECT ${attemptColumns}
     FROM attempts
     ORDER BY finished_at DESC`,
  )
  return result.rows
}

async function getRecaps() {
  const result = await pool.query(
    `SELECT
       id,
       name,
       class_name AS "className",
       score,
       progress,
       status,
       submitted_at AS "submittedAt"
     FROM student_recaps
     ORDER BY name ASC`,
  )
  return result.rows
}

async function getClasses() {
  const result = await pool.query(
    `SELECT
       class_name AS "className",
       students,
       average
     FROM classes
     ORDER BY class_name ASC`,
  )
  return result.rows
}

app.get("/api/health", async (_request, response) => {
  await pool.query("SELECT 1")
  response.json({ ok: true, database: "postgresql" })
})

app.get("/api/bootstrap", async (_request, response) => {
  const [questions, attempts, recaps, classes] = await Promise.all([
    getQuestions(),
    getAttempts(),
    getRecaps(),
    getClasses(),
  ])

  response.setHeader("Cache-Control", "no-store")
  response.json({ questions, attempts, recaps, classes })
})

app.get("/api/questions", async (_request, response) => {
  response.json(await getQuestions())
})

app.post("/api/questions", async (request, response) => {
  const draft = questionDraftSchema.parse(request.body)
  const result = await pool.query(
    `INSERT INTO questions (
       id, subject_id, topic, difficulty, type, prompt,
       options, correct_option_ids, explanation, sort_order
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9,
       COALESCE((SELECT MIN(sort_order) - 1 FROM questions), 0)
     )
     RETURNING ${questionColumns}`,
    [
      `q-custom-${randomUUID()}`,
      draft.subjectId,
      draft.topic,
      draft.difficulty,
      draft.type,
      draft.prompt,
      JSON.stringify(draft.options),
      JSON.stringify(draft.correctOptionIds),
      draft.explanation,
    ],
  )

  response.status(201).json(result.rows[0])
})

app.put("/api/questions/:id", async (request, response) => {
  const draft = questionDraftSchema.parse(request.body)
  const result = await pool.query(
    `UPDATE questions
     SET subject_id = $2,
         topic = $3,
         difficulty = $4,
         type = $5,
         prompt = $6,
         options = $7,
         correct_option_ids = $8,
         explanation = $9,
         updated_at = now()
     WHERE id = $1
     RETURNING ${questionColumns}`,
    [
      request.params.id,
      draft.subjectId,
      draft.topic,
      draft.difficulty,
      draft.type,
      draft.prompt,
      JSON.stringify(draft.options),
      JSON.stringify(draft.correctOptionIds),
      draft.explanation,
    ],
  )

  if (result.rowCount === 0) {
    response.status(404).json({ error: "Soal tidak ditemukan." })
    return
  }

  response.json(result.rows[0])
})

app.delete("/api/questions/:id", async (request, response) => {
  const result = await pool.query(
    "DELETE FROM questions WHERE id = $1 RETURNING id",
    [request.params.id],
  )

  if (result.rowCount === 0) {
    response.status(404).json({ error: "Soal tidak ditemukan." })
    return
  }

  response.json({ ok: true, id: request.params.id })
})

app.get("/api/attempts", async (_request, response) => {
  response.json(await getAttempts())
})

app.post("/api/attempts", async (request, response) => {
  const attempt = attemptSchema.parse(request.body)
  const result = await pool.query(
    `INSERT INTO attempts (
       id, exam_id, exam_title, subject_ids, started_at, finished_at,
       answers, flagged, score, correct_count, total, time_spent_seconds
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (id) DO UPDATE SET
       answers = EXCLUDED.answers,
       flagged = EXCLUDED.flagged,
       score = EXCLUDED.score,
       correct_count = EXCLUDED.correct_count,
       total = EXCLUDED.total,
       time_spent_seconds = EXCLUDED.time_spent_seconds,
       finished_at = EXCLUDED.finished_at
     RETURNING ${attemptColumns}`,
    [
      attempt.id,
      attempt.examId,
      attempt.examTitle,
      JSON.stringify(attempt.subjectIds),
      attempt.startedAt,
      attempt.finishedAt,
      JSON.stringify(attempt.answers),
      JSON.stringify(attempt.flagged),
      attempt.score,
      attempt.correctCount,
      attempt.total,
      attempt.timeSpentSeconds,
    ],
  )

  response.status(201).json(result.rows[0])
})

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((request, response, next) => {
    if (request.method !== "GET" || request.path.startsWith("/api")) {
      next()
      return
    }
    response.sendFile(path.join(distDir, "index.html"))
  })
}

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "Endpoint API tidak ditemukan." })
})

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof z.ZodError) {
    response.status(400).json({
      error: "Data yang dikirim tidak valid.",
      details: error.issues,
    })
    return
  }

  console.error(error)
  response.status(500).json({
    error:
      "Terjadi kesalahan pada server. Pastikan database PostgreSQL sudah berjalan.",
  })
}

app.use(errorHandler)

const server = app.listen(port, () => {
  console.log(`API SiapTKA berjalan di http://127.0.0.1:${port}`)
  console.log(
    fs.existsSync(distDir)
      ? `Frontend produksi: http://127.0.0.1:${port}`
      : "Mode API saja. Jalankan Vite untuk frontend.",
  )
})

async function shutdown() {
  server.close()
  await pool.end()
}

process.on("SIGINT", () => void shutdown())
process.on("SIGTERM", () => void shutdown())
