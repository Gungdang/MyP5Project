let font;
let img, originalImg; // 원본 이미지를 저장할 변수 추가
let scatterDistance = 120; // 초기 흩어짐 거리
let errorBoxes = [];
let showQuestionBox = true;
let generatingErrors = false;
let isShaking = false; // 흔들림 상태
let isFrozen = false; // NO 버튼을 눌렀을 때 모든 동작을 멈추게 하는 상태
let errorSpawnInterval = 5;
let errorSpawnCounter = 0;
let questionIndex = 0;

// 질문별 에러 메시지 설정
const errorMessagesByQuestion = [
  [
    " Is the issue tackled in the project widely acknowledged as a significant problem in today's society?",
    " Did I adopt an inventive and imaginative approach to draw public attention to this matter?",
    " Did I move beyond simply identifying the problem by presenting concrete, actionable, and realistic solutions?",
    " Try Again!                  -Press Enter-"
  ],
  [
    " Did the design challenge traditional stereotypes or introduce a new way of thinking?",
    " Does the project have the potential to engage the public and inspire behavioral change?",
    " Did it deliver a clear message that resonates with the audience and motivates them to act?",
    " Try Again!                -Press Enter-"
  ],
  [
    " Did I make an effort to overcome personal biases or preconceptions during the design process?",
    " Did I treat failures or setbacks as opportunities for reflection, learning, and growth?",
    " Did I actively seek and integrate feedback from professionals in other fields or from the general public?",
    " Try Again!                -Press Enter-"
  ],
  [
    "Did I gain new insights or perspectives through working with people from diverse backgrounds?",
    "Was my process guided by empathy, respect, and a commitment to understanding the needs of my audience and participants?",
    "Did I ensure an inclusive perspective that avoids favoring specific groups or viewpoints?",
    " Try Again!                -Press Enter-"
  ],
  [
    "Did it encourage the audience to recognize overlooked issues or opportunities in their everyday lives?",
    "Did the design offer fresh and enriching experiences that positively impact people's lives?",
    "Does the project have the potential to leave a meaningful, long-lasting impact instead of being a one-time effort?",
    " Try Again!                -Press Enter-"
  ]
];

const questions = [
  "Did the project address important social issues?",
  "Did the project shift public perceptions?",
  "Did I approach the process                        with openness and honesty?",
  "Did I foster collaboration and inclusivity?",
  "Did the project broaden public perspectives and expand their world?",
  "Did my design create social value?"
];

function preload() {
  font = loadFont("assets/Pretendard-Thin.ttf");
  originalImg = loadImage("assets/example.jpg"); // 원본 이미지 로드
}

function setup() {
  adjustCanvas();
  window.addEventListener("resize", adjustCanvas); // 창 크기 변경 이벤트
}

function draw() {
  if (isShaking) {
    applyShakeEffect(); // 흔들림 효과
  }

  background(0);
  image(img, 0, 0, width, height);

  for (let box of errorBoxes) {
    box.display();
  }

  if (showQuestionBox || isFrozen) {
    drawQuestionBox();
  }

  if (generatingErrors) {
    errorSpawnCounter++;
    if (errorSpawnCounter % errorSpawnInterval === 0) {
      createErrorBox(); // 에러 박스 생성
    }
  }
}

// 창 크기와 방향을 조정하는 함수
function adjustCanvas() {
  let w = window.innerWidth;
  let h = window.innerHeight;

  // 세로 모드일 경우 화면 회전을 강제
  if (h > w) {
    document.body.style.transform = "rotate(90deg)";
    document.body.style.transformOrigin = "center center";
    document.body.style.width = `${h}px`;
    document.body.style.height = `${w}px`;
  } else {
    document.body.style.transform = "rotate(0deg)";
    document.body.style.width = `${w}px`;
    document.body.style.height = `${h}px`;
  }

  resizeCanvas(window.innerWidth, window.innerHeight);

  textFont(font);
  textAlign(CENTER, CENTER);

  img = originalImg.get(); // 현재 상태 이미지 초기화
  scatterImage(); // 초기 이미지 흩어짐 적용
}

// 창 크기 변경 시 호출
function windowResized() {
  adjustCanvas();
}

function scatterImage() {
  img = originalImg.get(); // 매번 원본 이미지를 복사
  img.loadPixels();
  let scattered = createImage(img.width, img.height);

  scattered.loadPixels();
  for (let i = 0; i < img.pixels.length; i += 4) {
    let x = (i / 4) % img.width;
    let y = Math.floor((i / 4) / img.width);

    // 흩어짐 거리 적용
    let dx = Math.floor(random(-scatterDistance, scatterDistance));
    let dy = Math.floor(random(-scatterDistance, scatterDistance));

    let newX = (x + dx + img.width) % img.width;
    let newY = (y + dy + img.height) % img.height;

    let newIdx = 4 * (newY * img.width + newX);
    scattered.pixels[newIdx] = img.pixels[i];
    scattered.pixels[newIdx + 1] = img.pixels[i + 1];
    scattered.pixels[newIdx + 2] = img.pixels[i + 2];
    scattered.pixels[newIdx + 3] = img.pixels[i + 3];
  }
  scattered.updatePixels();
  img = scattered;
}

function applyShakeEffect() {
  let shakeAmount = 10; // 지속적인 흔들림 강도
  translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
}

