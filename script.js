// =======================
// CHECK EXAM TIMINGS
// =======================

let questions = [];
let current = 0;
let answers = [];
let writtenAnswers = [];

let studentName = "";
let examSettings = {};

const API_URL = "https://script.google.com/macros/s/AKfycbwYxb_76YCNwI--aE1FD5mxrJbNoObZSSVt6UdkX9ZXKWw6hdN4WUpElhQ5vi_HmJD6/exec";


// =======================
// IMAGE SUPPORT
// =======================

// Styles for question images (injected here so style.css needs no change)
(function injectImageStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
        .q-images { margin: 12px 0; }
        .q-image {
            max-width: 100%;
            max-height: 350px;
            display: block;
            margin: 8px 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: #fff;
            cursor: zoom-in;
        }
        #options img, .report-options img {
            max-width: 220px;
            max-height: 160px;
            vertical-align: middle;
            margin: 4px 0;
            cursor: zoom-in;
        }
        #imageZoom {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.85);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 100000;
            cursor: zoom-out;
        }
        #imageZoom img {
            max-width: 95%;
            max-height: 95%;
            background: #fff;
        }
    `;
    document.head.appendChild(style);
})();

// Converts Google Drive share links into direct-view links.
// Any other URL is returned unchanged.
function fixImageUrl(url) {

    url = String(url || "").trim();

    if (!url) return "";

    let m = url.match(/drive\.google\.com\/file\/d\/([^\/?#]+)/);
    if (m) return "https://drive.google.com/uc?export=view&id=" + m[1];

    m = url.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([^&#]+)/);
    if (m) return "https://drive.google.com/uc?export=view&id=" + m[1];

    return url;
}

// Builds <img> tags from q.image. Several images can be separated by "|".
function questionImagesHTML(q) {

    if (!q.image) return "";

    let urls = String(q.image)
        .split("|")
        .map(fixImageUrl)
        .filter(u => u !== "");

    if (urls.length === 0) return "";

    return `<div class="q-images">` +
        urls.map(u =>
            `<img class="q-image" src="${u}" alt="Question image"
                  onerror="this.style.display='none'">`
        ).join("") +
        `</div>`;
}

// Click any question/option image to zoom
document.addEventListener("click", function (e) {

    const img = e.target;

    if (img.tagName === "IMG" &&
        (img.classList.contains("q-image") || img.closest("#options") || img.closest(".report-options"))) {

        let box = document.getElementById("imageZoom");

        if (!box) {
            box = document.createElement("div");
            box.id = "imageZoom";
            box.onclick = () => box.style.display = "none";
            document.body.appendChild(box);
        }

        box.innerHTML = `<img src="${img.src}">`;
        box.style.display = "flex";
    }
});


fetch(API_URL + "?action=settings")
.then(response => response.json())
.then(data => {

    examSettings = data;

    document.getElementById("testName").innerText =
        examSettings.testName;

    document.getElementById("subjectName").innerText =
        examSettings.subject;

    if (String(examSettings.calculator).toUpperCase() === "NO") {

        document.getElementById("calculatorBtn").style.display = "none";

    }

    let now = new Date();
    let start = new Date(data.start.replace(" ", "T"));
    let end = new Date(data.end.replace(" ", "T"));

    if (now < start) {

        document.body.innerHTML = `
        <div style="text-align:center;padding:100px;">
            <h1>Pariksha Online Test System</h1>
            <h2>⏳ Test has not started yet.</h2>
            <h3>Exam Starts: ${data.start}</h3>
        </div>`;

        return;
    }

    if (now > end) {

        document.body.innerHTML = `
        <div style="text-align:center;padding:100px;">
            <h1>Pariksha Online Test System</h1>
            <h2>❌ The test has ended.</h2>
        </div>`;

        return;
    }

    // exam starts after clicking Begin Exam button

});


// =======================
// LOAD QUESTIONS
// =======================

function loadQuestions() {

    fetch(API_URL + "?action=questions")
    .then(response => response.json())
    .then(data => {

        questions = data;

        // Shuffle only if enabled in Settings
        if (String(examSettings.questionShuffle).toUpperCase() === "YES") {

            questions.sort(() => Math.random() - 0.5);

        }

        questions.forEach(q => {

            if(q.answer === "A") q.answer = 0;
            else if(q.answer === "B") q.answer = 1;
            else if(q.answer === "C") q.answer = 2;
            else if(q.answer === "D") q.answer = 3;

        });

        answers = new Array(questions.length).fill(null);
        writtenAnswers = new Array(questions.length).fill("");

        palette();
        loadQ();

    })
    .catch(error => {

        alert("Failed to load questions");

        console.error(error);

    });

}


// =======================
// DISPLAY QUESTION
// =======================

function loadQ(){

    document.getElementById("studentWatermark").innerHTML = studentName;

    document.getElementById('qno').innerHTML =
        'Question ' + (current + 1);

    // Question text + image(s)
    document.getElementById('question').innerHTML =
        questions[current].question + questionImagesHTML(questions[current]);

    let h = '';

    questions[current].options.forEach((o,i)=>{

        h += `
        <div>
            <input type='radio'
                   name='o'
                   ${answers[current] == i ? 'checked' : ''}
                   onclick='answers[current]=${i}; palette();'>

            ${o}
        </div>`;

    });

    document.getElementById('options').innerHTML = h;

    document.getElementById("answerWorkspace").value =
        writtenAnswers[current];
}


// =======================
// QUESTION PALETTE
// =======================

function palette(){

    let p='';

    for(let i=0;i<questions.length;i++){

        let color = "#cccccc";

        if(answers[i] !== null){
            color = "#28a745";
        }

        p += `
        <button
            class='palette-btn'
            style='background:${color};
                   color:white;
                   font-weight:bold;'
            onclick='gotoQ(${i})'>

            ${i+1}

        </button>`;
    }

    document.getElementById('palette').innerHTML = p;
}


// =======================
// NAVIGATION
// =======================

function gotoQ(i){

    writtenAnswers[current] =
        document.getElementById("answerWorkspace").value;

    current = i;
    loadQ();

}

function nextQ(){

    writtenAnswers[current] =
        document.getElementById("answerWorkspace").value;

    if(current < questions.length - 1){

        current++;
        loadQ();

    }
}

function prevQ(){

    writtenAnswers[current] =
        document.getElementById("answerWorkspace").value;

    if(current > 0){

        current--;
        loadQ();

    }
}

function clearResponse(){

    answers[current] = null;
    writtenAnswers[current] = "";

    loadQ();
    palette();

}


// =======================
// RESULT REPORT CARD
// =======================

function buildReportCard(i, status){

    const q = questions[i];

    const bg = status === "correct" ? "#f4fff4" : "#fff8f8";

    let yourAnswer;

    if(status === "unattempted"){

        yourAnswer = `
        <p style="color:orange;">⚪ Your Answer: Not Attempted</p>`;

    } else {

        const icon  = status === "correct" ? "✅" : "❌";
        const color = status === "correct" ? "green" : "red";

        yourAnswer = `
        <p style="color:${color};">
        ${icon} Your Answer:
        ${String.fromCharCode(65 + answers[i])}. ${q.options[answers[i]]}
        </p>`;
    }

    return `
    <div style="border:1px solid #ddd;
                padding:15px;
                margin:10px 0;
                border-radius:8px;
                background:${bg};">

        <h3>Question ${i+1}</h3>

        <p><b>${q.question}</b></p>

        ${questionImagesHTML(q)}

        <div class="report-options">
            <p>A. ${q.options[0]}</p>
            <p>B. ${q.options[1]}</p>
            <p>C. ${q.options[2]}</p>
            <p>D. ${q.options[3]}</p>
        </div>

        <hr>

        ${yourAnswer}

        <p style="color:green;">
        ✅ Correct Answer:
        ${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}
        </p>

        <hr>

        <p><b>Answer Workspace</b></p>

        <div style="
        border:1px solid #ccc;
        padding:10px;
        min-height:70px;
        background:#fafafa;
        white-space:pre-wrap;
        ">
        ${writtenAnswers[i] ? writtenAnswers[i] : "Not Written"}
        </div>

    </div>`;
}


// =======================
// SUBMIT TEST
// =======================

function submitTest(){

    // Save whatever is currently in the workspace box
    const ws = document.getElementById("answerWorkspace");
    if (ws && questions.length) writtenAnswers[current] = ws.value;

    let score = 0;
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    let report = "";

    for(let i=0;i<questions.length;i++){

        if(answers[i] === null){

            unattempted++;
            report += buildReportCard(i, "unattempted");

        }

        else if(answers[i] === questions[i].answer){

            correct++;
            score += Number(examSettings.positiveMarks);
            report += buildReportCard(i, "correct");

        }

        else{

            wrong++;
            score -= Number(examSettings.negativeMarks);
            report += buildReportCard(i, "wrong");

        }
    }

    let accuracy = 0;

    if((correct + wrong) > 0){

        accuracy =
            ((correct/(correct+wrong))*100).toFixed(2);

    }

    let name = studentName;

    let testID = examSettings.testID;
    let testName = examSettings.testName;
    let subject = examSettings.subject;


    // SAVE RESULT

    fetch(API_URL,{

        method:"POST",
        mode:"no-cors",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            testID:testID,
            testName:testName,
            subject:subject,

            name:name,

            score:score,
            correct:correct,
            wrong:wrong,
            unattempted:unattempted

        })

    });


    // SHOW RESULT

    document.body.innerHTML = `

    <div style="font-family:Arial;
                padding:30px;
                max-width:900px;
                margin:auto;">

       <h1>${examSettings.testName}</h1>

       <h2>Test Result</h2>

        <hr>

        <h2>Student Information</h2>

        <p><b>Name:</b> ${name}</p>

        <p><b>Subject:</b> ${examSettings.subject}</p>

        <p><b>Test ID:</b> ${examSettings.testID}</p>

        <hr>

        <h2>Summary</h2>

        <p><b>Total Questions:</b> ${questions.length}</p>
        <p><b>Correct Answers:</b> ${correct}</p>
        <p><b>Wrong Answers:</b> ${wrong}</p>
        <p><b>Unattempted:</b> ${unattempted}</p>
        <p><b>Accuracy:</b> ${accuracy}%</p>
        <p><b>Positive Marks:</b> +${examSettings.positiveMarks}</p>

        <p><b>Negative Marks:</b> -${examSettings.negativeMarks}</p>

        <hr>

        <h2>Final Score</h2>

        <h1>${score} Marks</h1>

        <h2>Result</h2>

        <p><b>Passing Marks :</b> ${examSettings.passingMarks}</p>

        <h2 style="color:${score >= Number(examSettings.passingMarks) ? "green" : "red"};">
        ${score >= Number(examSettings.passingMarks) ? "✅ PASS" : "❌ FAIL"}
        </h2>

        <button onclick="window.print()">
        📄 Download / Print PDF
        </button>

        <hr>

        <h2>Question Review</h2>

        ${report}

    </div>`;
}


// =======================
// TIMER
// =======================

let t = 0;
let timerInterval = null;

function startTimer() {

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        let m = Math.floor(t / 60);
        let s = t % 60;

        let el = document.getElementById("timer");

        if (el) {
            el.innerHTML =
                String(m).padStart(2, "0") +
                ":" +
                String(s).padStart(2, "0");
        }

        if (t <= 0) {

            clearInterval(timerInterval);

            submitTest();

            return;
        }

        t--;

    }, 1000);

}


// ===== ANTI-CHEATING =====

let violationCount = 0;

document.addEventListener("visibilitychange", function () {

    if (document.hidden) {

        violationCount++;

        alert(
            "⚠ Warning!\n\n" +
            "You have left the exam window.\n\n" +
            "Violation Count: " + violationCount
        );

        // Auto submit after 5 violations

        if (violationCount >= 5) {

            alert(
                "You have exceeded the allowed violations.\n\n" +
                "Your test will now be submitted automatically."
            );

            submitTest();
        }
    }
});



function enterFullScreen() {

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }

}


document.addEventListener("fullscreenchange", function () {

    // If student exits fullscreen
    if (!document.fullscreenElement) {

        violationCount++;

        alert(
            "⚠ Warning!\n\n" +
            "You exited Full Screen Mode.\n\n" +
            "Violation Count: " + violationCount + "/3"
        );

        // Auto submit after 3 violations
        if (violationCount >= 3) {

            alert(
                "Maximum violations reached.\n\n" +
                "Your test will now be submitted."
            );

            submitTest();
        }

        // Re-enter fullscreen after 1 second
        setTimeout(() => {

            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }

        }, 1000);
    }
});


// Disable Right Click
document.addEventListener("contextmenu", function(e){
    e.preventDefault();
});

// Disable Copy, Paste and Cut
document.addEventListener("copy", function(e){
    e.preventDefault();
});

document.addEventListener("paste", function(e){
    e.preventDefault();
});

document.addEventListener("cut", function(e){
    e.preventDefault();
});

// Disable Keyboard Shortcuts

document.addEventListener("keydown", function(e){

    // F12
    if(e.key === "F12"){
        e.preventDefault();
    }

    // Ctrl+U
    if(e.ctrlKey && e.key.toLowerCase() === "u"){
        e.preventDefault();
    }

    // Ctrl+S
    if(e.ctrlKey && e.key.toLowerCase() === "s"){
        e.preventDefault();
    }

    // Ctrl+P
    if(e.ctrlKey && e.key.toLowerCase() === "p"){
        e.preventDefault();
    }

    // Ctrl+Shift+I/J/C
    if(e.ctrlKey && e.shiftKey &&
       ["I","J","C"].includes(e.key.toUpperCase())){
        e.preventDefault();
    }

});


document.getElementById("examDate").innerHTML =
    new Date().toLocaleDateString();

// calculator part start
// Open Calculator
document.getElementById("calculatorBtn").onclick=function(){

    document.getElementById("calculatorWindow").style.display="block";

}

// Close Calculator
document.getElementById("closeCalculator").onclick=function(){

    document.getElementById("calculatorWindow").style.display="none";

}
//calculator part ends


/* ===========================
   DRAGGABLE CALCULATOR
=========================== */

dragElement(document.getElementById("calculatorWindow"));

function dragElement(elmnt) {

    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

    document.getElementById("calculatorHeader").onmousedown = dragMouseDown;

    function dragMouseDown(e) {

        e = e || window.event;

        e.preventDefault();

        pos3 = e.clientX;

        pos4 = e.clientY;

        document.onmouseup = closeDragElement;

        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {

        e = e || window.event;

        e.preventDefault();

        pos1 = pos3 - e.clientX;

        pos2 = pos4 - e.clientY;

        pos3 = e.clientX;

        pos4 = e.clientY;

        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";

        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

        elmnt.style.right = "auto";

        elmnt.style.bottom = "auto";
    }

    function closeDragElement() {

        document.onmouseup = null;

        document.onmousemove = null;
    }
}


// ==============================
// WELCOME PAGE
// ==============================

function showInstructions() {

    let name = document.getElementById("loginName").value.trim();
    let enteredTestID = document.getElementById("loginTestID").value.trim();

    if(name==""){

        alert("Please enter your name.");

        return;

    }

    if(enteredTestID==""){

        alert("Please enter Test ID.");

        return;

    }

    if(enteredTestID !== examSettings.testID){

        alert("Invalid Test ID.");

        return;

    }

    // Store student name
    studentName = name;

    document.getElementById("studentDisplay").innerText = studentName;

    // Fill instruction page

    document.getElementById("instructionTestName").innerText = examSettings.testName;

    document.getElementById("instructionDuration").innerText = examSettings.duration;

    document.getElementById("instructionSubject").innerText = examSettings.subject;

    document.getElementById("instructionCalculator").innerText = examSettings.calculator;

    // Hide welcome

    document.getElementById("welcomePage").style.display="none";

    // Show instructions

    document.getElementById("instructionPage").style.display="flex";

}


// ==============================
// BEGIN EXAM
// ==============================

function startExam(){

    document.getElementById("instructionPage").style.display="none";

    document.getElementById("examPage").style.display="block";

    t = Number(examSettings.duration) * 60;

    loadQuestions();
    startTimer();

}
