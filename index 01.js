document.addEventListener("DOMContentLoaded", () => {
  showHomePage(); 
});

import { mapRawCocktailData } from './utilities.js';

const navLinks = document.querySelectorAll('.nav-link');
const content = document.querySelector('#content');

navLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target.getAttribute('data-target');
    if (target === 'home') showHomePage();
    if (target === 'search') showSearchPage();
    if (target === 'favorites') showFavoritesPage();
  });
});


async function fetchRandomCocktail() {
  const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
  const data = await response.json();
  return mapRawCocktailData(data.drinks[0]);
}

async function showHomePage() {
  const cocktail = await fetchRandomCocktail(); 
  content.innerHTML = `
    <div class="card">
      <h2>${cocktail.name}</h2>
      <img src="${cocktail.thumbnail}" alt="${cocktail.name}">
      <button id="new-cocktail-btn">New Cocktail</button>
      <button id="details-btn" data-id="${cocktail.id}">See Details</button>
      <button id="favorite-btn" data-id="${cocktail.id}">Add to Favorites</button>
    </div>
  `;

  document.querySelector('#new-cocktail-btn').addEventListener('click', showHomePage);
  document.querySelector('#details-btn').addEventListener('click', () => showDetailsPage(cocktail.id));
  document.querySelector('#favorite-btn').addEventListener('click', () => addFavorite(cocktail)); // favorites button

}

function showSearchPage() {
  content.innerHTML = `
    <div class="search-container">
      <input type="text" id="search-input" placeholder="Search cocktails...">
      <button id="search-btn">Search</button>
    </div>
    <div id="search-results"></div>
  `;

  document.querySelector('#search-btn').addEventListener('click', async () => {
    const query = document.querySelector('#search-input').value.trim();

    if(!query){
      alert("Please fill in the field.");
      return;
    }

    const results = await searchCocktails(query);
    displaySearchResults(results);
  });
}

async function searchCocktails(query) {
  const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await response.json();
  return data.drinks.map(mapRawCocktailData);
}

function displaySearchResults(results) {
  const resultsContainer = document.querySelector('#search-results');
  resultsContainer.innerHTML = results.map(cocktail => `
    <div class="card">
      <h3>${cocktail.name}</h3>
      <img src="${cocktail.thumbnail}" alt="${cocktail.name}"></img>
      <button class="details-btn" data-id="${cocktail.id}">See Details</button>
      <button class="favorite-btn" data-id="${cocktail.id}">Add to Favorites</button>

    </div>
  `).join('');

  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      showDetailsPage(id);
    });
  });

//
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      const cocktail = results.find(c => c.id === id);
      if (cocktail) {
        addFavorite(cocktail);
      }
    });
  });

}

async function showDetailsPage(id) {
  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const cocktail = mapRawCocktailData(data.drinks[0]);

    content.innerHTML = `
      <div class="card">
        <h2>${cocktail.name}</h2>
        <img src="${cocktail.thumbnail}" alt="${cocktail.name}">
        <p><strong>Category:</strong> ${cocktail.category}</p>
        <p><strong>Tags:</strong> ${cocktail.tags.join(', ') || 'N/A'}</p>
        <p><strong>Glass:</strong> ${cocktail.glass}</p>
        <p><strong>Instructions:</strong> ${cocktail.instructions}</p>
        <ul>
          ${cocktail.ingredients.map(ing => `<li>${ing.measure || ''} ${ing.ingredient}</li>`).join('')}
        </ul>
        <button id="back-home">Back to Home</button>
        <button id="favorite-btn" data-id="${cocktail.id}">Add to Favorites</button> 

      </div>
    `;

    const backHomeButton = document.querySelector("#back-home");
    if (backHomeButton) {
      backHomeButton.addEventListener("click", showHomePage);
    }

    const favoriteButton = document.querySelector("#favorite-btn");
    if (favoriteButton) {
      favoriteButton.addEventListener("click", () => {
        addFavorite(cocktail);
        alert(`${cocktail.name} has been added to your favorites!`);
      });
    }

  } catch (error) {
    // console.error("Error fetching:", error);
    content.innerHTML = `<p>Error fetching.</p>`;
  }
}

function showFavoritesPage() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  content.innerHTML = favorites.length > 0
    ? favorites.map(cocktail => `
      <div class="card">
        <h3>${cocktail.name}</h3>
        <img class="favorite-img" src="${cocktail.thumbnail}" alt="${cocktail.name}"></img>
        <button class="details-btn" data-id="${cocktail.id}">See Details</button>
        <button class="remove-btn" data-id="${cocktail.id}">Remove</button>
      </div>
    `).join('')
    : '<p>No favorites added.</p>';

  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      showDetailsPage(id);
    });
  });
  
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      removeFavorite(id);
      showFavoritesPage();
    });
  });
}

function addFavorite(cocktail) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(fav => fav.id === cocktail.id)) {
    favorites.push(cocktail);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${cocktail.name} added to favorites!`);
  }else {
    alert(`${cocktail.name} is already in favorites.`);
  }
}

function removeFavorite(id) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const updatedFavorites = favorites.filter(fav => fav.id !== id);

  localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  alert('Removed from favorites.');
}