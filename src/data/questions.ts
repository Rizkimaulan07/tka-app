import type { Question, QuestionOption, QuestionType } from "@/types"

function options(...texts: string[]): QuestionOption[] {
  return texts.map((text, index) => ({
    id: String.fromCharCode(97 + index),
    text,
  }))
}

const single: QuestionType = "pilihan-ganda"

export const QUESTION_BANK: Question[] = [
  {
    id: "q-mat-01",
    subjectId: "matematika",
    topic: "Aljabar",
    difficulty: "mudah",
    type: single,
    prompt: "Jika 3x − 7 = 2x + 5, maka nilai x adalah ...",
    options: options("10", "12", "2", "−12"),
    correctOptionIds: ["b"],
    explanation:
      "Kumpulkan suku sejenis: 3x − 2x = 5 + 7, sehingga x = 12.",
  },
  {
    id: "q-mat-02",
    subjectId: "matematika",
    topic: "Fungsi Kuadrat",
    difficulty: "sedang",
    type: single,
    prompt: "Titik puncak grafik fungsi f(x) = x² − 6x + 5 adalah ...",
    options: options("(3, −4)", "(−3, −4)", "(3, 4)", "(6, 5)"),
    correctOptionIds: ["a"],
    explanation:
      "Absis titik puncak x = −b/2a = 6/2 = 3. Substitusi x = 3: f(3) = 9 − 18 + 5 = −4. Jadi titik puncaknya (3, −4).",
  },
  {
    id: "q-mat-03",
    subjectId: "matematika",
    topic: "Peluang",
    difficulty: "sedang",
    type: single,
    prompt:
      "Dua buah dadu dilempar bersamaan. Peluang munculnya jumlah mata dadu 8 adalah ...",
    options: options("5/36", "1/6", "7/36", "1/9"),
    correctOptionIds: ["a"],
    explanation:
      "Pasangan yang berjumlah 8 adalah (2,6), (3,5), (4,4), (5,3), dan (6,2) — ada 5 dari 36 kemungkinan. Peluangnya 5/36.",
  },
  {
    id: "q-mat-04",
    subjectId: "matematika",
    topic: "Eksponen",
    difficulty: "mudah",
    type: single,
    prompt: "Nilai dari (2³ × 2⁵) ÷ 2⁴ adalah ...",
    options: options("8", "12", "16", "32"),
    correctOptionIds: ["c"],
    explanation:
      "Gunakan sifat pangkat: 2³ × 2⁵ = 2⁸, lalu 2⁸ ÷ 2⁴ = 2⁴ = 16.",
  },
  {
    id: "q-mat-05",
    subjectId: "matematika",
    topic: "Barisan & Deret",
    difficulty: "sedang",
    type: single,
    prompt: "Suku ke-10 dari barisan aritmetika 3, 7, 11, 15, ... adalah ...",
    options: options("36", "39", "40", "43"),
    correctOptionIds: ["b"],
    explanation:
      "Suku pertama a = 3 dan beda b = 4. U₁₀ = a + 9b = 3 + 9(4) = 39.",
  },
  {
    id: "q-mat-06",
    subjectId: "matematika",
    topic: "Geometri",
    difficulty: "sedang",
    type: single,
    prompt:
      "Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Volume tabung tersebut adalah ... (π = 22/7)",
    options: options("1.540 cm³", "1.450 cm³", "770 cm³", "3.080 cm³"),
    correctOptionIds: ["a"],
    explanation:
      "Volume tabung = πr²t = (22/7)(7²)(10) = 22 × 7 × 10 = 1.540 cm³.",
  },
  {
    id: "q-pen-01",
    subjectId: "penalaran-umum",
    topic: "Logika Deduktif",
    difficulty: "mudah",
    type: single,
    prompt:
      "Semua siswa kelas XII mengikuti ujian TKA. Semua yang mengikuti ujian TKA memakai kartu peserta. Kesimpulan yang paling tepat adalah ...",
    options: options(
      "Semua siswa kelas XII memakai kartu peserta.",
      "Semua pemakai kartu peserta adalah siswa kelas XII.",
      "Sebagian siswa kelas XII tidak mengikuti ujian TKA.",
      "Siswa yang memakai kartu peserta tidak mengikuti ujian TKA.",
    ),
    correctOptionIds: ["a"],
    explanation:
      "Silogisme berantai: siswa kelas XII → mengikuti TKA → memakai kartu peserta. Maka semua siswa kelas XII memakai kartu peserta.",
  },
  {
    id: "q-pen-02",
    subjectId: "penalaran-umum",
    topic: "Pola Bilangan",
    difficulty: "mudah",
    type: single,
    prompt:
      "Perhatikan pola bilangan: 2, 6, 12, 20, 30, .... Bilangan berikutnya adalah ...",
    options: options("36", "40", "42", "44"),
    correctOptionIds: ["c"],
    explanation:
      "Selisihnya bertambah 2: +4, +6, +8, +10, maka selisih berikutnya +12. Jadi 30 + 12 = 42. Polanya n(n + 1).",
  },
  {
    id: "q-pen-03",
    subjectId: "penalaran-umum",
    topic: "Analogi",
    difficulty: "mudah",
    type: single,
    prompt: "Dokter : Rumah sakit = Guru : ...",
    options: options("Buku", "Sekolah", "Murid", "Papan tulis"),
    correctOptionIds: ["b"],
    explanation:
      "Dokter bekerja di rumah sakit, sedangkan guru bekerja di sekolah. Hubungannya adalah profesi dan tempat bekerja.",
  },
  {
    id: "q-pen-04",
    subjectId: "penalaran-umum",
    topic: "Perbandingan",
    difficulty: "sedang",
    type: single,
    prompt:
      "Sebuah pekerjaan dapat diselesaikan oleh 3 pekerja dalam 12 hari. Jika dikerjakan oleh 4 pekerja dengan kecepatan yang sama, pekerjaan tersebut akan selesai dalam ...",
    options: options("8 hari", "9 hari", "10 hari", "16 hari"),
    correctOptionIds: ["b"],
    explanation:
      "Perbandingan berbalik nilai: 3 × 12 = 4 × t, sehingga t = 36/4 = 9 hari.",
  },
  {
    id: "q-pen-05",
    subjectId: "penalaran-umum",
    topic: "Penalaran Logis",
    difficulty: "sedang",
    type: single,
    prompt:
      "Jika hujan turun, maka jalan menjadi basah. Saat ini jalan tidak basah. Kesimpulan yang benar adalah ...",
    options: options(
      "Hujan turun",
      "Tidak hujan",
      "Jalan sedang diperbaiki",
      "Tidak dapat disimpulkan",
    ),
    correctOptionIds: ["b"],
    explanation:
      "Ini adalah modus tollens: p → q, ¬q, maka ¬p. Karena jalan tidak basah, dapat disimpulkan hujan tidak turun.",
  },
  {
    id: "q-pen-06",
    subjectId: "penalaran-umum",
    topic: "Logika Deduktif",
    difficulty: "sulit",
    type: "pilihan-ganda-kompleks",
    prompt:
      "Manakah pernyataan berikut yang merupakan contoh penalaran deduktif? (Pilih lebih dari satu)",
    options: options(
      "Semua manusia fana. Siti adalah manusia. Maka Siti fana.",
      "Setiap logam memuai jika dipanaskan. Besi adalah logam. Maka besi memuai jika dipanaskan.",
      "Beberapa siswa suka matematika. Andi adalah siswa. Maka Andi suka matematika.",
      "Harga cabai naik setiap musim hujan. Hari ini harga cabai naik, jadi sebentar lagi musim hujan.",
    ),
    correctOptionIds: ["a", "b"],
    explanation:
      "Penalaran deduktif bergerak dari premis umum ke kesimpulan khusus yang pasti. Pilihan A dan B mengikuti pola silogisme yang valid. Pilihan C dan D melompat ke kesimpulan yang belum tentu benar.",
  },
  {
    id: "q-bin-01",
    subjectId: "bahasa-indonesia",
    topic: "Ide Pokok",
    difficulty: "sedang",
    type: single,
    prompt:
      "Literasi digital bukan sekadar kemampuan menggunakan perangkat teknologi. Literasi digital mencakup kemampuan menilai informasi, memahami risiko privasi, dan mengambil keputusan secara bijak di ruang digital. Oleh karena itu, literasi digital perlu diajarkan secara berkelanjutan, bukan hanya melalui sosialisasi singkat.\n\nIde pokok paragraf tersebut adalah ...",
    options: options(
      "Cara menggunakan perangkat teknologi dengan benar",
      "Pentingnya literasi digital yang menyeluruh dan berkelanjutan",
      "Risiko privasi yang muncul di ruang digital",
      "Sosialisasi singkat tentang penggunaan teknologi",
    ),
    correctOptionIds: ["b"],
    explanation:
      "Paragraf menjelaskan cakupan literasi digital yang luas, lalu menegaskan perlunya pembelajaran berkelanjutan. Ide pokoknya adalah pentingnya literasi digital yang menyeluruh dan berkelanjutan.",
  },
  {
    id: "q-bin-02",
    subjectId: "bahasa-indonesia",
    topic: "Kalimat Efektif",
    difficulty: "mudah",
    type: single,
    prompt: "Kalimat berikut yang paling efektif adalah ...",
    options: options(
      "Para siswa-siswa berkumpul di aula.",
      "Kepada para peserta diharapkan hadir tepat waktu.",
      "Semua peserta wajib membawa kartu peserta.",
      "Banyak siswa-siswa yang membawa buku.",
    ),
    correctOptionIds: ["c"],
    explanation:
      "Kalimat C singkat, jelas, dan tidak mubazir. Pilihan A dan D memakai bentuk jamak ganda (para siswa-siswa, banyak siswa-siswa), sedangkan B berlebihan memakai 'kepada para'.",
  },
  {
    id: "q-bin-03",
    subjectId: "bahasa-indonesia",
    topic: "Kata Baku",
    difficulty: "mudah",
    type: single,
    prompt: "Kata baku yang tepat terdapat pada kalimat ...",
    options: options(
      "Analisa data dilakukan oleh tim.",
      "Pemerintah menganalisis dampak kebijakan tersebut.",
      "Mereka mendiskusikan hasil analisa.",
      "Kualitas pelayanan perlu di analisa.",
    ),
    correctOptionIds: ["b"],
    explanation:
      "Bentuk baku yang tepat adalah 'analisis', bukan 'analisa'. Penulisan 'di analisa' juga salah karena seharusnya disatukan menjadi 'dianalisis'.",
  },
  {
    id: "q-bin-04",
    subjectId: "bahasa-indonesia",
    topic: "Majas",
    difficulty: "mudah",
    type: single,
    prompt:
      "Majas yang digunakan pada kalimat 'Angin berbisik menyampaikan pesan malam' adalah ...",
    options: options("Personifikasi", "Metafora", "Hiperbola", "Simile"),
    correctOptionIds: ["a"],
    explanation:
      "Personifikasi memberikan sifat manusia kepada benda mati. Angin digambarkan dapat 'berbisik' dan 'menyampaikan pesan', seperti manusia.",
  },
  {
    id: "q-bin-05",
    subjectId: "bahasa-indonesia",
    topic: "Ejaan",
    difficulty: "sedang",
    type: single,
    prompt:
      "Penulisan kalimat yang sesuai dengan ejaan bahasa Indonesia adalah ...",
    options: options(
      "Rapat itu diadakan di Jakarta.",
      "Rapat itu di adakan di Jakarta.",
      "Rapat itu diadakan dijakarta.",
      "Rapat itu di adakan dijakarta.",
    ),
    correctOptionIds: ["a"],
    explanation:
      "'Di' sebagai kata depan penunjuk tempat ditulis terpisah ('di Jakarta'), sedangkan 'diadakan' adalah kata kerja berimbuhan yang ditulis serangkai.",
  },
  {
    id: "q-bin-06",
    subjectId: "bahasa-indonesia",
    topic: "Jenis Teks",
    difficulty: "mudah",
    type: "benar-salah",
    prompt:
      "Tentukan benar atau salah: Teks anekdot bertujuan menyampaikan kritik sosial melalui kisah yang mengandung humor.",
    options: options("Benar", "Salah"),
    correctOptionIds: ["a"],
    explanation:
      "Benar. Teks anekdot berisi kisah singkat yang lucu sekaligus mengandung kritik atau pesan sosial.",
  },
  {
    id: "q-eng-01",
    subjectId: "bahasa-inggris",
    topic: "Reading Comprehension",
    difficulty: "sedang",
    type: single,
    prompt:
      "Many students believe that studying longer always leads to better grades. However, research shows that the quality of study matters more than the amount of time spent. Active learning, such as summarizing and testing oneself, helps students retain information better than passive reading.\n\nWhat is the main idea of the text?",
    options: options(
      "Longer study hours guarantee better grades.",
      "Active learning is more effective than passive reading.",
      "Students should never read textbooks.",
      "Research is not important for students.",
    ),
    correctOptionIds: ["b"],
    explanation:
      "The text contrasts study time with study quality and states that active learning helps students retain information better than passive reading.",
  },
  {
    id: "q-eng-02",
    subjectId: "bahasa-inggris",
    topic: "Grammar",
    difficulty: "sedang",
    type: single,
    prompt: "Choose the correct sentence.",
    options: options(
      "She have studied English for three years.",
      "She has been studying English for three years.",
      "She is study English since three years.",
      "She studying English three years ago.",
    ),
    correctOptionIds: ["b"],
    explanation:
      "The present perfect continuous ('has been studying') is used for an action that started in the past and is still continuing.",
  },
  {
    id: "q-eng-03",
    subjectId: "bahasa-inggris",
    topic: "Vocabulary",
    difficulty: "mudah",
    type: single,
    prompt:
      "The word 'significant' in the sentence 'There was a significant improvement in his score' is closest in meaning to ...",
    options: options("small", "important", "sudden", "unclear"),
    correctOptionIds: ["b"],
    explanation:
      "'Significant' means notable or important. In this context, it describes an important improvement in the score.",
  },
  {
    id: "q-eng-04",
    subjectId: "bahasa-inggris",
    topic: "Conditional",
    difficulty: "sedang",
    type: single,
    prompt: "If I ___ more time, I would learn another language.",
    options: options("have", "had", "will have", "am having"),
    correctOptionIds: ["b"],
    explanation:
      "This is a second conditional sentence (unreal present). The pattern is 'If + past simple, would + base verb', so the answer is 'had'.",
  },
  {
    id: "q-eng-05",
    subjectId: "bahasa-inggris",
    topic: "Passive Voice",
    difficulty: "sedang",
    type: single,
    prompt: "The report ___ by the committee yesterday.",
    options: options("writes", "wrote", "was written", "is writing"),
    correctOptionIds: ["c"],
    explanation:
      "The report receives the action, so the passive voice is needed. 'Yesterday' indicates past tense: 'was written'.",
  },
  {
    id: "q-eng-06",
    subjectId: "bahasa-inggris",
    topic: "Tenses",
    difficulty: "sulit",
    type: "pilihan-ganda-kompleks",
    prompt:
      "Which sentences use the present perfect tense? (Choose more than one)",
    options: options(
      "I have finished my homework.",
      "She has visited Bali twice.",
      "They went to school yesterday.",
      "He is reading a book.",
    ),
    correctOptionIds: ["a", "b"],
    explanation:
      "The present perfect tense is formed with 'have/has + past participle'. Sentences A and B follow this pattern, while C is simple past and D is present continuous.",
  },
]

export const QUESTION_MAP = Object.fromEntries(
  QUESTION_BANK.map((question) => [question.id, question]),
) as Record<string, Question>

export const DIFFICULTY_LABEL = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
} as const

export const QUESTION_TYPE_LABEL = {
  "pilihan-ganda": "Pilihan ganda",
  "pilihan-ganda-kompleks": "PG kompleks",
  "benar-salah": "Benar / salah",
} as const
