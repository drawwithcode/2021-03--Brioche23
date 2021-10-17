class Button {
  constructor(id, text, image, screenplay) {
    this.id = id;
    this.text = text;
    this.img = image;
    this.x = width / 4;
    this.y = height / 2;
    this.standardWidth = width / 3;
    this.standardHeight =
      (this.img.height / this.img.width) * this.standardWidth;
    this.screenplay = screenplay;
  }

  display() {
    fill(255);
    //text(this.text, width / 2, 200 + (this.id + 1) * 100);
    image(this.img, this.x, this.y, this.standardWidth, this.standardHeight);

    this.over();
    this.showInfo();
  }

  over() {
    if (
      mouseX > this.x - this.standardWidth / 2 &&
      mouseX < this.x + this.standardWidth / 2 &&
      mouseY > this.y - this.standardHeight / 2 &&
      mouseY < this.y + this.standardHeight / 2
    ) {
      console.log(this.id);
      if (!songs[this.id].isPlaying()) songs[this.id].play();
      console.log("songs:", songs[this.id]);
      return true;
    } else {
      songs[this.id].pause();
      return false;
    }
  }

  showInfo() {
    push();
    translate(0, -50);

    textStyle(BOLD);
    textAlign(LEFT);
    text(movies[this.id].title, this.x * 2, this.y);
    textStyle(NORMAL);
    text("Directed by " + movies[this.id].director, this.x * 2, this.y + 30);
    text("Written by " + movies[this.id].writer, this.x * 2, this.y + 60);
    text("Year: " + movies[this.id].year, this.x * 2, this.y + 90);
    text(
      "Running time: " + movies[this.id].time + "min",
      this.x * 2,
      this.y + 120
    );
    pop();
  }

  clicked() {
    if (this.over()) {
      movieSelected = true;
      imageToText(this.img, this.screenplay);
    }
  }
}

let buttons = [];

let data;
let imgs = new Array();
let screenplays = new Array();
let songs = new Array();
let nMovies;
let movies;

let imgScale = 0;

let fontSizeMax = 10;
let fontSizeMin = 3;
let spacing = 7; // line height
let kerning = 0; // between letters
let line = 0;

let movieSelected = false;

function preload() {
  data = loadJSON("./assets/json/movies.json");
  for (let i = 0; i < 3; i++) {
    imgs[i] = loadImage("./assets/img/movie_" + i + ".jpg");
    screenplays[i] = loadStrings("./assets/txt/movie_" + i + ".txt");
    songs[i] = loadSound("./assets/songs/movie_" + i + ".mp3");
  }
}

let subtitle = "[Click on the images to see to words turn into pictures]";

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(10);
  textFont("Courier");
  //textAlign(LEFT, CENTER);
  imageMode(CENTER);

  movies = data.movies;
  nMovies = movies.length;

  movies.forEach((m, index) => {
    // text(m.year, width / 2, height / 4 + (index + 1) * 100);
    buttons[index] = new Button(m.id, m.title, imgs[index], screenplays[index]);
  });

  setHomeBg();
}

let movieIndex = 0;

function draw() {
  //backgroundImage(imgs[0]);
  // imgs.forEach((img, index) => {
  //   image(img, width / 2, (index + 1) * 200, img.width / 5, img.height / 5);
  // });

  if (!movieSelected) buttons[movieIndex].display();

  //if (movieSelected) imageToText();
  //noLoop();
}

function setHomeBg() {
  background(0);
  //print(img.width + " • " + img.height);
  fill(255);
  textAlign(CENTER);
  textSize(36);
  text("Wordplay", width / 2, height / 8);
  textSize(24);
  text(subtitle, width / 2, height / 6);
}

function cleanText(screenplay) {
  //  Firsy cycle to remove all voids
  let n_s;
  screenplay.forEach((s, index, array) => {
    n_s = s.replace(/\s\s+|\r\n/g, "");
    array[index] = n_s;
    array.splice(index, n_s);
  });

  //Second cycle to remove all the void elements from the array
  screenplay.forEach((s, index, array) => {
    if (s === "") {
      console.log("Linea Vuota");
      array.splice(index, 1);
    }
  });

  // console.log(screenplay);
}

function imageToText(img, screenplay) {
  background(0);
  cleanText(screenplay);
  console.log("screenplay:", screenplay);

  let x = 0;
  let y = spacing;
  let counter = 0;

  while (y < height) {
    // translate position (display) to position (image)
    img.loadPixels();
    for (let i = 0; i < 100; i++) {
      // get current color
      let imgX = round(map(x, 0, width, 0, img.width));
      let imgY = round(map(y, 0, height, 0, img.height));
      let c = color(img.get(imgX, imgY));
      let greyscale = round(
        red(c) * 0.222 + green(c) * 0.707 + blue(c) * 0.071
      );

      push();
      translate(x, y);

      let fontSize = map(greyscale, 0, 255, fontSizeMax, fontSizeMin);
      fontSize = max(fontSize, 1);
      textSize(fontSize);
      fill(c);

      //console.log("screenplay:", screenplay[line]);
      let letter = screenplay[line].charAt(counter);
      text(letter, 0, 0);
      let letterWidth = textWidth(letter) + kerning;
      x += letterWidth;

      pop();

      // linebreaks
      if (x + letterWidth >= width) {
        x = 0;
        y += spacing;
      }

      counter++;
      if (counter >= screenplay[line].length) {
        counter = 0;
        line++;
      }
    }
  }
}

function mousePressed() {
  if (!movieSelected) buttons[movieIndex].clicked();
}

function keyPressed() {
  if (!movieSelected)
    if (keyCode === LEFT_ARROW) {
      decrementMovieIndex();
    } else if (keyCode === RIGHT_ARROW) {
      incrementMovieIndex();
    }
  if (movieSelected)
    if (keyCode === BACKSPACE) {
      movieSelected = false;
      setHomeBg();
    }
}

function incrementMovieIndex() {
  setHomeBg();
  songs[movieIndex].stop();
  if (movieIndex < nMovies) movieIndex++;
  if (movieIndex == nMovies) movieIndex = 0;
}

function decrementMovieIndex() {
  setHomeBg();
  songs[movieIndex].stop();
  if (movieIndex >= 0) movieIndex--;
  if (movieIndex < 0) movieIndex = nMovies - 1;
}

// function backgroundImage(img) {
//   push();
//   translate(width / 2, height / 2);
//   imageMode(CENTER);
//   imgScale = Math.max(width / img.width, height / img.height);
//   image(img, 0, 0, img.width * imgScale, img.height * imgScale);
//   pop();
// }
