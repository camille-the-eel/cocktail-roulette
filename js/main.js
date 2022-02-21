"use strict";

let inputWarning = document.querySelector(".input_warning");
let inputHeader = document.getElementById("user_input_alert");

let getInputValue = function () {
  inputWarning.classList.add("hidden");
  let user_input = document.querySelector(".user_input").value;

  if (!user_input) {
    inputWarning.classList.remove("hidden");
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

// destructure arg?
function dataCards(data) {
  let random = Math.floor(Math.random() * data.length);

  console.log(random, data.length);
}
