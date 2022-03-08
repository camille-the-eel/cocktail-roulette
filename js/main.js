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
  let counter = 0;
  let rouletteIndex = randomize(drinksArray);
  let rouletteResult = drinksArray[rouletteIndex];
  // Remove roulette result from drinksArray
  drinksArray.splice(rouletteIndex, 1);

  while (counter < 6) {
    let newCardIndex = randomize(drinksArray);
    let newCardResult = drinksArray[newCardIndex];
    resultsArray.push(newCardResult);
    drinksArray.splice(newCardIndex, 1);
    counter++;
  }
  console.log("Done", resultsArray);
}

function randomize(array) {
  return Math.floor(Math.random() * array.length);
}
