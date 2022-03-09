"use strict";

let inputWarning = document.querySelector(".input_warning");
let inputHeader = document.getElementById("user_input_alert");

let getInputValue = function () {
  inputWarning.classList.add("hidden");
  let user_input = document.querySelector(".user_input").value;

  if (!user_input) {
    inputWarning.classList.remove("hidden");
    return 1;
  }

  document.querySelector(".user_input").value = "";
  clearCards();
  call(user_input);
};

function call(query) {
  let path = `https://mysterious-meadow-39267.herokuapp.com/http://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${query}`;

  let idpath = `https://mysterious-meadow-39267.herokuapp.com/http://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${17180}`;

  axios.get(path).then(
    (response) => {
      // console.log(path);
      let result = response.data;
      if (!result) {
        inputHeader.textContent = `You loaded '${query}'–there are no cocktails matching this input. Please load a different ingredient.`;
        return 1;
      }
      inputHeader.textContent = `You loaded ${query}, see your roulette..blah.`;
      // console.log(result);
      dataCards(result.drinks);
    },
    (error) => {
      console.log(error);
    }
  );
}

function dataCards(data) {
  // Copy of drinks array data
  let drinksArray = data;
  let resultsArray = [];
  let rouletteIndex = random(drinksArray);
  let rouletteResult = drinksArray[rouletteIndex];
  // Remove roulette result from drinksArray so it's not copied in the result cards array
  drinksArray.splice(rouletteIndex, 1);
  generateRouletteCard(rouletteResult);

  if (drinksArray.length < 6) {
    shuffle(drinksArray);
  } else if (drinksArray.length >= 6) {
    pullRandom(drinksArray, resultsArray);
  } else {
    return "Error: func dataCards() | drinksArray.length";
  }

  console.log("RouletteResult: ", rouletteResult);
  console.log("ResultsArray:", resultsArray);
}

function random(array) {
  return Math.floor(Math.random() * array.length);
}

// Fisher-Yates Shuffle
// Because arrays are reference types, this will edit drinksArray as desired
function shuffle(array) {
  let counterIndex = array.length;
  let randomIndex;

  // Decreasing count. While there are still elements to shuffle:
  while (counterIndex != 0) {
    // Pick a remaining element by index (recall counterIndex is just array.length decreasing by 1 each iteration)
    randomIndex = Math.floor(Math.random() * counterIndex);
    counterIndex--;
    // Swap random element with current counter element in array (es6 destructuring syntax for the swap)
    [array[counterIndex], array[randomIndex]] = [
      array[randomIndex],
      array[counterIndex],
    ];
  }
  generateCards(array);
}

// Because arrays are reference types, this will edit both source arrays as desired
function pullRandom(drinksArray, resultsArray) {
  let counter = 0;

  while (counter < 6) {
    let newCardIndex = random(drinksArray);
    let newCardResult = drinksArray[newCardIndex];
    resultsArray.push(newCardResult);
    drinksArray.splice(newCardIndex, 1);
    counter++;
  }
  generateCards(resultsArray);
}

function clearCards() {
  let image = document.getElementById("roulette-img");
  if (image) {
    document.getElementById("roulette-card").removeChild(image);
  }
  let images = document.getElementsByClassName("other-imgs");
  if (images) {
    while (images.length > 0) {
      document.getElementById("other-cards").removeChild(images[0]);
    }
  }
}

function generateRouletteCard(result) {
  let image = new Image(300);
  image.src = result.strDrinkThumb;
  image.id = "roulette-img";
  document.getElementById("roulette-card").appendChild(image);
}

function generateCards(results) {
  for (let i = 0; i < results.length; i++) {
    let image = new Image(300);
    image.src = results[i].strDrinkThumb;
    image.className = "other-imgs";
    document.getElementById("other-cards").appendChild(image);
  }
}
