"use strict";

// Warm up heroku path, so lag time for first user entry result is negated
document.addEventListener("DOMContentLoaded", () => {
  let path = `https://mysterious-meadow-39267.herokuapp.com/http://www.thecocktaildb.com/api/json/v1/1/filter.php?i=gin`;

  axios.get(path).then(
    (response) => {
      console.log("Just warming up heroku path ʕ•ᴥ•ʔ");
    },
    (error) => {
      console.log(error);
    }
  );
});

let inputWarning = document.querySelector(".input_warning");
let inputHeader = document.getElementById("user_input_alert");
let input = document.getElementById("user_input");

input.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("shoot").click();
    document.getElementById("user_input").blur();
  }
});

let getInputValue = function () {
  clearCards();
  inputWarning.classList.add("hidden");
  inputHeader.classList.add("hidden");

  let user_input = document.querySelector("#user_input").value;

  if (!user_input) {
    inputWarning.classList.remove("hidden");
    return 1;
  }

  document.querySelector("#user_input").value = "";
  callQuery(user_input);
};

// Clearing DOM of previous query results
function clearCards() {
  let image = document.getElementById("roulette-img");
  if (image) {
    document.getElementById("roulette-img-frame").removeChild(image);
  }
  let otherCards = document.getElementsByClassName("card-container");
  if (otherCards) {
    while (otherCards.length > 0) {
      document.getElementById("other-cards").removeChild(otherCards[0]);
    }
  }
  document.getElementById("roulette-recipe-title").textContent = "";
  document.getElementById("roulette-recipe-glass").textContent = "";
  document.getElementById("update-roulette-table").replaceChildren();
  document.getElementById("roulette-result").classList.add("hidden");
  document.getElementById("section-h4").classList.add("hidden");
}

// Initial API call based on user input
function callQuery(query) {
  let path = `https://mysterious-meadow-39267.herokuapp.com/http://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${query}`;

  axios.get(path).then(
    (response) => {
      let result = response.data;
      if (!result) {
        inputHeader.classList.remove("hidden");
        inputHeader.textContent = `You loaded '${query}'–there are no cocktails matching this input. Please load a different ingredient.`;
        return 1;
      }
      inputHeader.classList.remove("hidden");
      inputHeader.textContent = `You loaded '${query}', tonight you'll be drinking...`;
      document.getElementById("roulette-result").classList.remove("hidden");
      document.getElementById("section-h4").classList.remove("hidden");

      // console.log(result);
      imageCards(result.drinks);
    },
    (error) => {
      console.log(error);
    }
  );
}

// Data management from initial API call (callQuery)
function imageCards(data) {
  // Shallow copy of drinks array data
  let drinksArray = data;
  let resultsArray = [];
  let rouletteIndex = random(drinksArray);
  let rouletteResult = drinksArray[rouletteIndex];
  // Removing roulette result from drinksArray so it's not copied in the "other cards" results array
  drinksArray.splice(rouletteIndex, 1);
  generateRouletteImage(rouletteResult);

  // Quantity of drinks returned by api varies: shuffling few results or
  // pulling random drinks for "other cards" results
  if (drinksArray.length < 6) {
    shuffle(drinksArray);
  } else if (drinksArray.length >= 6) {
    pullRandom(drinksArray, resultsArray);
  } else {
    return "Error: func imageCards() | drinksArray.length";
  }

  // console.log("RouletteResult: ", rouletteResult);
  // console.log("ResultsArray:", resultsArray);
}

// Returns random result from array
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
  generateOtherImagesAndCards(array);
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
  generateOtherImagesAndCards(resultsArray);
}

// Async api call to get recipe details about each drink (using the id # of each drink)
async function callById(result, usage, htmlIndex) {
  let idpath = `https://mysterious-meadow-39267.herokuapp.com/http://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${result.idDrink}`;

  await axios.get(idpath).then(
    (response) => {
      let data = [...response.data.drinks];
      recipeCards(data, usage, htmlIndex);
      return data;
    },
    (error) => {
      console.log(error);
    }
  );
}

