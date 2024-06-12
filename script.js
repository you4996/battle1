const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const rotateButton = document.getElementById('rotateButton');
const timerElement = document.getElementById('timer');

const BAR_LENGTH = 100;
const BAR_THICKNESS = 10;
const NUM_BARS = 20;
const DANGO_SPEED = 2; // ダンゴムシの速度
const DANGO_DIAMETER = 30;

const bars = [];
const rows = 4; 
const cols = 5; 
const spacingX = (canvas.width - (cols * BAR_LENGTH)) / (cols + 1);
const spacingY = (canvas.height - (rows * BAR_LENGTH)) / (rows + 1);

const angles = [0, 90, 180, 270]; 

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        bars.push({
            x: spacingX + j * (BAR_LENGTH + spacingX),
            y: spacingY + i * (BAR_LENGTH + spacingY),
            angle: angles[Math.floor(Math.random() * angles.length)]
        });
    }
}

const dango = {
    x: 50,
    y: 50,
    direction: null,
    recentlyTurned: false,
    turnCooldown: 0
};

const start = { x: 50, y: 50 };
const goal = { x: 600, y: 400, width: 200, height: 200 };

let startTime = null;
let elapsedTime = 0;
let timerInterval = null;

const keysPressed = {};

function drawBar(bar) {
    ctx.save();
    ctx.translate(bar.x, bar.y);
    ctx.rotate(bar.angle * Math.PI / 180);
    ctx.fillStyle = 'blue';

    ctx.fillRect(0, 0, BAR_LENGTH, BAR_THICKNESS);
    ctx.fillRect(0, 0, BAR_THICKNESS, BAR_LENGTH);

    ctx.restore();
}

function drawDango() {
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(dango.x, dango.y, DANGO_DIAMETER / 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawGoal() {
    ctx.fillStyle = 'red';
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
}

function drawStartAndGoalText() {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('START', start.x - 20, start.y - 20);
    ctx.fillText('GOAL', goal.x + 10, goal.y + goal.height / 2 + 5);
}

function drawMazeBoundary() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMazeBoundary();
    bars.forEach(drawBar);
    drawDango();
    drawGoal();
    drawStartAndGoalText();
}

function moveDango() {
    if (dango.direction) {
        let newX = dango.x;
        let newY = dango.y;

        switch (dango.direction) {
            case 'right':
                newX += DANGO_SPEED;
                break;
            case 'left':
                newX -= DANGO_SPEED;
                break;
            case 'up':
                newY -= DANGO_SPEED;
                break;
            case 'down':
                newY += DANGO_SPEED;
                break;
        }

        let collision = false;

        bars.forEach(bar => {
            if (isColliding(newX, newY, bar)) {
                collision = true;
            }
        });

        if (!isCollidingWithBoundary(newX, newY) && !collision) {
            dango.x = newX;
            dango.y = newY;
        }

        if (isCollidingWithGoal(dango, goal)) {
            showCongratulations();
            return;
        }
    }
}

function isColliding(newX, newY, bar) {
    const cos = Math.cos(bar.angle * Math.PI / 180);
    const sin = Math.sin(bar.angle * Math.PI / 180);

    const relativeX = newX - bar.x;
    const relativeY = newY - bar.y;

    const transformedX = relativeX * cos + relativeY * sin;
    const transformedY = -relativeX * sin + relativeY * cos;

    const isCollidingHorizontal = (
        transformedX > 0 &&
        transformedX < BAR_LENGTH &&
        transformedY > 0 &&
        transformedY < BAR_THICKNESS
    );

    const isCollidingVertical = (
        transformedX > 0 &&
        transformedX < BAR_THICKNESS &&
        transformedY > 0 &&
        transformedY < BAR_LENGTH
    );

    return isCollidingHorizontal || isCollidingVertical;
}

function isCollidingWithBoundary(newX, newY) {
    return (
        newX <= DANGO_DIAMETER / 2 ||
        newX >= canvas.width - DANGO_DIAMETER / 2 ||
        newY <= DANGO_DIAMETER / 2 ||
        newY >= canvas.height - DANGO_DIAMETER / 2
    );
}

function isCollidingWithGoal(dango, goal) {
    return (
        dango.x > goal.x &&
        dango.x < goal.x + goal.width &&
        dango.y > goal.y &&
        dango.y < goal.y + goal.height
    );
}

function startTimer() {
    startTime = performance.now();
    timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    const currentTime = performance.now();
    elapsedTime = (currentTime - startTime) / 1000;
    timerElement.textContent = `Time: ${elapsedTime.toFixed(2)} seconds`;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerElement.textContent = `Time: ${elapsedTime.toFixed(2)} seconds`;
}

function resetGame() {
    dango.x = start.x;
    dango.y = start.y;
    dango.direction = null;
    dango.recentlyTurned = false;
    dango.turnCooldown = 0;
    elapsedTime = 0;
    startTimer();
}

function showCongratulations() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Congratulations!', canvas.width / 2, canvas.height / 2);
    stopTimer();
}

rotateButton.addEventListener('click', () => {
    bars.forEach(bar => {
        bar.angle = (bar.angle + 90) % 360;
    });
});

document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
    if (event.key === 'ArrowUp') dango.direction = 'up';
    if (event.key === 'ArrowDown') dango.direction = 'down';
    if (event.key === 'ArrowLeft') dango.direction = 'left';
    if (event.key === 'ArrowRight') dango.direction = 'right';
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
    if (!keysPressed['ArrowUp'] && !keysPressed['ArrowDown'] && !keysPressed['ArrowLeft'] && !keysPressed['ArrowRight']) {
        dango.direction = null;
    }
});

function gameLoop() {
    moveDango();
    draw();
    requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();
