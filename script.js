const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");

const bgMusic = document.getElementById("bgMusic");
const eatSound = document.getElementById("eatSound");
const overSound = document.getElementById("overSound");

const box = 20;
let snake = [];
let direction = "RIGHT";
let food = {};
let score = 0;

let aiDirection = "RIGHT";
let gameInterval = null;
let isPaused = false;
const speed = 120;

/* ---------------- BUTTON EVENTS ---------------- */

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);

/* ---------------- KEYBOARD ---------------- */

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

/* ---------------- GAME FUNCTIONS ---------------- */

function startGame() {
    clearInterval(gameInterval);

    snake = [{ x: 9 * box, y: 10 * box }];
    direction = "RIGHT";
    food = randomFood();
    score = 0;
    isPaused = false;

    bgMusic.currentTime = 0;
    bgMusic.volume = 0.4;
    bgMusic.play();

    gameInterval = setInterval(draw, speed);
}

function pauseGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
        bgMusic.pause();
        isPaused = true;
    }
}

function resumeGame() {
    if (!gameInterval && isPaused) {
        bgMusic.play();
        gameInterval = setInterval(draw, speed);
        isPaused = false;
    }
}

function randomFood() {
    return {
        x: Math.floor(Math.random() * 19) * box,
        y: Math.floor(Math.random() * 19) * box
    };
}

/* ---------------- AI LOGIC ---------------- */

function aiSuggestDirection() {
    const head = snake[0];
    const dirs = ["UP", "DOWN", "LEFT", "RIGHT"];

    function next(dir) {
        let x = head.x, y = head.y;
        if (dir === "UP") y -= box;
        if (dir === "DOWN") y += box;
        if (dir === "LEFT") x -= box;
        if (dir === "RIGHT") x += box;
        return { x, y };
    }

    function safe(pos) {
        if (pos.x < 0 || pos.y < 0 ||
            pos.x >= canvas.width || pos.y >= canvas.height)
            return false;
        return !snake.some(p => p.x === pos.x && p.y === pos.y);
    }

    let best = direction;
    let bestScore = -9999;

    for (let d of dirs) {
        let pos = next(d);
        if (!safe(pos)) continue;

        let dist = Math.abs(pos.x - food.x) + Math.abs(pos.y - food.y);
        let score = 400 - dist;

        if (score > bestScore) {
            bestScore = score;
            best = d;
        }
    }
    aiDirection = best;
}

/* ---------------- DRAW ---------------- */

function drawGrid() {
    ctx.strokeStyle = "#222";
    for (let i = 0; i <= canvas.width; i += box) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += box) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    aiSuggestDirection();

    snake.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? "#7CFC00" : "#00AA00";
        ctx.fillRect(part.x, part.y, box, box);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("Score: " + score, 10, 15);
    ctx.fillText("AI → " + aiDirection, 280, 15);

    let head = { ...snake[0] };
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    if (
        head.x < 0 || head.y < 0 ||
        head.x >= canvas.width || head.y >= canvas.height ||
        snake.some(p => p.x === head.x && p.y === head.y)
    ) {
        bgMusic.pause();
        overSound.play();
        clearInterval(gameInterval);
        gameInterval = null;
        alert("Game Over! Score: " + score);
        return;
    }

    if (head.x === food.x && head.y === food.y) {
        eatSound.play();
        score++;
        food = randomFood();
    } else {
        snake.pop();
    }

    snake.unshift(head);
}
