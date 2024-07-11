const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const bonusTimerDisplay = document.getElementById("bonusTimer");
const topScoresList = document.getElementById("topScores");

const box = 20;
const canvasSize = canvas.width;
const initialSnakeLength = 3;

let snake;
let direction;
let food;
let bonusFood;
let bonusFoodTimer;
let score;
let speed;
let game;
let normalFoodCount;
let isGameOver = false;
let isGameStarted = false;

function initializeGame() {
    snake = [];
    for (let i = initialSnakeLength - 1; i >= 0; i--) {
        snake.push({ x: i * box, y: 0 });
    }
    direction = "RIGHT";
    score = 0;
    normalFoodCount = 0;
    scoreDisplay.textContent = "Score: " + score;
    food = generateFood();
    bonusFood = null;
    bonusFoodTimer = 0;

    startButton.style.display = "block";
    speedRange.style.display = "none";
    speedValue.style.display = "none";
    bonusTimerDisplay.style.display = "none";
    restartButton.style.display = "none";
    canvas.style.display = "block";
    isGameOver = false;
    isGameStarted = false;
    document.removeEventListener("keydown", changeDirection);
}

function changeDirection(event) {
    if (isGameOver) return;

    if (event.keyCode === 37 && direction !== "RIGHT") {
        direction = "LEFT";
    } else if (event.keyCode === 38 && direction !== "DOWN") {
        direction = "UP";
    } else if (event.keyCode === 39 && direction !== "LEFT") {
        direction = "RIGHT";
    } else if (event.keyCode === 40 && direction !== "UP") {
        direction = "DOWN";
    }
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvasSize / box)) * box,
            y: Math.floor(Math.random() * (canvasSize / box)) * box
        };
    } while (isPositionOccupied(newFood));
    return newFood;
}

function isPositionOccupied(position) {
    for (let segment of snake) {
        if (position.x === segment.x && position.y === segment.y) {
            return true;
        }
    }
    return false;
}

function draw() {
    if (isGameOver) return;

    ctx.fillStyle = "#228B22";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            drawSnakeHead(snake[i].x, snake[i].y);
        } else {
            drawSnakeBody(snake[i].x, snake[i].y);
        }
    }

    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();

    if (bonusFood) {
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(bonusFood.x + box * 2, bonusFood.y + box * 2, box * 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.fillRect(bonusFood.x + box * 2 - 5, bonusFood.y + box * 2 + box * 2 + 5, box * 4, 10);
        ctx.fillStyle = "black";
        ctx.fillRect(bonusFood.x + box * 2 - 5, bonusFood.y + box * 2 + box * 2 + 5, (box * 4) * (bonusFoodTimer / 6000), 10);
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        food = generateFood();
        normalFoodCount++;
        if (normalFoodCount % 5 === 0) {
            bonusFood = generateFood();
            bonusFoodTimer = 6000;
            bonusTimerDisplay.style.display = "none";
        } else {
            score += parseInt(speedRange.value);
        }
        scoreDisplay.textContent = "Score: " + score;
    } else if (bonusFood && snakeX >= bonusFood.x - box * 2 && snakeX <= bonusFood.x + box * 2 && snakeY >= bonusFood.y - box * 2 && snakeY <= bonusFood.y + box * 2) {
        bonusFood = null;
        score += parseInt(speedRange.value) * 4;
        scoreDisplay.textContent = "Score: " + score;
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvasSize || snakeY >= canvasSize || collision(newHead, snake)) {
        clearInterval(game);
        isGameOver = true;
        restartButton.style.display = "block";
        startButton.style.display = "none";
        speedRange.style.display = "none";
        speedValue.style.display = "none";
        canvas.style.display = "block";
        bonusTimerDisplay.style.display = "none";
        document.removeEventListener("keydown", changeDirection);
        saveScore(score); // Lưu điểm khi trò chơi kết thúc
        updateLeaderboard(); // Cập nhật bảng kỷ lục
    } else {
        snake.unshift(newHead);
    }

    if (bonusFood) {
        bonusFoodTimer -= 100;
        bonusTimerDisplay.textContent = "Bonus Time: " + Math.ceil(bonusFoodTimer / 1000) + "s";
        if (bonusFoodTimer <= 0) {
            bonusFood = null;
            bonusTimerDisplay.style.display = "none";
        }
    }
}

function drawSnakeHead(x, y) {
    ctx.fillStyle = "#006400";
    ctx.beginPath();
    ctx.arc(x + box / 2, y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x + box / 2 - 5, y + box / 2 - 5, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + box / 2 + 5, y + box / 2 - 5, 3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(x + box / 2, y + box / 2 + 5, 10, 0, Math.PI);
    ctx.stroke();
}

function drawSnakeBody(x, y) {
    ctx.fillStyle = "#00FF00";
    ctx.beginPath();
    ctx.arc(x + box / 2, y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();
}

function collision(head, array) {
    for (let i = 1; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function startGame() {
    initializeGame();
    canvas.style.display = "block"; // Hiển thị canvas khi bắt đầu trò chơi
    speedRange.style.display = "none";
        speedValue.style.display = "none";
    document.addEventListener("keydown", changeDirection); // Thêm sự kiện bàn phím
    speed = 200 - (speedRange.value - 1) * 20;
    game = setInterval(draw, speed);
}

startButton.addEventListener('click', function() {
    if (!isGameStarted) {
        startButton.style.display = "none";
        speedRange.style.display = "none";
        speedValue.style.display = "none";
        canvas.style.display = "block"; // Hiển thị canvas khi bắt đầu trò chơi
        startGame();
        isGameStarted = true; // Đánh dấu trò chơi đã bắt đầu
    }
});

restartButton.addEventListener('click', function() {
    clearInterval(game);
    canvas.style.display = "block"; // Hiển thị canvas khi restart
    initializeGame();
    startButton.style.display = "block";
    speedRange.style.display = "inline";
    speedValue.style.display = "inline";
    bonusTimerDisplay.style.display = "none";
    restartButton.style.display = "none";
    document.removeEventListener("keydown", changeDirection); // Ngừng nhận sự kiện bàn phím
    isGameStarted = false; // Đánh dấu trò chơi chưa bắt đầu
});

speedRange.addEventListener('input', function() {
    speedValue.textContent = "Speed: " + speedRange.value;
    speed = 200 - (speedRange.value - 1) * 20;
    if (isGameStarted) {
        clearInterval(game);
        game = setInterval(draw, speed);
    }
});

// Lưu điểm của người chơi vào localStorage
function saveScore(score) {
    let topScores = JSON.parse(localStorage.getItem("topScores")) || [];
    topScores.push(score);
    topScores.sort((a, b) => b - a);
    if (topScores.length > 10) {
        topScores = topScores.slice(0, 10);
    }
    localStorage.setItem("topScores", JSON.stringify(topScores));
}

// Cập nhật bảng kỷ lục từ localStorage
function updateLeaderboard() {
    const topScores = JSON.parse(localStorage.getItem("topScores")) || [];
    topScoresList.innerHTML = "";
    topScores.forEach((score, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${score}`;
        topScoresList.appendChild(listItem);
    });
}

// Cập nhật bảng kỷ lục khi trang được tải
window.onload = updateLeaderboard;

