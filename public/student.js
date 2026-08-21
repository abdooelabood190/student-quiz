let questions = [];
let currentQuestion = 0;
let answers = [];
let studentName = "";
let startTime = 0;
let timerInterval;


async function startQuiz() {

    studentName =
        document.getElementById("name").value.trim();

    if (!studentName) {

        alert("اكتب اسمك الأول");

        return;
    }


    const response =
        await fetch("/api/questions");

    questions =
        await response.json();


    if (questions.length === 0) {

        alert("لسه مفيش أسئلة مضافة");

        return;
    }


    document.getElementById("login").style.display = "none";

    document.getElementById("quiz").style.display = "block";


    document.getElementById("student").innerText =
        "الطالب: " + studentName;


    startTime = Date.now();


    timerInterval = setInterval(() => {

        const seconds =
            Math.floor(
                (Date.now() - startTime) / 1000
            );

        document.getElementById("timer").innerText =
            seconds;

    }, 1000);


    showQuestion();
}



function showQuestion() {

    const q =
        questions[currentQuestion];


    document.getElementById("question").innerText =
        `${currentQuestion + 1}. ${q.question}`;


    const answersDiv =
        document.getElementById("answers");


    answersDiv.innerHTML = "";


    const options = [
        q.option1,
        q.option2,
        q.option3,
        q.option4
    ];


    options.forEach((option, index) => {

        const button =
            document.createElement("button");


        button.className =
            "answer";


        button.innerText =
            option;


        button.onclick = () => {

            answers[currentQuestion] =
                index;


            document
                .querySelectorAll(".answer")
                .forEach(b =>
                    b.classList.remove("selected")
                );


            button.classList.add("selected");

        };


        answersDiv.appendChild(button);

    });

}



async function nextQuestion() {

    if (answers[currentQuestion] === undefined) {

        alert("اختار إجابة الأول");

        return;
    }


    currentQuestion++;


    if (currentQuestion >= questions.length) {

        await finishQuiz();

        return;
    }


    showQuestion();

}



async function finishQuiz() {

    clearInterval(timerInterval);


    const totalTime =
        Math.floor(
            (Date.now() - startTime) / 1000
        );


    const response =
        await fetch("/api/results", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                student_name:
                    studentName,

                answers:
                    answers,

                time_seconds:
                    totalTime

            })

        });


    const result =
        await response.json();


    // لو الاسم مستخدم بالفعل
    if (!response.ok) {

        alert(
            result.error ||
            "حدث خطأ أثناء إرسال النتيجة"
        );

        return;
    }


    document.getElementById("quiz").style.display =
        "none";


    document.getElementById("result").style.display =
        "block";


    document.getElementById("resultText").innerText =
        `النتيجة: ${result.score} من ${result.total} — الوقت: ${result.time} ثانية`;

}