# Guided Cooking App - Design Outline

This document provides a detailed outline of the currently implemented features and their design considerations within the Guided Cooking App, based on the project's development log.

## I. Core Application Structure & Navigation

**Purpose:** To provide a seamless and intuitive way for users to navigate through the application and access its core functionalities.

**Implemented Features:**

-   **Enhanced Navigation:**
    -   A dedicated `/favorites` route has been added to allow users to view their favorite recipes.
    -   `client/src/components/Navbar.js` has been updated to include direct `Link` components for intuitive navigation to "Home", "Favorites", "Add Recipe", "Shopping List", and "Pantry".
    -   `client/src/components/RecipeList.js` has been refactored to conditionally display either all recipes or only favorited recipes based on a `favoritesOnly` prop passed via routes.
    -   A "Home" button has been added to `client/src/components/RecipeDetail.js` for easy navigation back to the main recipe list.
-   **Data Fetching:** Integrated `@tanstack/react-query` for efficient data fetching and caching.

## II. Recipe Search & Discovery

**Purpose:** To enable users to efficiently find recipes based on various criteria.

**Implemented Features:**

-   **Recipe List Display (Landing Page):**
    -   The `fetchRecipes` function in `client/src/components/RecipeList.js` has been modified to display a broad selection of recipes on the landing page when no search query or filters are active. This combines local recipes with general search results fetched from the Spoonacular API.
-   **Search Filters:**
    -   "Cuisine" and "Diet" dropdown filters have been implemented within `client/src/components/Navbar.js`.
    -   An "Intolerances" dropdown filter has also been added to `client/src/components/Navbar.js`.
    -   `client/src/components/RecipeList.js` manages the state for these filters and passes them as parameters to the `fetchRecipes` function.
    -   The backend `server.js` has been modified to handle `cuisine`, `diet`, and `intolerances` query parameters when making requests to the Spoonacular API.
    -   The search bar correctly displays the selected cuisine, indicating proper integration of the filter functionality.

## III. Recipe Detail View

**Purpose:** To provide comprehensive information about a selected recipe and enable various interactions.

**Implemented Features:**

-   **Nutritional Information Display:**
    -   A new `fetchNutritionDetails` function and `useQuery` hook have been added to `client/src/components/RecipeDetail.js` to fetch nutrition data for a specific recipe.
    -   A new endpoint, `/api/recipe/:id/nutrition`, has been implemented in `server.js` to proxy requests to Spoonacular's nutrition widget API, ensuring secure API key handling.
    -   A dedicated "Nutritional Information" section has been integrated into `client/src/components/RecipeDetail.js` to display the fetched nutritional data.
-   **Customizable Ingredient Quantities (Unit Conversion):**
    -   `unitSystem` state (either `'metric'` or `'imperial'`) and a `handleUnitSystemChange` function have been added to `client/src/components/RecipeDetail.js`.
    -   The `getAdjustedQuantity` function in `client/src/components/RecipeDetail.js` performs basic conversions between grams/pounds and milliliters/cups based on the selected unit system.
    -   A unit system toggle (implemented as a select dropdown) has been added to the `RecipeDetail` page, allowing users to switch between unit systems.
    -   The `handleAddIngredientsToShoppingList` function has been updated to use the currently selected `unitSystem` for ingredient quantities when adding items to the shopping list.
-   **Personalized Input for Recipe Customization:**
    -   **Custom Notes:**
        -   `customNotes` state and `useEffect` hooks have been implemented in `client/src/components/RecipeDetail.js` to load and save user-specific notes from/to local storage, ensuring persistence across sessions.
        -   A textarea component for custom notes has been integrated directly into the `RecipeDetail` component.
    -   **Ingredient Substitution:**
        -   `showSubstituteModal` and `selectedIngredient` states have been added to `client/src/components/RecipeDetail.js` to manage the display and content of the substitution modal.
        -   A `fetchSubstitutes` function and `useQuery` hook have been implemented to fetch ingredient substitution data from the Spoonacular API.
        -   A new endpoint, `/api/ingredient-substitutes`, has been added to `server.js` to proxy requests to Spoonacular's ingredient substitutes API.
        -   A "Substitute" button has been added next to each ingredient in `client/src/components/RecipeDetail.js` to trigger a modal displaying available substitution options.
