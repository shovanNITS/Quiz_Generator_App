import { fetchQuizFromAPI, decodeHtml } from "./quesFetch.js";
import { initAuth } from "./userAuth.js";

class QuizApp {
  constructor() {
    this.currentScreen = "config";
    this.quiz = null;
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.startTime = null;
    this.endTime = null;
    this.timer = null;
    this.elapsedTime = 0;
    this.config = null; // store quiz config

    this.init();
  }

  init() {
    this.bindEvents();
    this.showScreen("config");
  }

  bindEvents() {
    document.getElementById("quiz-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.generateQuiz();
    });

    document.getElementById("next-btn").addEventListener("click", () => {
      this.nextQuestion();
    });

    document.getElementById("quit-quiz").addEventListener("click", () => {
      this.quitQuiz();
    });

    document.getElementById("retake-btn").addEventListener("click", () => {
      this.retakeQuiz();
    });

    document.getElementById("new-quiz-btn").addEventListener("click", () => {
      this.newQuiz();
    });
  }

  showScreen(screenName) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });
    document.getElementById(`${screenName}-screen`).classList.add("active");
    this.currentScreen = screenName;
  }

  async generateQuiz() {
    const config = {
      topic: document.getElementById("topic").value.trim(),
      difficulty: document.getElementById("difficulty").value,
      numberOfQuestions: parseInt(
        document.getElementById("questionCount").value
      ),
      questionType: document.getElementById("questionType").value,
    };

    this.config = config; // ✅ save config for later use (header, results)

    const generateBtn = document.getElementById("generate-btn");
    generateBtn.classList.add("loading");
    generateBtn.disabled = true;

    try {
      const apiQuestions = await fetchQuizFromAPI(config);

      this.quiz = apiQuestions.map((q, index) => {
        let options =
          q.type === "multiple"
            ? [...q.incorrect_answers, q.correct_answer]
            : ["True", "False"];
        options = this.shuffleArray(options);

        return {
          id: index + 1,
          type: q.type === "multiple" ? "mcq" : "truefalse",
          question: decodeHtml(q.question),
          options: options.map((opt) => decodeHtml(opt)),
          correctAnswer: decodeHtml(q.correct_answer),
          explanation: null,
        };
      });

      this.currentQuestionIndex = 0;
      this.answers = [];
      this.startTime = Date.now();
      this.elapsedTime = 0;

      this.startQuiz();
    } catch (err) {
      console.error("Error fetching quiz from API:", err);
      alert("Could not load quiz. Try again later.");
    } finally {
      generateBtn.classList.remove("loading");
      generateBtn.disabled = false;
    }
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  startQuiz() {
    this.showScreen("quiz");
    this.updateQuizHeader();
    this.displayQuestion();
    this.startTimer();
  }

  updateQuizHeader() {
    document.getElementById(
      "quiz-topic-title"
    ).textContent = `${this.config.topic} Quiz`;
    document.getElementById("current-question").textContent =
      this.currentQuestionIndex + 1;
    document.getElementById("total-questions").textContent = this.quiz.length;
    this.updateProgress();
  }

  updateProgress() {
    const progress =
      (this.currentQuestionIndex / this.quiz.length) * 100;
    document.getElementById("progress-fill").style.width = `${progress}%`;
  }

  displayQuestion() {
    const question = this.quiz[this.currentQuestionIndex];
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("question-options");
    const nextBtn = document.getElementById("next-btn");

    questionText.textContent = question.question;
    nextBtn.disabled = true;

    optionsContainer.innerHTML = "";
    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "option-btn";
      button.textContent = option;
      button.addEventListener("click", () =>
        this.selectOption(button, option)
      );
      optionsContainer.appendChild(button);
    });

    optionsContainer.classList.add("fade-in");
  }

  selectOption(button, selectedOption) {
    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });
    button.classList.add("selected");

    const question = this.quiz[this.currentQuestionIndex];
    const isCorrect = selectedOption === question.correctAnswer;

    this.answers[this.currentQuestionIndex] = {
      questionId: question.id,
      answer: selectedOption,
      isCorrect: isCorrect,
    };

    document.getElementById("next-btn").disabled = false;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.quiz.length - 1) {
      this.currentQuestionIndex++;
      this.updateQuizHeader();
      this.displayQuestion();
    } else {
      this.finishQuiz();
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.updateTimerDisplay();
    }, 1000);
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;
    document.getElementById("timer").textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  finishQuiz() {
    this.endTime = Date.now();
    if (this.timer) clearInterval(this.timer);
    this.showResults();
  }

  quitQuiz() {
    if (confirm("Are you sure you want to quit the quiz?")) {
      if (this.timer) clearInterval(this.timer);
      this.showScreen("config");
    }
  }

  showResults() {
    this.showScreen("results");

    const correctAnswers = this.answers.filter((ans) => ans.isCorrect).length;
    const totalQuestions = this.quiz.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;

    const scorePercentage = document.getElementById("score-percentage");
    scorePercentage.textContent = `${percentage}%`;
    scorePercentage.className = "score-percentage";
    if (percentage >= 80) scorePercentage.classList.add("excellent");
    else if (percentage >= 60) scorePercentage.classList.add("good");
    else scorePercentage.classList.add("poor");

    document.getElementById(
      "score-text"
    ).textContent = `${correctAnswers} out of ${totalQuestions} correct`;
    document.getElementById("score-message").textContent =
      this.getScoreMessage(percentage);
    document.getElementById(
      "score-progress-fill"
    ).style.width = `${percentage}%`;
    document.getElementById(
      "accuracy-stat"
    ).textContent = `${percentage}%`;
    document.getElementById(
      "time-stat"
    ).textContent = `${minutes}m ${seconds}s`;
    document.getElementById("difficulty-stat").textContent =
      this.config.difficulty.charAt(0).toUpperCase() +
      this.config.difficulty.slice(1);

    this.generateQuestionReview();
  }

  getScoreMessage(percentage) {
    if (percentage >= 90) return "Outstanding! 🌟";
    if (percentage >= 80) return "Excellent work! 👏";
    if (percentage >= 70) return "Good job! 👍";
    if (percentage >= 60) return "Not bad! 🙂";
    return "Keep practicing! 💪";
  }

  generateQuestionReview() {
    const reviewContainer = document.getElementById("question-review");
    reviewContainer.innerHTML = "";

    this.quiz.forEach((question, index) => {
      const userAnswer = this.answers[index];
      const isCorrect = userAnswer?.isCorrect || false;

      const reviewItem = document.createElement("div");
      reviewItem.className = "review-item";

      reviewItem.innerHTML = `
        <div class="review-header">
            <i class="fas ${
              isCorrect ? "fa-check-circle" : "fa-times-circle"
            } review-icon ${isCorrect ? "correct" : "incorrect"}"></i>
            <div class="review-content">
                <div class="review-question">
                    ${index + 1}. ${question.question}
                </div>
                <div class="review-details">
                    <p><span class="detail-label">Your Answer:</span> ${
                      userAnswer?.answer || "No answer"
                    }</p>
                    <p><span class="detail-label">Correct Answer:</span> ${
                      question.correctAnswer
                    }</p>
                </div>
            </div>
        </div>
      `;

      reviewContainer.appendChild(reviewItem);
    });
  }

  retakeQuiz() {
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.startQuiz();
  }

  newQuiz() {
    this.quiz = null;
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.startTime = null;
    this.endTime = null;
    this.elapsedTime = 0;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.showScreen("config");
    document.getElementById("quiz-form").reset();
    document.getElementById("difficulty").value = "medium";
    document.getElementById("questionCount").value = "5";
    document.getElementById("questionType").value = "mcq";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAuth();        // 🔑 start auth flow
  new QuizApp();     // quiz only runs after auth
});
