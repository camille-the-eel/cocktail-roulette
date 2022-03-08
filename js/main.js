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
  call(user_input);
};

function call(query) {
  let path = `https://mysterious-meadow-39267.herokuapp.com/http://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${query}`;

  let idpath = `https://mysterious-meadow-39267.herokuapp.com/http://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${17180}`;

  axios.get(path).then(
    (response) => {
      console.log(path);
      let result = response.data;
      if (!result) {
        inputHeader.textContent = `You loaded '${query}'–there are no cocktails matching this input. Please load a different ingredient.`;
        return 1;
      }
      inputHeader.textContent = `You loaded ${query}, see your roulette..blah.`;
      console.log(result);
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
  // Remove roulette result from drinksArray
  drinksArray.splice(rouletteIndex, 1);

  if (drinksArray.length < 6) {
    shuffle(drinksArray);
  } else if (drinksArray.length >= 6) {
    let counter = 0;

    while (counter < 6) {
      let newCardIndex = random(drinksArray);
      let newCardResult = drinksArray[newCardIndex];
      resultsArray.push(newCardResult);
      drinksArray.splice(newCardIndex, 1);
      counter++;
    }
    // console.log("Done", resultsArray);
  } else {
    return "Error: func dataCards() | drinksArray.length";
  }
}

// Because arrays are reference types, this will edit drinksArray as desired
function random(array) {
  return Math.floor(Math.random() * array.length);
}

function shuffle(array) {
  let lastIndex = array.length;
  let randomIndex;

  // Decreasing count. While there are still elements to shuffle:
  while (lastIndex != 0) {
    // Pick a remaining element by index
    randomIndex = Math.floor(Math.random() * lastIndex);
    lastIndex--;
    // Swap random element with last element in array (es6 destructuring syntax for the swap)
    [array[lastIndex], array[randomIndex]] = [
      array[randomIndex],
      array[lastIndex],
    ];
  }
}
