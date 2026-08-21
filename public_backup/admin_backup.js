async function addQuestion() {

    const question =
        document.getElementById("question").value.trim();

    const option1 =
        document.getElementById("option1").value.trim();

    const option2 =
        document.getElementById("option2").value.trim();

    const option3 =
        document.getElementById("option3").value.trim();

    const option4 =
        document.getElementById("option4").value.trim();

    const correct =
        document.getElementById("correct").value;


    if (
        !question ||
        !option1 ||
        !option2 ||
        !option3 ||
        !option4
    ) {

        alert("اكتب السؤال والاختيارات كلها");

        return;
    }


    await fetch("/api/questions", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            question,
            option1,
            option2,
            option3,
            option4,
            correct

        })
    });


    alert("✅ تم إضافة السؤال");

    document.getElementById("question").value = "";
    document.getElementById("option1").value = "";
    document.getElementById("option2").value = "";
    document.getElementById("option3").value = "";
    document.getElementById("option4").value = "";

    loadQuestions();
}


async function loadQuestions() {

    const response =
        await fetch("/api/questions");

    const questions =
        await response.json();

    const container =
        document.getElementById("questions");

    container.innerHTML = "";


    questions.forEach((q, index) => {

        const div =
            document.createElement("div");

        div.className = "question-box";

        div.innerHTML = `
            <b>${index + 1}. ${q.question}</b>

            <br><br>

            1- ${q.option1}<br>
            2- ${q.option2}<br>
            3- ${q.option3}<br>
            4- ${q.option4}

            <button
                class="delete"
                onclick="deleteQuestion(${q.id})">
                🗑 حذف
            </button>
        `;

        container.appendChild(div);
    });
}


async function deleteQuestion(id) {

    if (!confirm("هل تريد حذف السؤال؟")) {
        return;
    }


    await fetch(`/api/questions/${id}`, {

        method: "DELETE"

    });


    loadQuestions();
}


async function loadResults() {

    const response =
        await fetch("/api/results");

    const results =
        await response.json();

    const table =
        document.getElementById("results");

    table.innerHTML = "";


    results.forEach((student, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.student_name}</td>
            <td>${student.score}/${student.total}</td>
            <td>${student.time_seconds} ثانية</td>
        `;

        table.appendChild(row);
    });
}


loadQuestions();
loadResults();

setInterval(loadResults, 3000);