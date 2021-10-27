/*
Brioschi Alessio
Creative Coding 2021-22

Assignment_03
"Digital collage:
Mix images, data, sounds and generative graphics 
to create a dynamic artwork"

Idea
Create a small movie/tv series dataset
For every show you can listen to its main theme
If you click on the image the movie screenplay will
compose the image itself, matching the letters with the pixel color

The code for the translation of the pixels into letters is taken
from here:
http://www.generative-gestaltung.de/2/sketches/?01_P/P_4_3_2_01

This was my starting point but I had to massively modify it 
to make it work with every image without distortions 

MOUSE
left click  : select image to convert

KEYS
right arrow : next movie
left arrow  : previous movie
backspace   : return to movie selection (from image mode)
s           : save a png of the artwork
*/

//  Creating a class movie
class Movie {
  constructor(id, text) {
    this.id = id;
    this.text = text;
    this.img = imgs[this.id];
    this.x = width / 4;
    this.y = height / 2;
    //  Width is fixed
    this.standardWidth = width / 3;
    //  Height is set proportionally
    this.standardHeight =
      (this.img.height / this.img.width) * this.standardWidth;
    this.screenplay = screenplays[this.id];
  }

  //  Function to display the movie
  display() {
    image(this.img, this.x, this.y, this.standardWidth, this.standardHeight);
    //  Displays text infos
    this.showInfo();
    //  Checks if mouse is over
    this.over();
  }