function drawQuestionBox() {
  fill(255); // 질문 상자 배경 색상
  stroke(0); // 테두리 색상
  strokeWeight(2); // 테두리 두께
  rect(width / 4, height / 4, width / 2, height / 2, 20);

  fill(0); // 텍스트 색상

  if (questionIndex === questions.length - 1) {
    textSize(30); // 마지막 질문 텍스트는 더 크게
  } else {
    textSize(25); // 기본 텍스트 크기
  }

  textStyle(NORMAL); // 모든 질문 텍스트를 동일한 두께로 설정

  let lines = splitByWords(questions[questionIndex], 50); // 현재 질문을 단어별로 나누기
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], width / 2, height / 4 + 120 + i * 30 + 10); // 질문 텍스트 위치 설정
  }

  if (questionIndex === questions.length - 1) {
    let buttonWidth = 240; // 마지막 Yes 버튼 더 크게
    let buttonHeight = 60;

    fill(200, 200, 255); // Yes 버튼 배경색
    rect(width / 2 - buttonWidth / 2, height / 2 + 40, buttonWidth, buttonHeight); // Yes 버튼 위치
    fill(0); // Yes 버튼 텍스트 색상
    textSize(25);
    text("Yes", width / 2, height / 2 + 70); // Yes 텍스트 위치
  } else {
    let buttonWidth = 80; // 일반 버튼 크기
    let buttonHeight = 40;

    // Yes 버튼
    fill(200, 200, 255); // Yes 버튼 배경색
    rect(width / 2 - 100, height / 2 + 40, buttonWidth, buttonHeight); // Yes 버튼 위치
    fill(0); // Yes 버튼 텍스트 색상
    text("Yes", width / 2 - 60, height / 2 + 60);

    // No 버튼
    fill(255, 200, 200); // No 버튼 배경색
    rect(width / 2 + 20, height / 2 + 40, buttonWidth, buttonHeight); // No 버튼 위치
    fill(0); // No 버튼 텍스트 색상
    text("No", width / 2 + 60, height / 2 + 60);
  }
}

function mousePressed() {
  if (isFrozen) {
    return; // NO 버튼 누른 후에는 모든 동작을 막음
  }

  if (showQuestionBox) {
    if (questionIndex === questions.length - 1) {
      if (mouseX > width / 2 - 120 && mouseX < width / 2 + 120 &&
        mouseY > height / 2 + 40 && mouseY < height / 2 + 100) {
        scatterDistance = 0; // 마지막 "Yes" 버튼 클릭 시 이미지 완전 복구
        scatterImage();
        showQuestionBox = false;
      }
    } else {
      if (mouseX > width / 2 - 100 && mouseX < width / 2 - 20 &&
        mouseY > height / 2 + 50 && mouseY < height / 2 + 90) {
        questionIndex++;
        scatterDistance = max(0, scatterDistance - 20); // Yes 버튼 클릭 시 흩어짐 감소
        scatterImage();
      } else if (mouseX > width / 2 + 20 && mouseX < width / 2 + 100 &&
        mouseY > height / 2 + 50 && mouseY < height / 2 + 90) {
        generatingErrors = true;
        isShaking = true; // 흔들림 효과 시작
        isFrozen = true; // 모든 동작 멈춤
        createErrorBox(); // 에러 박스 추가
      }
    }
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    // 초기화: 원래 상태로 리셋
    showQuestionBox = true;
    generatingErrors = false;
    isShaking = false;
    isFrozen = false; // 멈춤 해제
    scatterDistance = 120; // 초기 흩어짐 거리로 리셋
    questionIndex = 0;
    errorBoxes = []; // 에러 박스 초기화
    scatterImage(); // 초기 상태로 복구
  }
}

function createErrorBox() {
  // 현재 질문에 따라 에러 메시지 선택
  let currentMessages = errorMessagesByQuestion[questionIndex % errorMessagesByQuestion.length];
  let randomMessage = currentMessages[int(random(currentMessages.length))];

  // 에러 박스 생성
  let boxHeight = 150;
  let spawnY = random(height / 4 - boxHeight, height * 0.75);
  errorBoxes.push(new ErrorBox(random(width - 300), spawnY, 300, boxHeight, randomMessage));
}

class ErrorBox {
  constructor(x, y, w, h, message) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.message = message;
  }

  display() {
    // 박스 외곽
    fill(0);
    stroke(255);
    strokeWeight(2);
    rect(this.x, this.y, this.w, this.h, 10);

    // 상단 바
    fill(30); // 상단 바 색상
    rect(this.x, this.y, this.w, 30); // 상단 바 높이 30

    // "Error" 텍스트
    fill(255); // 흰색 텍스트
    textSize(14);
    textAlign(LEFT, CENTER);
    text("Error", this.x + 10, this.y + 15); // 상단 바 왼쪽 정렬

    // "X" 버튼
    fill(255, 0, 0); // 빨간색
    rect(this.x + this.w - 30, this.y, 30, 30); // 상단 우측 "X" 버튼
    fill(255); // 흰색 텍스트
    textAlign(CENTER, CENTER);
    text("X", this.x + this.w - 15, this.y + 15); // 버튼 중앙에 "X" 텍스트

    // 중앙 메시지 (상단 바 제외한 영역에 가운데 정렬)
    fill(255);
    textSize(14);
    textAlign(CENTER, CENTER);

    // 텍스트 표시 영역 계산
    let textAreaY = this.y + 30; // 상단 바 이후부터 텍스트 시작
    let textAreaHeight = this.h - 30; // 상단 바를 제외한 높이
    let textStartY = textAreaY + textAreaHeight / 2; // 세로 중앙 위치

    // 텍스트 나누기 및 표시
    let lines = splitByWords(this.message, 30); // 줄 나누기
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], this.x + this.w / 2, textStartY + i * 20 - (lines.length - 1) * 10); // 가로 중앙 및 세로 정렬
    }
  }
}

function splitByWords(text, maxCharsPerLine) {
  let lines = [];
  let words = text.split(" ");
  let currentLine = "";

  for (let word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += word + " ";
    } else {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    }
  }
  lines.push(currentLine.trim());
  return lines;
}
