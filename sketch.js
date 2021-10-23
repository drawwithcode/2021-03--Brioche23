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
    image(this.img, this.x, this.y, this.standardWidth, this.standardHeight);
    this.over();
    this.showInfo();
  }

  //  Checks if the mouse is over the image
  over() {
    //  If mouse is on --> Play song and return TRUE
    if (
      mouseX > this.x - this.standardWidth / 2 &&
      mouseX < this.x + this.standardWidth / 2 &&
      mouseY > this.y - this.standardHeight / 2 &&
      mouseY < this.y + this.standardHeight / 2
    ) {
      if (!songs[this.id].isPlaying()) songs[this.id].loop();
      cursor(HAND);
      return true;
    } else {
      //  Else pause song and return FALSE
      songs[this.id].pause();
      cursor(ARROW);

      return false;
    }
  }

  //  Shows movie information next to the image
  showInfo() {
    push();
    //  Vertical offset to center text with the image
    translate(this.x * 2, this.y - 50);

    textAlign(LEFT);
    textSize(20);
    textStyle(BOLD);
    text(movies[this.id].title, 0, 0);
    textStyle(NORMAL);
    text("Directed by " + movies[this.id].director, 0, 0 + 25);
    text("Written by " + movies[this.id].writer, 0, 0 + 50);
    text("Year: " + movies[this.id].year, 0, 0 + 75);
    text("Running time: " + movies[this.id].time + "min", 0, 0 + 100);
    //  Index of the movie / total movies in the dataset
    text("(" + (this.id + 1) + "/" + nMovies + ")", 0, 0 + 150);
    pop();
  }

  //  Run if mouse is pressed && over the image
  clicked() {
    if (this.over()) {
      movieSelected = true;
      imageToText(this.img, this.screenplay);
    }
  }
}

//  Declaring variables
let buttons = [];

let data;
let imgs = new Array();
let screenplays = new Array();
let songs = new Array();

let nMovies;
let movies;

const fontSizeMax = 15;
const fontSizeMin = 5;
const spacing = 7; // line height
const kerning = -0.5; // between letters

let movieSelected = false;
let movieIndex = 0;

let subtitle = "[Click on the images to see to words turn into pictures]";

function preload() {
  // To load the other assets after the main dataset.. callback function
  data = loadJSON("./assets/json/movies.json", function (data) {
    loadAssets(data.movies.length);
  });
}

function loadAssets(_nMovies) {
  //  !Find a way to obtain the number of movies!
  for (let i = 0; i < _nMovies; i++) {
    imgs[i] = loadImage("./assets/img/movie_" + i + ".jpg");
    screenplays[i] = loadStrings("./assets/txt/movie_" + i + ".txt");
    songs[i] = loadSound("./assets/songs/movie_" + i + ".mp3");
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(10);
  textFont("Courier");
  //textAlign(LEFT, CENTER);

  imageMode(CENTER);

  movies = data.movies;
  nMovies = movies.length;
  movies.forEach((m, index) => {
    buttons[index] = new Button(m.id, m.title, imgs[index], screenplays[index]);
  });

  setHomeBg();
}

function draw() {
  if (!movieSelected) buttons[movieIndex].display();
}

function setHomeBg() {
  fill(255);
  textAlign(CENTER);
  //  Title text
  push();
  textSize(36);
  translate(width / 2, height / 8);
  text("Wordplay", 0, 0);
  textSize(18);
  text(subtitle, 0, 0 + 25);
  pop();
  //  Command text
  push();
  translate(width / 2, height - height / 6);
  textSize(16);
  textAlign(LEFT);
  textStyle(BOLD);
  text("Commands", 0, 0);
  textStyle(NORMAL);
  text("Right Arrow:\tNext Movie", 0, 0 + 20);
  text("Left Arrow:\t Previous Movie", 0, 0 + 40);
  text("Backspace:\t  Back to home (image mode)", 0, 0 + 60);
  pop();
}

function cleanText(screenplay) {
  //  First cycle to remove all voids
  let _s;
  screenplay.forEach((s, index, array) => {
    _s = s.replace(/\s\s+|\r\n/g, "");
    array[index] = trim(_s);
    array.splice(index, s);
  });

  //Second cycle to remove all the blank elements from the array
  screenplay.forEach((s, index, array) => {
    if (s === "") {
      console.log("Linea Vuota");
      array.splice(index, 1);
    }
  });
}

//  Function that maps the screenplays letter over the image pixels
function imageToText(img, screenplay) {
  background(0);
  //  Remove every usless character
  cleanText(screenplay);
  getImgScale(img);

  let x = 0;
  let y = spacing;
  let counter = 0;
  let line = 0;
  let lines = screenplay.length;
  let deltaWidth;
  let deltaHeight;
  let absDW;
  let absDH;

  let imgScale = getImgScale(img);
  console.log("imgScale:", imgScale);

  push();
  translate(width / 2, height / 2);
  imageMode(CENTER);
  img.resize(img.width * imgScale, img.height * imgScale);
  deltaWidth = width - img.width;
  deltaHeight = height - img.height;
  absDW = abs(deltaWidth);
  absDH = abs(deltaHeight);
  x = absDW / 2;
  // The cycle stops when the text reaches the bottom of the window
  while (y < height + absDH / 2) {
    // translate position (display) to position (image)
    img.loadPixels();

    //  For cycle to speed up the process
    for (let i = 0; i < 1000; i++) {
      // get current color
      let imgX = round(map(x, 0, width, 0, img.width + deltaWidth));
      let imgY = round(map(y, 0, height, 0, img.height + deltaHeight));
      let c = color(img.get(imgX, imgY));
      // Converting to greyscale
      let greyscale = round(
        red(c) * 0.222 + green(c) * 0.707 + blue(c) * 0.071
      );

      //  If the text file is over it starts from the beginning
      if (line == lines - 1 && counter == screenplay[line].length - 1) {
        line = 0;
        counter = 0;
      }

      push();
      //  Set the position of the letter
      translate(x - width / 2 - absDW / 2, y - height / 2 - absDH / 2);

      //  Font size is based on the greyscale value
      let fontSize = map(greyscale, 0, 255, fontSizeMax, fontSizeMin);
      fontSize = max(fontSize, 1);
      textSize(fontSize);
      fill(c);

      //  Goes through the entire file line by line and char by char
      let letter = screenplay[line].charAt(counter);
      text(letter, 0, 0);
      //Incrementing the horizontal position

      let letterWidth = textWidth(letter) + kerning;
      x += letterWidth;
      pop();

      // Linebreaks
      if (x + letterWidth > width + absDW / 2) {
        x = absDW / 2;
        y += spacing;
      }

      counter++;
      //  End Of Line --> New Line
      if (counter >= screenplay[line].length) {
        counter = 0;
        line++;
      }
    }
  }
  pop();
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

function getImgScale(img) {
  let is;
  push();
  translate(width / 2, height / 2);
  imageMode(CENTER);
  is = Math.max(width / img.width, height / img.height);
  //image(img, 0, 0, img.width * imgScale, img.height * imgScale);
  pop();

  return is;
}