// Data management of drink details from secondary API call (callById)
// Recipe array created, ingredient and measurement data pushed in
function recipeCards(data, usage, htmlIndex) {
  let drinkData = {};
  let recipe = [];
  let ingredientCount = 1;
  let measurementCount = 1;
  let i = 0;

  for (let property of Object.entries(data[0])) {
    if (property[1]) {
      drinkData[property[0]] = property[1].toLowerCase();

      if (property[0] === `strIngredient${ingredientCount}`) {
        recipe.push([property[1].toLowerCase()]);
        ingredientCount++;
      }
      if (property[0] === `strMeasure${measurementCount}`) {
        recipe[i].push(property[1].toLowerCase());
        measurementCount++;
        i++;
      }
      if (property[0] === `strGlass`) {
        /[aeiou]/i.test(property[1][0])
          ? (drinkData.strGlass = "an " + property[1].toLowerCase())
          : (drinkData.strGlass = "a " + property[1].toLowerCase());
      }
    }
  }
  // console.log(drinkData);
  drinkData["recipe"] = recipe;

  usage === "roulette"
    ? generateRouletteCaption(drinkData)
    : generateOtherCaptions(drinkData, htmlIndex);
}

// DOM manipulation: create table elements to display recipe
// Data used: recipe array created in recipeCards()
function generateRecipe(recipe, htmlIndex) {
  recipe.forEach((el, i, arr) => {
    // console.log("For each: ", el);
    let newRow = document.createElement("tr");
    newRow.id = `recipeList${i + 1}`;
    let rowMeasurement = document.createElement("th");
    rowMeasurement.id = `listMeasurement${i + 1}`;
    rowMeasurement.textContent = el[1];
    let rowIngredient = document.createElement("td");
    rowIngredient.id = `listIngredient${i + 1}`;
    rowIngredient.textContent = el[0];

    document.getElementById(htmlIndex).appendChild(newRow);
    newRow.appendChild(rowMeasurement);
    newRow.appendChild(rowIngredient);
  });
}

// DOM manipulation: display "roulette" result image
function generateRouletteImage(result) {
  let image = new Image(300);
  image.src = result.strDrinkThumb;
  image.id = "roulette-img";

  let frame = document.getElementById("roulette-img-frame");
  frame.appendChild(image);

  callById(result, "roulette");
}

// DOM manipulation: display "roulette" result caption headers
function generateRouletteCaption(data) {
  document.getElementById(
    "roulette-recipe-title"
  ).textContent = `${data.strDrink}`;
  document.getElementById(
    "roulette-recipe-glass"
  ).textContent = `Serve in ${data.strGlass}.`;

  generateRecipe(data.recipe, "update-roulette-table");
}

// DOM manipulation: Loop through "other cards" results array to display images/create card elements
function generateOtherImagesAndCards(results) {
  for (let i = 0; i < results.length; i++) {
    let cardContainer = document.createElement("div");
    // Add index identifier as last character of id name
    cardContainer.id = `card-container-${i + 1}`;
    cardContainer.className = "o-grid-item card-container";

    cardContainer.addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        // Read id of "clicked" DOM element
        // Grab the last character, this is the index + 1 you need to search results[index] by
        // let divId = this.id.slice(-1);
        // callById(results[divId - 1], "other", this.id);
      },
      false
    );
    document.getElementById("other-cards").appendChild(cardContainer);

    let innerCard = document.createElement("div");
    innerCard.className = "flip-card-inner";
    cardContainer.appendChild(innerCard);

    let imageSide = document.createElement("div");
    imageSide.className = "flip-card-front";
    innerCard.appendChild(imageSide);

    let image = new Image(300);
    image.src = results[i].strDrinkThumb;
    // Add index identifier as last character of id name
    image.id = `other-img-${i + 1}`;
    image.className = "other-imgs";
    imageSide.appendChild(image);

    let captionSide = document.createElement("div");
    // Add index identifier as last character of id name
    captionSide.id = `other-caption-${i + 1}`;
    captionSide.className = "flip-card-back other-captions";
    innerCard.appendChild(captionSide);

    let drinkTitle = document.createElement("h4");
    drinkTitle.id = `other-title-${i + 1}`;
    captionSide.appendChild(drinkTitle);

    let table = document.createElement("table");
    table.id = `other-recipe-${i + 1}`;
    captionSide.appendChild(table);

    let tb = document.createElement("tbody");
    tb.id = `update-other-table-${i + 1}`;
    table.appendChild(tb);

    let drinkGlass = document.createElement("p");
    drinkGlass.id = `other-glass-${i + 1}`;
    captionSide.appendChild(drinkGlass);

    callById(results[i], "other", i + 1);
  }
}

function generateOtherCaptions(data, htmlIndex) {
  let i = htmlIndex;
  document.getElementById(`other-title-${i}`).textContent = `${data.strDrink}`;
  document.getElementById(
    `other-glass-${i}`
  ).textContent = `Serve in ${data.strGlass}.`;

  generateRecipe(data.recipe, `update-other-table-${i}`);
}
