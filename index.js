const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const snakeSize = 20;
const fruitSize = 30;
const canvasSize = 400;

let snake = [{x: 8*box, y: 8*box}];
let snakePixelPos = snake.map(seg => ({x: seg.x, y: seg.y}));
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let gameSpeed = 200;
let gameInterval;
let isPaused = false;
let pulse = 0;
let pulseSpeed = 0.15;

// Audio
const eatSound = new Audio("sounds/eat.wav");
const deathSound = new Audio("sounds/death.mp3");

// Fruits
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
  {name:'apple', img: fruitImages.apple},
  {name:'banana', img: fruitImages.banana},
  {name:'grapes', img: fruitImages.grapes},
  {name:'orange', img: fruitImages.orange},
  {name:'watermelon', img: fruitImages.watermelon}
];

let food = randomFruit();

function randomFruit() {
  const fx = Math.floor(Math.random()*20)*box;
  const fy = Math.floor(Math.random()*20)*box;
  const fruitType = fruits[Math.floor(Math.random()*fruits.length)];
  return { gx: fx, gy: fy, x: fx, y: fy, img: fruitType.img };
}

// Draw
function draw() {
  pulse += pulseSpeed;
  const fruitScale = 1 + 0.15*Math.sin(pulse);

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Snake
  for (let i=0;i<snake.length;i++){
    ctx.save();
    const visualX = snakePixelPos[i].x;
    const visualY = snakePixelPos[i].y;
    const centerX = visualX + snakeSize/2;
    const centerY = visualY + snakeSize/2;

    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = (i%2===0)?'#8DB600':'#4B5320';
    ctx.beginPath();
    ctx.arc(centerX, centerY, snakeSize/2, 0, Math.PI*2);
    ctx.fill();

    if (i===0){
      // Eyes
      ctx.shadowBlur = 0;
      ctx.fillStyle="black";
      ctx.beginPath();
      const eyeOffset = snakeSize/4;
      ctx.arc(centerX-eyeOffset, centerY-eyeOffset, 2, 0, Math.PI*2);
      ctx.arc(centerX+eyeOffset, centerY-eyeOffset, 2, 0, Math.PI*2);
      ctx.fill();
      // Mouth
      ctx.beginPath();
      ctx.arc(centerX, centerY+eyeOffset/2, 4, 0, Math.PI);
      ctx.strokeStyle="black";
      ctx.stroke();
    }

    ctx.restore();
  }

  // Fruit
  ctx.save();
  ctx.shadowColor = "rgba(255,255,0,0.5)";
  ctx.shadowBlur = 20;
  const foodCenterX = food.gx + box/2;
  const foodCenterY = food.gy + box/2;
  ctx.drawImage(
    food.img,
    foodCenterX-(fruitSize*fruitScale)/2,
    foodCenterY-(fruitSize*fruitScale)/2,
    fruitSize*fruitScale,
    fruitSize*fruitScale
  );
  ctx.restore();

  // Score
  document.getElementById('score').innerText = score;
}

// Keyboard controls
document.addEventListener('keydown',(e)=>{
  if(e.key==='ArrowUp' && direction!=='DOWN') nextDirection='UP';
  if(e.key==='ArrowDown' && direction!=='UP') nextDirection='DOWN';
  if(e.key==='ArrowLeft' && direction!=='RIGHT') nextDirection='LEFT';
  if(e.key==='ArrowRight' && direction!=='LEFT') nextDirection='RIGHT';
});

// Mobile controls
document.getElementById('upBtn').addEventListener('touchstart',()=>{if(direction!=='DOWN') nextDirection='UP';});
document.getElementById('downBtn').addEventListener('touchstart',()=>{if(direction!=='UP') nextDirection='DOWN';});
document.getElementById('leftBtn').addEventListener('touchstart',()=>{if(direction!=='RIGHT') nextDirection='LEFT';});
document.getElementById('rightBtn').addEventListener('touchstart',()=>{if(direction!=='LEFT') nextDirection='RIGHT';});

// Collision
function collision(head,array){for(let i=0;i<array.length;i++){if(head.x===array[i].x&&head.y===array[i].y)return true;}return false;}

// Update
function update(){
  if(isPaused) return;
  direction=nextDirection;
  let head={x:snake[0].x,y:snake[0].y};
  if(direction==='LEFT') head.x-=box;
  if(direction==='RIGHT') head.x+=box;
  if(direction==='UP') head.y-=box;
  if(direction==='DOWN') head.y+=box;

  if(head.x<0||head.x>=canvasSize||head.y<0||head.y>=canvasSize||collision(head,snake)){
    clearInterval(gameInterval);
    deathSound.play().catch(()=>{});
    alert(`Game Over! Score: ${score}`);
    return;
  }

  snake.unshift(head);
  snakePixelPos.unshift({x:head.x,y:head.y});

  if(head.x===food.gx && head.y===food.gy){
    score++;
    eatSound.play().catch(()=>{});
    food=randomFruit();
    if(score%5===0 && gameSpeed>50){
      gameSpeed-=15;
      clearInterval(gameInterval);
      gameInterval=setInterval(update,gameSpeed);
    }
  }else{
    snake.pop();
    snakePixelPos.pop();
  }
}

// Smooth loop
function gameLoop(){
  for(let i=0;i<snake.length;i++){
    if(snakePixelPos[i]){
      snakePixelPos[i].x+=(snake[i].x-snakePixelPos[i].x)*0.2;
      snakePixelPos[i].y+=(snake[i].y-snakePixelPos[i].y)*0.2;
    }
  }
  draw();
  requestAnimationFrame(gameLoop);
}

// UI buttons
document.getElementById('pauseBtn').addEventListener('click',()=>{
  isPaused=!isPaused;
  document.getElementById('pauseBtn').innerText=isPaused?'Resume':'Pause';
});
document.getElementById('restartBtn').addEventListener('click',()=>{location.reload();});

// Start
gameInterval=setInterval(update,gameSpeed);
gameLoop();
