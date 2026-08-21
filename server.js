const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 3000;

const db = new Database("quiz.db");

db.exec(`
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    option1 TEXT NOT NULL,
    option2 TEXT NOT NULL,
    option3 TEXT NOT NULL,
    option4 TEXT NOT NULL,
    correct INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    time_seconds INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


/* =========================
   جلب الأسئلة
========================= */

app.get("/api/questions", (req, res) => {

    const questions = db.prepare(`
        SELECT id, question, option1, option2, option3, option4
        FROM questions
        ORDER BY id
    `).all();

    res.json(questions);
});


/* =========================
   إضافة سؤال
========================= */

app.post("/api/questions", (req, res) => {

    const {
        question,
        option1,
        option2,
        option3,
        option4,
        correct
    } = req.body;

    if (
        !question ||
        !option1 ||
        !option2 ||
        !option3 ||
        !option4
    ) {

        return res.status(400).json({
            error: "كل البيانات مطلوبة"
        });
    }

    db.prepare(`
        INSERT INTO questions
        (question, option1, option2, option3, option4, correct)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        question,
        option1,
        option2,
        option3,
        option4,
        Number(correct)
    );

    res.json({
        message: "تم إضافة السؤال"
    });
});


/* =========================
   حذف سؤال
========================= */

app.delete("/api/questions/:id", (req, res) => {

    db.prepare(`
        DELETE FROM questions
        WHERE id = ?
    `).run(req.params.id);

    res.json({
        message: "تم حذف السؤال"
    });
});


/* =========================
   إرسال نتيجة الطالب
========================= */

app.post("/api/results", (req, res) => {

    const {
        student_name,
        answers,
        time_seconds
    } = req.body;


    // تنظيف الاسم
    const cleanName = String(student_name || "")
        .trim()
        .replace(/\s+/g, " ");


    // التأكد من وجود اسم
    if (!cleanName) {

        return res.status(400).json({
            error: "اكتب اسمك أولًا"
        });
    }


    // منع تكرار الاسم
    const existingStudent = db.prepare(`
        SELECT id
        FROM results
        WHERE LOWER(student_name) = LOWER(?)
        LIMIT 1
    `).get(cleanName);


    if (existingStudent) {

        return res.status(409).json({
            error: "الاسم مستخدم بالفعل، اكتب اسمك كاملًا مثل: عبدالرحمن خالد"
        });
    }


    // جلب الأسئلة والإجابات الصحيحة
    const questions = db.prepare(`
        SELECT id, correct
        FROM questions
        ORDER BY id
    `).all();


    let score = 0;


    questions.forEach((q, index) => {

        if (Number(answers[index]) === q.correct) {
            score++;
        }

    });


    // حفظ النتيجة
    db.prepare(`
        INSERT INTO results
        (student_name, score, total, time_seconds)
        VALUES (?, ?, ?, ?)
    `).run(
        cleanName,
        score,
        questions.length,
        Number(time_seconds) || 0
    );


    res.json({
        score,
        total: questions.length,
        time: Number(time_seconds) || 0
    });

});


/* =========================
   ترتيب الطلاب
========================= */

app.get("/api/results", (req, res) => {

    const results = db.prepare(`
        SELECT *
        FROM results
        ORDER BY score DESC, time_seconds ASC
    `).all();

    res.json(results);
});


/* =========================
   تشغيل السيرفر
========================= */

app.listen(PORT, "0.0.0.0", () => {

    console.log("");
    console.log("=================================");
    console.log("   Student Quiz Started");
    console.log("=================================");
    console.log(`http://localhost:${PORT}`);
    console.log("");

});