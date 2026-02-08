const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Audio (Ensures game doesn't crash if files are missing)
const eatSound = new Audio("sounds/eat.wav");
const deathSound = new Audio("sounds/death.mp3");

const box = 20; 
const snakeSize = 20;
const fruitSize = 30;
const canvasSize = 400;

let snake = [{x: 8 * box, y: 8 * box}];
let snakePixelPos = snake.map(seg => ({x: seg.x, y: seg.y}));
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let gameSpeed = 200; 
let gameInterval;
let isPaused = false;

// Animation Variables
let pulse = 0;
let pulseSpeed = 0.15; // Speed of the squish animation

// Load fruit images
const fruitImages = {
  apple: new Image(),
  banana: new Image(),
  grapes: new Image(),
  orange: new Image(),
  watermelon: new Image()
};

fruitImages.apple.src = 'fruits/apple.png';
fruitImages.banana.src = 'fruits/banana.png';
fruitImages.grapes.src = 'fruits/grapes.png';
fruitImages.orange.src = 'fruits/orange.png';
fruitImages.watermelon.src = 'fruits/watermelon.png';

const fruits = [
  {name: 'apple', img: fruitImages.apple},
  {name: 'banana', img: fruitImages.banana},
  {name: 'grapes', img: fruitImages.grapes},
  {name: 'orange', img: fruitImages.orange},
  {name: 'watermelon', img: fruitImages.watermelon}
];

let food = randomFruit();

function randomFruit() {
  const fx = Math.floor(Math.random() * 20) * box;
  const fy = Math.floor(Math.random() * 20) * box;
  const fruitType = fruits[Math.floor(Math.random() * fruits.length)];
  return {
    gx: fx,
    gy: fy,
    x: fx,
    y: fy,
    img: fruitType.img
  };
}

// Draw Function
function draw() {
  // 1. Update Animation Pulse
  pulse += pulseSpeed;
  const fruitScale = 1 + 0.15 * Math.sin(pulse);

  // 2. Background
  ctx.fillStyle = '#1a1a1a'; // Slightly lighter than pure black for contrast
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // 3. Draw Snake (Paper Craft Style)
  for (let i = 0; i < snake.length; i++) {
    ctx.save();
    
    // Smooth Interpolation for visual position
    const visualX = snakePixelPos[i].x;
    const visualY = snakePixelPos[i].y;
    const centerX = visualX + snakeSize / 2;
    const centerY = visualY + snakeSize / 2;

    // Squish Logic: Create a wave effect down the body
    const segmentPulse = Math.sin(pulse - (i * 0.8)) * 0.15;
    const widthChange = snakeSize * segmentPulse;
    const heightChange = snakeSize * -segmentPulse;

    // Drop Shadow for Paper Look
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Colors
    ctx.fillStyle = (i % 2 === 0) ? '#8DB600' : '#4B5320';
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // Very faint paper edge
    
    // Draw Segment
    ctx.beginPath();
    ctx.roundRect(
      visualX - widthChange / 2, 
      visualY - heightChange / 2, 
      snakeSize + widthChange, 
      snakeSize + heightChange, 
      5 // rounded corners
    );
    ctx.fill();
    ctx.stroke();

    // Eyes on Head
    if (i === 0) {
      ctx.shadowBlur = 0; // Remove shadow from eyes
      ctx.fillStyle = "black";
      const eyeOffset = snakeSize / 4;
      
      ctx.beginPath();
      ctx.arc(centerX - eyeOffset, centerY - eyeOffset, 2, 0, Math.PI * 2);
      ctx.arc(centerX + eyeOffset, centerY - eyeOffset, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  // 4. Draw Fruit (Glow & Pulse)
  ctx.save();
  ctx.shadowColor = "rgba(255, 255, 0, 0.5)";
  ctx.shadowBlur = 20;

  const foodCenterX = food.gx + box / 2;
  const foodCenterY = food.gy + box / 2;

  ctx.drawImage(
    food.img,
    foodCenterX - (fruitSize * fruitScale) / 2,
    foodCenterY - (fruitSize * fruitScale) / 2,
    fruitSize * fruitScale,
    fruitSize * fruitScale
  );
  ctx.restore();

  // 5. Score Update
  document.getElementById('score').innerText = score;
}

// Input Handling
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
  else if (event.key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
  else if (event.key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
  else if (event.key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
});

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  return false;
}

// Update Game State
function update() {
  if (isPaused) return;

  direction = nextDirection;
  let head = {x: snake[0].x, y: snake[0].y};

  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // Check Game Over
  if (
    head.x < 0 || head.x >= canvasSize ||
    head.y < 0 || head.y >= canvasSize ||
    collision(head, snake)
  ) {
    clearInterval(gameInterval);
    deathSound.play().catch(() => {}); // catch error if sound file missing
    alert(`Game Over! Your score: ${score}`);
    return;
  }

  // Add new head
  snake.unshift(head);
  snakePixelPos.unshift({ x: head.x, y: head.y });

  // Handle Food
  if (head.x === food.gx && head.y === food.gy) {
    score++;
    eatSound.play().catch(() => {});
    food = randomFruit();

    // Speed up logic
    if (score % 5 === 0 && gameSpeed > 50) {
      gameSpeed -= 15;
      clearInterval(gameInterval);
      gameInterval = setInterval(update, gameSpeed);
    }
  } else {
    snake.pop();
    snakePixelPos.pop();
  }
}

// Visual Smooth Loop (Independent of game speed for smooth animation)
function gameLoop() {
  // Smoothly slide visual positions toward logical positions
  for (let i = 0; i < snake.length; i++) {
    if (snakePixelPos[i]) {
      snakePixelPos[i].x += (snake[i].x - snakePixelPos[i].x) * 0.2;
      snakePixelPos[i].y += (snake[i].y - snakePixelPos[i].y) * 0.2;
    }
  }
  
  draw();
  requestAnimationFrame(gameLoop);
}

// UI Buttons
document.getElementById('pauseBtn').addEventListener('click', () => {
  isPaused = !isPaused;
  document.getElementById('pauseBtn').innerText = isPaused ? 'Resume' : 'Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
  location.reload();
});

// Start Everything
gameInterval = setInterval(update, gameSpeed);
gameLoop();