  //  Checks if the mouse is over the image
  over() {
    //  If mouse is over --> Play song and return TRUE
    if (
      mouseX > this.x - this.standardWidth / 2 &&
      mouseX < this.x + this.standardWidth / 2 &&
      mouseY > this.y - this.standardHeight / 2 &&
      mouseY < this.y + this.standardHeight / 2
    ) {
      if (!songs[this.id].isPlaying()) songs[this.id].loop();
      cursor(HAND); //  Cursor becomes a hand
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
    let sp = 25; // Spacing
    push();
    //  Vertical offset to center text with the image
    translate(this.x * 2, this.y - 50);
    textAlign(LEFT);
    textSize(20);
    textStyle(BOLD);
    text(movies[this.id].title, 0, 0);
    textStyle(NORMAL);
    text("Directed by " + movies[this.id].director, 0, 0 + sp);
    text("Written by " + movies[this.id].writer, 0, 0 + sp * 2);
    text("Year: " + movies[this.id].year, 0, 0 + sp * 3);
    text("Running time: " + movies[this.id].time + " min", 0, 0 + sp * 4);
    //  Index of the movie / total movies in the dataset
    text("(" + (this.id + 1) + "/" + nMovies + ")", 0, 0 + sp * 5);
    pop();
  }

  //  Run if mouse is pressed && over the image
  clicked() {
    if (this.over()) {
      movieSelected = true;
      //  Run the function to convert the image into text
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

const fontSizeMax = 12;
const fontSizeMin = 4;
const spacing = 6; // line height
const kerning = -0.5; // between letters

let movieSelected = false;
let movieIndex = 0;

let subtitle = "[Click on the images to see to words turn into pictures]";

//  Preload assets
function preload() {
  //  Using callback function to load the other assets after the main dataset
  //  based upon the number of elements in the JSON file
  data = loadJSON("./assets/json/movies.json", function (data) {
    loadAssets(data.movies.length);
  });
}

//  Callback
function loadAssets(_nMovies) {
  //  Since all the files are named in the same way I use a for cycle
  //  Load all the assets in arrays
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

  //  Obtaining informations form the JSSON
  movies = data.movies;
  nMovies = movies.length;
  //  ForEach to create a class for every movie
  movies.forEach((m, index) => {
    buttons[index] = new Movie(m.id, m.title);
  });

  //  Displaying the elements in the home
  setHomeBg();
}

function draw() {
  //  If no movie is selected --> Display the movie selection
  if (!movieSelected) buttons[movieIndex].display();
}

//  Function to set up some basic static text
function setHomeBg() {
  let sp = 25; //  Spacing
  background(0);
  fill(255);
  textAlign(CENTER);
  //  Title text
  push();
  textSize(36);
  //  By using translate is easier to move all the text at once
  translate(width / 2, height / 8);
  text("Wordplay", 0, 0);
  textSize(18);
  text(subtitle, 0, 0 + sp);
  pop();
  //  Commands text
  push();
  sp = 20;
  translate(width / 2, height - height / 6);
  textSize(16);
  textAlign(LEFT);
  textStyle(BOLD);
  text("Commands", 0, 0);
  textStyle(NORMAL);
  text("Right Arrow:\tNext Movie", 0, sp);
  text("Left Arrow:\t Previous Movie", 0, sp * 2);
  text("Backspace:\t  Back to home (image mode)", 0, sp * 3);
  text("S:\t\t\t\t\t\tSave Artwork as a .png", 0, sp * 4);
  pop();
}

//  Function to remove all the white spaces and empty elements
//  in the Screenplay array
//  (Each position is an array of strings)
function cleanText(screenplay) {
  //  First cycle to remove all blanks
  let _s;
  screenplay.forEach((s, index, array) => {
    _s = s.replace(/\s\s+|\r\n/g, "");
    array[index] = trim(_s);
    array.splice(index, s);
  });

  //  Second cycle to remove all the empty elements from the array
  //  It can be optimized but I couldn't quite manage how to do that
  //  (Two forEach are a bit overkill)
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

  let x = 0;
  let y = spacing;
  let counter = 0;
  let line = 0;
  let lines = screenplay.length;
  let deltaWidth;
  let deltaHeight;
  let absDW;
  let absDH;
  //  imgScale is useful to avoid the stretch of the final image
  let imgScale = getImgScale(img);
  //  Creating the same condition of the backgroundImage function seen in lesson 04
  //  Adapting the code to work in this situation so the image proportions are mantained
  push();
  //  Set origin in the center
  translate(width / 2, height / 2);
  imageMode(CENTER);
  //  Resizing the image to fit the window without distorting it
  img.resize(img.width * imgScale, img.height * imgScale);
  //  Calculating the deltas --> How much the other dimension goes over the window boundaries
  deltaWidth = width - img.width;
  deltaHeight = height - img.height;
  absDW = abs(deltaWidth);
  absDH = abs(deltaHeight);

  //  Setting the starting X coordinate (position of the left margin)
  //  Devided by 2 because the image is centered
  x = absDW / 2;
  // The cycle stops when the text reaches the bottom of the window (+ half the delta)
  while (y < height + absDH / 2) {
    //  Loading pixels of the resized image
    img.loadPixels();
    //  For cycle to speed up the process
    for (let i = 0; i < 1000; i++) {
      // Get current color
      let imgX = round(map(x, 0, width, 0, img.width + deltaWidth));
      let imgY = round(map(y, 0, height, 0, img.height + deltaHeight));
      let c = color(img.get(imgX, imgY));
      // Converting to greyscale
      let greyscale = round(
        red(c) * 0.222 + green(c) * 0.707 + blue(c) * 0.071
      );

      //  If the text file is over it starts from the beginning
      //  In this way I can avoid putting the entire script into the text file
      //  or if the script is too short it won't be a problem
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

      // Linebreaks when X reaches the width of the window (+ half the delta)
      if (x + letterWidth > width + absDW / 2) {
        x = absDW / 2;
        y += spacing;
      }

      //  Next letter
      counter++;

      //  In the string array is End Of Line --> New Line
      if (counter >= screenplay[line].length) {
        counter = 0;
        line++;
      }
    }
  }
  pop();
}

//  Checks if mouse is pressed
function mousePressed() {
  if (!movieSelected) buttons[movieIndex].clicked();
}

//  Key actions
function keyPressed() {
  let d = day();
  let m = month();
  let y = year();

  //  Save canvas as a png with date
  if (key == "s" || key == "S")
    saveCanvas(y + "_" + m + "_" + d + "_Collage", "png");

  //  In the select movie mode
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
  setHomeBg(); //Reset movie index
  songs[movieIndex].stop(); //Stop the music
  //  Loop the count
  if (movieIndex < nMovies) movieIndex++;
  if (movieIndex == nMovies) movieIndex = 0;
}

function decrementMovieIndex() {
  setHomeBg(); //Reset movie index
  songs[movieIndex].stop(); //Stop the music
  //  Loop the count
  if (movieIndex >= 0) movieIndex--;
  if (movieIndex < 0) movieIndex = nMovies - 1;
}

//  Based on the backgroundImage function seen in lesson 04
//  Finds the scaling ratio to make one of the two dimension fit the window
function getImgScale(img) {
  let is;
  push();
  translate(width / 2, height / 2);
  imageMode(CENTER);
  is = Math.max(width / img.width, height / img.height);
  pop();

  return is;
}