-   **Guided Cooking Mode (Visual Aids):**
    -   The frontend (`client/src/components/RecipeDetail.js`) is structured to display images for ingredients and equipment within instruction steps, provided this data is available in the `analyzedInstructions` from the Spoonacular API.

## IV. Shopping List Functionality

**Purpose:** To help users organize ingredients needed for recipes.

**Implemented Features:**

-   `client/src/components/ShoppingList.js` and its corresponding CSS module `ShoppingList.module.css` have been created to manage the shopping list.
-   A `/shopping-list` route has been added in `client/src/App.js`, and a corresponding link has been included in `client/src/components/Navbar.js` for easy access.
-   The `handleAddIngredientsToShoppingList` function in `client/src/components/RecipeDetail.js` has been implemented to add recipe ingredients to a shopping list stored in local storage.

## V. Pantry Mode

**Purpose:** To allow users to keep track of ingredients they already have.

**Implemented Features:**

-   `client/src/components/Pantry.js` and its corresponding CSS module `Pantry.module.css` have been created for users to manage a list of available ingredients.
-   A `/pantry` route has been added in `client/src/App.js`, and a link to it has been included in `client/src/components/Navbar.js`.

## VI. Design Enhancements (Detailed Log)

**Purpose:** To outline the visual and interactive design elements that have been implemented.

**Implemented Enhancements:**

-   **Global Font:** The application's global font has been switched to Inter.
-   **Navbar:**
    -   The layout is now fixed at the top of the viewport with a semi-transparent glassmorphism background.
    -   The Logo/Title features bold typography and a subtle scale animation on hover.
    -   Navigation links have a minimalist underline animation on hover, and active links are highlighted with bold text and a soft drop shadow.
    -   The search bar is rounded, expands on focus, and includes a magnifying glass icon.
    -   The dark mode toggle button now includes sun/moon icons for visual clarity.
    -   Filter dropdowns (`select` elements) have rounded corners and transition effects.
-   **Recipe Cards (`RecipeList.js`):**
    -   A responsive grid layout has been implemented for displaying recipe cards.
    -   A glassmorphism effect with subtle border highlights has been applied to the cards.
    -   Cards feature a gentle elevation hover effect.
    -   A skeleton shimmer effect is implemented for the loading state of recipe cards.
-   **Active Filter Chips (`RecipeList.js`):**
    -   Active filter values (search query, cuisine, diet, intolerances) are displayed as clickable chips below the Navbar.
    -   Each chip includes a remove button (`&times;`) to clear the corresponding filter.
-   **Recipe Header (`RecipeDetail.js`):**
    -   A hero image with a subtle parallax effect is achieved using `useScroll` and `useTransform` from Framer Motion.
    -   The title overlay has a semi-transparent glassmorphism effect.
    -   The prep time badge features a neumorphic design.
-   **Action Buttons (`RecipeDetail.js`):**
    -   The Favorite button includes a bounce animation on tap.
    -   Edit and Delete buttons have scale and tap animations.

## VII. Backend Updates

**Purpose:** To reflect the changes made to the backend server.

**Implemented Features:**

-   **Database Migration:** Migrated from file-based storage (`recipes.json`) to an SQLite database using Sequelize ORM.
-   **API Key Handling:** Added a warning if `SPOONACULAR_API_KEY` is missing in the `.env` file.
-   **Improved Error Handling:** Standardized API error responses to return JSON objects with a `message` property.
-   **Dependency Updates:** Updated `dotenv` and `express` to their latest versions.
-   **Removed Redundancy:** Removed the unused `node-fetch` dependency.