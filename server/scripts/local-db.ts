import { spawnSync, type SpawnSyncOptions } from "node:child_process"
import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
)
const dataDir = path.resolve(process.env.PGDATA_DIR ?? path.join(rootDir, ".pgdata"))
const logFile = path.join(dataDir, "postgres.log")
const port = process.env.PGPORT ?? "55432"
const database = process.env.PGDATABASE ?? "siap_tka"
const user = process.env.PGUSER ?? "postgres"
const isWindows = process.platform === "win32"

function findPgBin() {
  if (process.env.PG_BIN) return process.env.PG_BIN

  const candidates = isWindows
    ? [
        "C:\\Program Files\\PostgreSQL\\17\\bin",
        "C:\\Program Files\\PostgreSQL\\16\\bin",
        "C:\\Program Files\\PostgreSQL\\15\\bin",
      ]
    : ["/usr/lib/postgresql/17/bin", "/usr/lib/postgresql/16/bin"]

  for (const candidate of candidates) {
    const executable = path.join(
      candidate,
      isWindows ? "pg_ctl.exe" : "pg_ctl",
    )
    if (fs.existsSync(executable)) return candidate
  }

  // Fallback ke PATH.
  return ""
}

const pgBin = findPgBin()

function executable(name: string) {
  return pgBin ? path.join(pgBin, isWindows ? `${name}.exe` : name) : name
}

function run(name: string, args: string[], options: SpawnSyncOptions = {}) {
  const result = spawnSync(executable(name), args, {
    stdio: "inherit",
    ...options,
  })

  if (result.error) {
    throw result.error
  }

  return result.status ?? 1
}

function capture(name: string, args: string[]) {
  const result = spawnSync(executable(name), args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  }
}

function isInitialized() {
  return fs.existsSync(path.join(dataDir, "PG_VERSION"))
}

function assertPgTools() {
  const check = spawnSync(executable("pg_ctl"), ["--version"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })

  if (check.error) {
    throw new Error(
      "PostgreSQL tidak ditemukan. Install PostgreSQL 15+ terlebih dahulu, atau atur PG_BIN ke folder bin PostgreSQL (contoh: C:\\Program Files\\PostgreSQL\\17\\bin).",
    )
  }
}

function isRunning() {
  if (!isInitialized()) return false
  return run("pg_ctl", ["-D", dataDir, "status"], { stdio: "ignore" }) === 0
}

function configureCluster() {
  const configFile = path.join(dataDir, "postgresql.conf")
  const marker = "# --- SiapTKA local development ---"
  const current = fs.existsSync(configFile)
    ? fs.readFileSync(configFile, "utf8")
    : ""

  if (current.includes(marker)) return

  fs.appendFileSync(
    configFile,
    [
      "",
      marker,
      `port = ${port}`,
      "listen_addresses = '127.0.0.1'",
      "max_connections = 50",
      "",
    ].join("\n"),
  )
}

function ensureDatabase() {
  const check = capture("psql", [
    "-h",
    "127.0.0.1",
    "-p",
    port,
    "-U",
    user,
    "-d",
    "postgres",
    "-tAc",
    `SELECT 1 FROM pg_database WHERE datname = '${database}'`,
  ])

  if (check.status !== 0) {
    throw new Error(
      `Gagal memeriksa database.\n${check.stderr.trim() || "psql tidak dapat terhubung."}`,
    )
  }

  if (check.stdout.trim() === "1") return

  const created = run("createdb", [
    "-h",
    "127.0.0.1",
    "-p",
    port,
    "-U",
    user,
    database,
  ])

  if (created !== 0) {
    throw new Error(`Gagal membuat database "${database}".`)
  }

  console.log(`Database "${database}" berhasil dibuat.`)
}

function start() {
  assertPgTools()

  if (!isInitialized()) {
    console.log(`Menyiapkan cluster PostgreSQL baru di ${dataDir}...`)
    const status = run("initdb", [
      "-D",
      dataDir,
      "-U",
      user,
      "-A",
      "trust",
      "-E",
      "UTF8",
      "--locale=C",
    ])

    if (status !== 0) {
      throw new Error(
        "initdb gagal. Pastikan PostgreSQL 15+ sudah terpasang, atau atur PG_BIN ke folder bin PostgreSQL.",
      )
    }
  }

  configureCluster()

  if (isRunning()) {
    console.log("PostgreSQL lokal sudah berjalan.")
  } else {
    console.log("Menjalankan PostgreSQL lokal...")
    const status = run("pg_ctl", [
      "-D",
      dataDir,
      "-l",
      logFile,
      "-w",
      "start",
    ])

    if (status !== 0) {
      throw new Error(
        `PostgreSQL gagal dijalankan. Lihat log di ${logFile} untuk detailnya.`,
      )
    }
  }

  ensureDatabase()

  console.log("")
  console.log(`PostgreSQL siap di 127.0.0.1:${port}`)
  console.log(`Database: ${database} (user: ${user}, tanpa password)`)
  console.log("")
}

function stop() {
  if (!isInitialized()) {
    console.log("Cluster PostgreSQL lokal belum dibuat. Tidak ada yang perlu dihentikan.")
    return
  }

  if (!isRunning()) {
    console.log("PostgreSQL lokal tidak sedang berjalan.")
    return
  }

  console.log("Menghentikan PostgreSQL lokal...")
  const status = run("pg_ctl", ["-D", dataDir, "-m", "fast", "-w", "stop"])

  if (status !== 0) {
    throw new Error("PostgreSQL gagal dihentikan.")
  }

  console.log("PostgreSQL lokal berhasil dihentikan.")
}

function status() {
  console.log(`Data directory : ${dataDir}`)
  console.log(`Port           : ${port}`)
  console.log(`Database       : ${database}`)

  if (!isInitialized()) {
    console.log("Status         : belum dibuat (jalankan: npm run db:start)")
    return
  }

  if (!isRunning()) {
    console.log("Status         : berhenti (jalankan: npm run db:start)")
    return
  }

  const check = capture("psql", [
    "-h",
    "127.0.0.1",
    "-p",
    port,
    "-U",
    user,
    "-d",
    "postgres",
    "-tAc",
    `SELECT 1 FROM pg_database WHERE datname = '${database}'`,
  ])

  console.log("Status         : berjalan")
  console.log(
    `Database siap  : ${check.status === 0 && check.stdout.trim() === "1" ? "ya" : "belum (jalankan: npm run db:setup)"}`,
  )
}

function reset() {
  console.log("Menghapus seluruh data PostgreSQL lokal SiapTKA...")
  stop()

  if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true, force: true })
  }

  console.log("Cluster lama dihapus. Membuat cluster baru...")
  start()
  console.log("Jalankan: npm run db:setup")
}

const command = process.argv[2] ?? "start"

try {
  switch (command) {
    case "start":
      start()
      break
    case "stop":
      stop()
      break
    case "status":
      status()
      break
    case "reset":
      reset()
      break
    default:
      console.error(
        `Perintah tidak dikenal: ${command}. Gunakan start, stop, status, atau reset.`,
      )
      process.exitCode = 1
  }
} catch (error) {
  console.error("")
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
