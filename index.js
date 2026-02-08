const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 10; // size of snake segment and fruit

const snakeSize = 20;
const fruitSize = 30;

const canvasSize = 400;

let snake = [{x: 8 * box, y: 8 * box}];
let snakePixelPos = snake.map(seg => ({x: seg.x, y: seg.y}));
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let gameSpeed = 200; // starting speed in ms
let gameInterval;
let isPaused = false;
let pulse = 0;
let pulseSpeed = 0.1;

// Load fruit images
const fruitImages = {
  apple: new Image(),
  banana: new Image(),
  grapes: new Image(),
  orange: new Image(),
  watermelon: new Image()
};

// Set image sources (make sure you have images in the "fruits" folder)
fruitImages.apple.src = 'fruits/apple.png';
fruitImages.banana.src = 'fruits/banana.png';
fruitImages.grapes.src = 'fruits/grapes.png';
fruitImages.orange.src = 'fruits/orange.png';
fruitImages.watermelon.src = 'fruits/watermelon.png';

// List of fruits
const fruits = [
  {name: 'apple', img: fruitImages.apple},
  {name: 'banana', img: fruitImages.banana},
  {name: 'grapes', img: fruitImages.grapes},
  {name: 'orange', img: fruitImages.orange},
  {name: 'watermelon', img: fruitImages.watermelon}
];

// Generate random fruit
let food = randomFruit();

function randomFruit() {
  const fruit = fruits[Math.floor(Math.random() * fruits.length)];
  return {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box,
    img: fruit.img
  };
}

// Draw the snake and fruit
function draw() {

pulse += pulseSpeed;
const scale = 1 + 0.2 * Math.sin(pulse);

ctx.fillStyle = '#111';
ctx.fillRect(0, 0, canvasSize, canvasSize);

// Draw snake with shadow
for (let i = 0; i < snake.length; i++) {
ctx.save();
ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
ctx.shadowBlur = 5;
ctx.fillStyle = i === 0 ? 'lime' : 'green';
ctx.fillRect(snakePixelPos[i].x, snakePixelPos[i].y, snakeSize, snakeSize);
ctx.shadowBlur = 0;
}

  // Draw fruit with glow & pulse
  ctx.save();
  ctx.shadowColor = "yellow";
  ctx.shadowBlur = 15;
  ctx.drawImage(food.img, food.x, food.y, fruitSize * scale, fruitSize * scale);
  ctx.restore();

  document.getElementById('score').innerText = score;
}

// Control snake direction
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
  else if (event.key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
  else if (event.key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
  else if (event.key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
});

// Check collision with walls or self
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  return false;
}

// Update game state
function update() {
  if (isPaused) return;

  direction = nextDirection;
  let head = {x: snake[0].x, y: snake[0].y};

  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // Game over
  if (
    head.x < 0 || head.x >= canvasSize ||
    head.y < 0 || head.y >= canvasSize ||
    collision(head, snake)
  ) {
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    return;
  }

  snake.unshift(head);

  if (snakePixelPos.length < snake.length) {
    snakePixelPos.unshift({ x: head.x, y: head.y });
  }

  // Smooth interpolation for each snake segment
    for (let i = 0; i < snake.length; i++) {
    snakePixelPos[i].x += (snake[i].x - snakePixelPos[i].x) * 0.2;
    snakePixelPos[i].y += (snake[i].y - snakePixelPos[i].y) * 0.2;
    }

  // Eating fruit
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = randomFruit();

    // Increase speed every 5 points
    if (score % 5 === 0 && gameSpeed > 50) {
      gameSpeed -= 15;
      clearInterval(gameInterval);
      gameInterval = setInterval(update, gameSpeed);
    }

  } else {
    snake.pop();
  }

  draw();
}

// Buttons
document.getElementById('pauseBtn').addEventListener('click', () => {
  isPaused = !isPaused;
  document.getElementById('pauseBtn').innerText = isPaused ? 'Resume' : 'Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
  location.reload();
});

// Start the game
draw();
gameInterval = setInterval(update, gameSpeed);
