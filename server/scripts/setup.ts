import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { CLASS_PERFORMANCE, SEED_ATTEMPTS, STUDENT_RECAPS } from "../../src/data/seed.js"
import { QUESTION_BANK } from "../../src/data/questions.js"
import { connectionString, pool } from "../db.js"

const schemaPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../schema.sql",
)

async function seed() {
  const schema = fs.readFileSync(schemaPath, "utf8")
  await pool.query(schema)

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    for (const [index, question] of QUESTION_BANK.entries()) {
      await client.query(
        `INSERT INTO questions (
           id, subject_id, topic, difficulty, type, prompt,
           options, correct_option_ids, explanation, sort_order
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          question.id,
          question.subjectId,
          question.topic,
          question.difficulty,
          question.type,
          question.prompt,
          JSON.stringify(question.options),
          JSON.stringify(question.correctOptionIds),
          question.explanation,
          index,
        ],
      )
    }

    for (const attempt of SEED_ATTEMPTS) {
      await client.query(
        `INSERT INTO attempts (
           id, exam_id, exam_title, subject_ids, started_at, finished_at,
           answers, flagged, score, correct_count, total, time_spent_seconds
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
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
    }

    for (const recap of STUDENT_RECAPS) {
      await client.query(
        `INSERT INTO student_recaps (
           id, name, class_name, score, progress, status, submitted_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          recap.id,
          recap.name,
          recap.className,
          recap.score,
          recap.progress,
          recap.status,
          recap.submittedAt,
        ],
      )
    }

    for (const item of CLASS_PERFORMANCE) {
      await client.query(
        `INSERT INTO classes (class_name, students, average)
         VALUES ($1, $2, $3)
         ON CONFLICT (class_name) DO NOTHING`,
        [item.className, item.students, item.average],
      )
    }

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }

  const counts = await pool.query<{
    questions: string
    attempts: string
    recaps: string
    classes: string
  }>(
    `SELECT
       (SELECT count(*) FROM questions) AS questions,
       (SELECT count(*) FROM attempts) AS attempts,
       (SELECT count(*) FROM student_recaps) AS recaps,
       (SELECT count(*) FROM classes) AS classes`,
  )

  const row = counts.rows[0]
  console.log("Database SiapTKA berhasil disiapkan.")
  console.log(`  Soal          : ${row?.questions ?? 0}`)
  console.log(`  Riwayat ujian : ${row?.attempts ?? 0}`)
  console.log(`  Rekap siswa   : ${row?.recaps ?? 0}`)
  console.log(`  Kelas         : ${row?.classes ?? 0}`)
}

try {
  console.log(`Menghubungkan ke ${connectionString.replace(/:[^:@/]+@/, ":***@")}...`)
  await seed()
} catch (error) {
  console.error("")
  console.error("Gagal menyiapkan database.")
  console.error(error instanceof Error ? error.message : error)
  console.error("")
  console.error("Pastikan PostgreSQL lokal sudah berjalan: npm run db:start")
  process.exitCode = 1
} finally {
  await pool.end()
}
