document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://www.themealdb.com/api/json/v1/1/categories.php';
    const FILTER_API_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=';
    const SEARCH_API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
    const LOOKUP_API_URL = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';

    // DOM Elements
    const gridElement = document.getElementById('categories-grid');
    const dishesGrid = document.getElementById('dishes-grid');
    const loaderElement = document.getElementById('loader');
    const backBtn = document.getElementById('back-btn');
    const mainTitle = document.getElementById('main-title');
    const mainSubtitle = document.getElementById('main-subtitle');

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    const modal = document.getElementById('meal-modal');
    const closeModal = document.getElementById('close-modal');
    const modalBody = document.getElementById('meal-details-body');

    let allCategories = [];

    function fetchCategories() {
        loaderElement.style.display = 'flex';
        gridElement.classList.add('hidden');
        dishesGrid.classList.add('hidden');

        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                allCategories = data.categories;
                setTimeout(() => {
                    displayCategories(allCategories);
                }, 500);
            })
            .catch(err => {
                console.error(err);
                showError("Failed to load categories.");
            });
    }

    function displayCategories(categories) {
        loaderElement.style.display = 'none';
        gridElement.classList.remove('hidden');
        gridElement.innerHTML = '';

        categories.forEach((category, index) => {
            const card = document.createElement('div');
            card.classList.add('category-card', 'animate-up');
            card.style.animationDelay = `${index * 0.05}s`;

            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${category.strCategoryThumb}" alt="${category.strCategory}" class="category-image" loading="lazy">
                </div>
                <h3 class="category-title">${category.strCategory}</h3>
                <p class="category-description" title="${category.strCategoryDescription}">
                    ${category.strCategoryDescription}
                </p>
                <button class="explore-btn" data-category="${category.strCategory}">Explore ${category.strCategory}</button>
            `;

            gridElement.appendChild(card);
        });

        document.querySelectorAll('.explore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const catName = e.target.getAttribute('data-category');
                fetchDishes(catName);
            });
        });
    }

    function fetchDishes(categoryName) {
        gridElement.classList.add('hidden');
        dishesGrid.classList.add('hidden');
        backBtn.classList.add('hidden');
        loaderElement.style.display = 'flex';

        mainTitle.textContent = `${categoryName} Menu`;
        mainSubtitle.textContent = `Select a dish to view its recipe`;

        fetch(FILTER_API_URL + categoryName)
            .then(res => res.json())
            .then(data => {
                setTimeout(() => {
                    displayDishes(data.meals);
                }, 500);
            })
            .catch(err => showError("Failed to load dishes."));
    }


    function searchMeals(query) {
        if (!query.trim()) return;

        gridElement.classList.add('hidden');
        dishesGrid.classList.add('hidden');
        backBtn.classList.add('hidden');
        loaderElement.style.display = 'flex';

        mainTitle.textContent = `Search Results`;
        mainSubtitle.textContent = `Showing recipes for "${query}"`;

        fetch(SEARCH_API_URL + query)
            .then(res => res.json())
            .then(data => {
                setTimeout(() => {
                    displayDishes(data.meals);
                }, 500);
            })
            .catch(err => showError("Failed to search."));
    }

    function displayDishes(dishes) {
        loaderElement.style.display = 'none';
        dishesGrid.classList.remove('hidden');
        backBtn.classList.remove('hidden');
        dishesGrid.innerHTML = '';

        if (!dishes) {
            dishesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No dishes found. Try another search.</div>`;
            return;
        }

        dishes.forEach((dish, index) => {
            const card = document.createElement('div');
            card.classList.add('category-card', 'dish-card', 'animate-up');
            card.style.animationDelay = `${(index % 10) * 0.05}s`;

            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${dish.strMealThumb}" alt="${dish.strMeal}" class="category-image" loading="lazy">
                </div>
                <h3 class="category-title" style="font-size: 1.25rem;">${dish.strMeal}</h3>
            `;

            card.addEventListener('click', () => {
                fetchMealDetails(dish.idMeal);
            });

            dishesGrid.appendChild(card);
        });
    }


    function fetchMealDetails(id) {
        fetch(LOOKUP_API_URL + id)
            .then(res => res.json())
            .then(data => {
                if (data.meals && data.meals.length > 0) {
                    showMealDetails(data.meals[0]);
                }
            })
            .catch(err => console.error(err));
    }

    function showMealDetails(meal) {
        let ingredientsHTML = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredientsHTML += `<li><strong>${ingredient}</strong>: ${measure}</li>`;
            }
        }

        modalBody.innerHTML = `
            <div class="meal-detail-grid">
                <div>
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-detail-img">
                </div>
                <div class="meal-detail-info">
                    <h2>${meal.strMeal}</h2>
                    <div class="meal-tags">
                        ${meal.strCategory ? `<span class="tag">${meal.strCategory}</span>` : ''}
                        ${meal.strArea ? `<span class="tag">${meal.strArea}</span>` : ''}
                        ${meal.strTags ? meal.strTags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') : ''}
                    </div>
                    <h3>Instructions</h3>
                    <div class="meal-instructions">${meal.strInstructions}</div>
                    
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredientsHTML}
                    </ul>
                    
                    ${meal.strYoutube ? `
                    <div style="margin-top: 1.5rem;">
                        <a href="${meal.strYoutube}" target="_blank" class="explore-btn" style="display: inline-block; text-decoration: none; text-align: center; width: auto;">Watch Recipe Video</a>
                    </div>` : ''}
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }


    searchBtn.addEventListener('click', () => searchMeals(searchInput.value));

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMeals(searchInput.value);
    });


    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (!gridElement.classList.contains('hidden')) {
            if (query === '') {
                displayCategories(allCategories);
            } else {
                const filtered = allCategories.filter(cat =>
                    cat.strCategory.toLowerCase().includes(query)
                );
                displayCategories(filtered);
            }
        }
    });

    backBtn.addEventListener('click', () => {
        dishesGrid.classList.add('hidden');
        backBtn.classList.add('hidden');
        loaderElement.style.display = 'none';

        mainTitle.textContent = "Explore Categories";
        mainSubtitle.textContent = "Discover a world of flavors and culinary delights";
        searchInput.value = '';

        gridElement.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });

    function showError(message) {
        loaderElement.style.display = 'none';
        gridElement.classList.remove('hidden');
        gridElement.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 2rem;">${message}</div>`;
    }

    fetchCategories();
});
