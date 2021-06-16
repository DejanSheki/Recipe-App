const meals = document.getElementById('meals');
const favContainer = document.querySelector('.fav-meals');
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');

getRandomMeal();
fetchFavoriteMeal();

async function getRandomMeal() {
    const dataFetch = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await dataFetch.json();
    const randomMeal = data.meals[0];

    loadMeal(randomMeal, true);
}

async function getMealById(id) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    const responseData = await response.json();
    const meal = responseData.meals[0];

    return meal;
}


async function getMealBySearch(term) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);

    const responseData = await response.json();
    const meal = responseData.meals;

    console.log(meal);
    return meal;
}

function loadMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
    <div class="front">
        <div class="meal-header">
        ${random ? '<span class="random">Random recipe</span>' : ''}
        <img src="${mealData.strMealThumb}" 
            alt="${mealData.strMeal}" />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <div>
                <button class="fav-btn">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="rotate-btn">Recipe</button>
            </div>
        </div>
    </div>
    <div class="recipe">
        <h3>${mealData.strMeal}</h3>
        <p>${mealData.strInstructions}</p> 
        <button class="rotate-btn">Back</button>
    </div>
    `;

    const favBtn = meal.querySelector('.fav-btn');
    const rotateBtn = meal.querySelectorAll('.rotate-btn');

    favBtn.addEventListener('click', () => {
        if (favBtn.classList.contains('active')) {
            removeMealsFromLS(mealData.idMeal);
            favBtn.classList.remove('active');
        } else {
            addMealToLS(mealData.idMeal);
            favBtn.classList.add('active');
        }
        fetchFavoriteMeal();
    });
    rotateBtn.forEach(btn => {
        btn.addEventListener('click', () => {
            toggle();
        });
    })

    function toggle() {
        meal.classList.toggle('rotate');
    }

    meals.appendChild(meal);
}

function addMealToLS(mealId) {
    const mealIds = getMealFromLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function getMealFromLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

function removeMealsFromLS(mealId) {
    const mealIds = getMealFromLS();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

function clear() {
    meals.innerHTML = "";
    searchTerm.value = "";
}

async function fetchFavoriteMeal() {
    favContainer.innerHTML = '';

    const mealIds = getMealFromLS();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];

        meal = await getMealById(mealId);
        addMealToFavorite(meal);
    }

}

function addMealToFavorite(mealData) {
    const favoriteMeal = document.createElement('li');

    favoriteMeal.innerHTML = `
        <button class="remove"><i class="fas fa-times"></i></button>
        <img class="fav-img" src="${mealData.strMealThumb}" 
        alt="${mealData.strMeal}" />
        <span>${mealData.strMeal}</span>
    `;

    const removeBtn = favoriteMeal.querySelector('.remove');
    removeBtn.addEventListener('click', () => {
        removeMealsFromLS(mealData.idMeal);

        fetchFavoriteMeal();
    })

    favoriteMeal.addEventListener('click', () => {
        clear();
        loadMeal(mealData);
    });
    favContainer.appendChild(favoriteMeal);
}

searchBtn.addEventListener('click', async () => {
    const search = searchTerm.value;
    await getMealBySearch(search);
    clear();

    const meals = await getMealBySearch(search);

    if (meals) {
        meals.forEach(meal => {
            loadMeal(meal)
        });
    }
});