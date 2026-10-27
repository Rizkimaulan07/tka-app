import { EXAM_MAP } from "@/data/exams"
import { SUBJECTS, SUBJECT_MAP } from "@/data/subjects"
import type {
  Attempt,
  Exam,
  Question,
  SubjectId,
  Subject,
} from "@/types"
import { average } from "@/lib/utils"

export function isAnswerCorrect(
  question: Question,
  selected: string[] | undefined,
) {
  if (!selected || selected.length === 0) return false
  const expected = [...question.correctOptionIds].sort()
  const actual = [...selected].sort()
  return (
    expected.length === actual.length &&
    expected.every((value, index) => value === actual[index])
  )
}

export function gradeExam(
  exam: Exam,
  questions: Question[],
  answers: Record<string, string[]>,
) {
  const questionMap = new Map(questions.map((question) => [question.id, question]))
  const validIds = exam.questionIds.filter((id) => questionMap.has(id))
  let correctCount = 0

  for (const questionId of validIds) {
    const question = questionMap.get(questionId)!
    if (isAnswerCorrect(question, answers[questionId])) {
      correctCount += 1
    }
  }

  const total = validIds.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0

  return { correctCount, total, score }
}

export interface SubjectPerformance {
  subject: Subject
  correct: number
  total: number
  percentage: number
}

export function getSubjectPerformance(
  attempts: Attempt[],
  questions: Question[],
  examMap: Record<string, Exam> = EXAM_MAP,
): SubjectPerformance[] {
  const questionMap = new Map(questions.map((question) => [question.id, question]))
  const buckets = new Map<
    SubjectId,
    { correct: number; total: number }
  >()

  for (const attempt of attempts) {
    const exam = examMap[attempt.examId]
    if (!exam) continue

    for (const questionId of exam.questionIds) {
      const question = questionMap.get(questionId)
      if (!question) continue
      const bucket = buckets.get(question.subjectId) ?? {
        correct: 0,
        total: 0,
      }
      bucket.total += 1
      if (isAnswerCorrect(question, attempt.answers[questionId])) {
        bucket.correct += 1
      }
      buckets.set(question.subjectId, bucket)
    }
  }

  return SUBJECTS.filter((subject) => buckets.has(subject.id)).map(
    (subject) => {
      const bucket = buckets.get(subject.id)!
      return {
        subject,
        correct: bucket.correct,
        total: bucket.total,
        percentage:
          bucket.total > 0
            ? Math.round((bucket.correct / bucket.total) * 100)
            : 0,
      }
    },
  )
}

export interface TopicPerformance {
  topic: string
  subjectId: SubjectId
  correct: number
  total: number
  percentage: number
}

export function getTopicPerformance(
  attempts: Attempt[],
  questions: Question[],
  examMap: Record<string, Exam> = EXAM_MAP,
): TopicPerformance[] {
  const questionMap = new Map(questions.map((question) => [question.id, question]))
  const buckets = new Map<
    string,
    { subjectId: SubjectId; correct: number; total: number }
  >()

  for (const attempt of attempts) {
    const exam = examMap[attempt.examId]
    if (!exam) continue

    for (const questionId of exam.questionIds) {
      const question = questionMap.get(questionId)
      if (!question) continue
      const key = `${question.subjectId}::${question.topic}`
      const bucket = buckets.get(key) ?? {
        subjectId: question.subjectId,
        correct: 0,
        total: 0,
      }
      bucket.total += 1
      if (isAnswerCorrect(question, attempt.answers[questionId])) {
        bucket.correct += 1
      }
      buckets.set(key, bucket)
    }
  }

  return [...buckets.entries()]
    .map(([key, bucket]) => ({
      topic: key.split("::")[1]!,
      subjectId: bucket.subjectId,
      correct: bucket.correct,
      total: bucket.total,
      percentage:
        bucket.total > 0
          ? Math.round((bucket.correct / bucket.total) * 100)
          : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
}

export function getAttemptSubjects(
  attempt: Attempt,
  questions: Question[],
  examMap: Record<string, Exam> = EXAM_MAP,
): SubjectPerformance[] {
  return getSubjectPerformance([attempt], questions, examMap)
}

export function getAttemptQuestions(
  attempt: Attempt,
  questions: Question[],
  examMap: Record<string, Exam> = EXAM_MAP,
) {
  const exam = examMap[attempt.examId]
  if (!exam) return []
  const questionMap = new Map(questions.map((question) => [question.id, question]))
  return exam.questionIds
    .map((id) => questionMap.get(id))
    .filter((question): question is Question => Boolean(question))
}

export function getScoreTrend(attempts: Attempt[]) {
  return [...attempts]
    .sort(
      (a, b) =>
        new Date(a.finishedAt).getTime() - new Date(b.finishedAt).getTime(),
    )
    .map((attempt, index) => ({
      label: `Tes ${index + 1}`,
      score: attempt.score,
      examTitle: attempt.examTitle,
      date: attempt.finishedAt,
    }))
}

export function getOverallStats(attempts: Attempt[], questions: Question[]) {
  const sorted = [...attempts].sort(
    (a, b) =>
      new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime(),
  )
  const latest = sorted[0]
  const previous = sorted[1]
  const correct = attempts.reduce(
    (sum, attempt) => sum + attempt.correctCount,
    0,
  )
  const total = attempts.reduce((sum, attempt) => sum + attempt.total, 0)

  return {
    averageScore: Math.round(average(attempts.map((attempt) => attempt.score))),
    bestScore: attempts.length
      ? Math.max(...attempts.map((attempt) => attempt.score))
      : 0,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    totalAttempts: attempts.length,
    totalQuestions: total,
    latestScore: latest?.score ?? 0,
    delta: latest && previous ? latest.score - previous.score : 0,
    answeredQuestions: questions.length,
  }
}

export function getSubjectShort(id: SubjectId) {
  return SUBJECT_MAP[id].short
}
