const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const playerScoreElem = document.getElementById('playerScore');
const aiScoreElem = document.getElementById('aiScore');
const soundBounce = document.getElementById('soundBounce');
const soundScore = document.getElementById('soundScore');



// Game constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 15;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 6;
const BALL_SPEED = 6;
const WIN_SCORE = 5;



// Game state
let playerY, aiY, ballX, ballY, ballVelX, ballVelY;
let playerScore = 0;
let aiScore = 0;
let isPlaying = false;
let animationId = null;



// Mouse control
canvas.addEventListener('mousemove', (e) => {
    if (!isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));
});



playBtn.addEventListener('click', startGame);



function startGame() {
    playerScore = 0;
    aiScore = 0;
    updateScore();
    resetPositions();
    isPlaying = true;
    playBtn.style.display = 'none';
    cancelAnimationFrame(animationId);
    gameLoop();
}



function resetPositions() {
    playerY = (canvas.height - PADDLE_HEIGHT) / 2;
    aiY = (canvas.height - PADDLE_HEIGHT) / 2;
    ballX = canvas.width / 2 - BALL_SIZE / 2;
    ballY = canvas.height / 2 - BALL_SIZE / 2;
    ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}



function gameLoop() {
    update();
    draw();
    if (isPlaying) animationId = requestAnimationFrame(gameLoop);
}



function update() {
    // Ball movement
    ballX += ballVelX;
    ballY += ballVelY;



    // Ball collision with top/bottom walls
    if (ballY <= 0) {
        ballY = 0;
        ballVelY *= -1;
        playBounce();
    }
    if (ballY + BALL_SIZE >= canvas.height) {
        ballY = canvas.height - BALL_SIZE;
        ballVelY *= -1;
        playBounce();
    }



    // Ball collision with paddles
    // Player paddle
    if (
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE > playerY &&
        ballY < playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH;
        ballVelX *= -1;
        let offset = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ballVelY += offset * 0.2;
        playBounce();
    }
    // AI paddle
    if (
        ballX + BALL_SIZE >= AI_X &&
        ballY + BALL_SIZE > aiY &&
        ballY < aiY + PADDLE_HEIGHT
    ) {
        ballX = AI_X - BALL_SIZE;
        ballVelX *= -1;
        let offset = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ballVelY += offset * 0.2;
        playBounce();
    }



    // Ball out of bounds (left or right)
    if (ballX < 0) {
        aiScore++;
        playScore();
        checkWin();
        resetPositions();
    }
    if (ballX + BALL_SIZE > canvas.width) {
        playerScore++;
        playScore();
        checkWin();
        resetPositions();
    }



    // Simple AI: move towards ball
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    let ballCenter = ballY + BALL_SIZE / 2;
    if (aiCenter < ballCenter - 10) {
        aiY += PADDLE_SPEED;
    } else if (aiCenter > ballCenter + 10) {
        aiY -= PADDLE_SPEED;
    }
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));



    updateScore();
}



function checkWin() {
    if (playerScore >= WIN_SCORE || aiScore >= WIN_SCORE) {
        isPlaying = false;
        playBtn.textContent = "Play Again";
        playBtn.style.display = 'inline-block';
        drawWinScreen();
    }
}



function updateScore() {
    playerScoreElem.textContent = playerScore;
    aiScoreElem.textContent = aiScore;
}



function resetBall() {
    ballX = canvas.width / 2 - BALL_SIZE / 2;
    ballY = canvas.height / 2 - BALL_SIZE / 2;
    ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}



function playBounce() {
    soundBounce.currentTime = 0;
    soundBounce.play();
}



function playScore() {
    soundScore.currentTime = 0;
    soundScore.play();
}



function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);



    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);



    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();


    // Draw center line
    ctx.strokeStyle = "#444";
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}


function drawWinScreen() {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    ctx.font = "48px Segoe UI, Arial";
    ctx.textAlign = "center";
    let msg = playerScore > aiScore ? "You Win!" : "AI Wins!";
    ctx.fillText(msg, canvas.width/2, canvas.height/2);
    ctx.font = "28px Segoe UI, Arial";
    ctx.fillText("Click Play to restart", canvas.width/2, canvas.height/2 + 50);
    ctx.restore();
}



// Initial draw (show canvas before playing)
resetPositions();
draw();
