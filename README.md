# Guided Cooking App

## Table of Contents
1.  [Introduction](#1-introduction)
2.  [Features](#2-features)
    *   [Core Features](#core-features)
    *   [New Feature: Meal Planning](#new-feature-meal-planning)
3.  [Tech Stack](#3-tech-stack)
4.  [Getting Started](#4-getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Running the Application](#running-the-application)
    *   [Spoonacular API Key Setup](#spoonacular-api-key-setup)
5.  [Project Structure](#5-project-structure)
6.  [Design Principles & Refinements](#6-design-principles--refinements)
    *   [General Design Guidelines](#general-design-guidelines)
    *   [Implemented Design Improvements](#implemented-design-improvements)
7.  [Backend Details](#7-backend-details)
    *   [Database](#database)
    *   [API Endpoints](#api-endpoints)
    *   [Testing](#testing)
8.  [Frontend Details](#8-frontend-details)
    *   [Routing](#routing)
    *   [State Management & Data Fetching](#state-management--data-fetching)
    *   [Styling](#styling)
    *   [Components Overview](#components-overview)
9.  [Development History & Context](#9-development-history--context)
10. [Outstanding Issues & Next Steps](#10-outstanding-issues--next-steps)

---

## 1. Introduction
The Guided Cooking App is a web application designed to enhance the home cooking experience. It allows users to discover new recipes, manage their pantry, generate shopping lists, and follow step-by-step cooking instructions with integrated timers. The application aims to provide a seamless and intuitive user experience with a modern, minimalist design.

## 2. Features

### Core Features
*   **Recipe Discovery:** Users can search for recipes using keywords and apply filters such as cuisine, diet, and intolerances. Recipes are fetched from both a local database and the Spoonacular API.
*   **Recipe Details:** Comprehensive information for each recipe, including ingredients, detailed instructions, nutritional data (fetched from Spoonacular), and customizable serving sizes with unit conversion.
*   **Pantry Management:** Users can maintain a list of ingredients they have on hand.
*   **Shopping List Generation:** Automatically generates a consolidated shopping list based on planned meals, aggregating ingredients and units.
*   **Guided Cooking Mode:** Provides a step-by-step cooking experience with progress tracking and integrated timers.
*   **Favorites:** Users can save their favorite recipes for quick access.
*   **Custom Notes:** Ability to add personal notes to any recipe, persisted locally.
*   **Ingredient Substitution:** Suggests alternative ingredients for recipes, powered by the Spoonacular API.
*   **Local Recipe Management:** Users can add, edit, and delete their own recipes, which are stored in a local SQLite database.

### New Feature: Meal Planning
A recently integrated feature that allows users to:
*   **Plan Meals:** Assign recipes to specific days of the week and meal types (Breakfast, Lunch, Dinner, Snack) using a selection-based modal interface.
*   **Generate Consolidated Shopping Lists:** Based on the planned meals, the app aggregates ingredients from all selected recipes into a single shopping list.
*   **Intuitive Interface:** Replaced the initial drag-and-drop mechanism with a more accessible click-and-select modal for assigning recipes to meal slots.

## 3. Tech Stack
The application is built with a modern and robust tech stack:

*   **Frontend:**
    *   **React:** A JavaScript library for building user interfaces.
    *   **React Router:** For declarative routing in the application.
    *   **TanStack Query:** For efficient data fetching, caching, and synchronization.
    *   **Framer Motion:** For smooth animations and microinteractions.
    *   **Tailwind CSS:** A utility-first CSS framework for rapid UI development and responsive design.
*   **Backend:**
    *   **Node.js:** A JavaScript runtime for server-side logic.
    *   **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
    *   **Sequelize:** An ORM (Object-Relational Mapper) for Node.js, simplifying database interactions.
*   **Database:**
    *   **SQLite:** A lightweight, file-based relational database.
*   **API:**
    *   **Spoonacular API:** Used for recipe search, detailed recipe information, nutritional data, and ingredient substitutions.

## 4. Getting Started

### Prerequisites
Before you begin, ensure you have the following installed on your system:
*   [Node.js](https://nodejs.org/en/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation
Follow these steps to set up and run the project locally:

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/smile-plzz/guided-cooking-app.git
    cd guided-cooking-app
    ```

2.  **Install server dependencies:**
    ```sh
    cd server
    npm install
    ```

3.  **Install client dependencies:**
    ```sh
    cd ../client
    npm install
    ```

### Running the Application
You need to start both the backend server and the frontend client.

1.  **Start the server:**
    Navigate to the `server` directory and run:
    ```sh
    npm start
    ```
    The server will typically run on `http://localhost:5000`.

2.  **Start the client:**
    Navigate to the `client` directory and run:
    ```sh
    npm start
    ```
    The client application will typically open in your browser at `http://localhost:3000`.

### Spoonacular API Key Setup
The application relies on the Spoonacular API for various features. You need to obtain an API key and configure it:

1.  **Get an API Key:**
    *   Go to the [Spoonacular API website](https://spoonacular.com/food-api).
    *   Sign up for a free account and obtain your API key.

2.  **Configure the API Key:**
    *   Create a file named `.env` in the `server/` directory (if it doesn't already exist).
    *   Add your API key to this file in the following format:
        ```
        SPOONACULAR_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
        ```
    *   Replace `"YOUR_ACTUAL_API_KEY_HERE"` with the key you obtained from Spoonacular.
    *   **Important:** Restart the server after updating the `.env` file for the changes to take effect.

## 5. Project Structure
The project is organized into two main directories: `client/` for the React frontend and `server/` for the Node.js/Express backend.

```
guided-cooking-app/
├── client/                 # React frontend application
│   ├── public/             # Public assets (HTML, images, manifest)
│   ├── src/                # React source code
│   │   ├── components/     # Reusable UI components (e.g., Navbar, RecipeList, MealPlanner)
│   │   ├── styles/         # Global styles and design tokens (e.g., tokens.css)
│   │   ├── utils/          # Utility functions (e.g., motion.js for Framer Motion variants)
│   │   ├── App.js          # Main application component, handles routing
│   │   ├── index.css       # Tailwind CSS imports and global styles
│   │   └── index.js        # React app entry point
│   └── package.json        # Frontend dependencies and scripts
├── server/                 # Node.js/Express backend application
│   ├── config/             # Database configuration
│   ├── data/               # Initial seed data (recipes.json)
│   ├── tests/              # Backend unit and integration tests
│   ├── database.js         # Sequelize models and database connection
│   ├── server.js           # Main Express server setup and API routes
│   └── package.json        # Backend dependencies and scripts
├── .git/                   # Git version control
├── .gitignore              # Specifies intentionally untracked files to ignore
├── context.txt             # Detailed development history and current context
├── README.md               # Project documentation (this file)
└── ...                     # Other project-level configuration files
```

## 6. Design Principles & Refinements

### General Design Guidelines
The application adheres to a minimalist aesthetic, focusing on a fluid user experience and accessibility. Key principles include:
*   **Minimalist Design:** Prioritizing simplicity with clean lines and uncluttered layouts.
*   **Fluid User Experience:** Ensuring seamless navigation and intuitive interactions.
*   **User-Centered Design:** Catering to diverse user needs, including accessibility.
*   **Consistency:** Maintaining uniformity in visual and interactive elements.
*   **Performance Optimization:** Optimizing assets and animations for fast load times.
*   **Typography:** Uses the 'Inter' font family (sans-serif, clean, modern, highly legible) with defined weights and responsive sizes.
*   **Color Palette:** Utilizes a carefully selected palette with primary, secondary, accent, and neutral colors, designed for both light and dark modes.
*   **Layout & Alignment:** Employs a 12-column responsive grid system with an 8px spacing scale for consistent margins and padding.
*   **Microinteractions & Transitions:** Leverages Framer Motion for smooth, hardware-accelerated animations and subtle hover/tap effects.
*   **Glassmorphism & Neumorphism:** Applied sparingly to elements like the Navbar, modals, buttons, and badges for a modern, tactile feel.

### Implemented Design Improvements
*   **Consistent Global Spacing:** Introduced a `page-content-padding` class to ensure consistent top padding for main content areas, clearing the fixed navigation bar.
*   **Refined Navbar Styling:** The dark mode toggle button in the Navbar now uses CSS variables for its background and text colors, ensuring consistency with the design tokens.
*   **Improved Form Element Styling:** Form inputs, textareas, and buttons in `RecipeForm.js` have been updated with consistent Tailwind classes, leveraging CSS variables for borders, backgrounds, and enhanced focus states.
*   **Increased Font Sizes:** Global font sizes defined in `client/src/styles/tokens.css` have been increased for improved readability across all screen sizes.

## 7. Backend Details

### Database
The backend uses **SQLite** as its database, managed by **Sequelize ORM**.
*   **Model Definition:** The `Recipe` model is defined in `server/database.js`, including fields for `title`, `image`, `readyInMinutes`, `servings`, `extendedIngredients` (JSON), and `analyzedInstructions` (JSON).
*   **Migrations & Seeding:** The database tables are synchronized using `sequelize.sync()`. Initial recipe data is seeded from `server/data/recipes.json` if the `Recipe` table is empty. The seeding logic is encapsulated in an exportable `seedDatabase` function for testing purposes.

### API Endpoints
The Express.js server (`server/server.js`) provides a RESTful API for managing recipes and proxying Spoonacular API requests.

*   **Local Recipe Management:**
    *   `GET /api/recipes`: Retrieve all recipes from the local database.
    *   `POST /api/recipes`: Add a new recipe to the local database.
    *   `PUT /api/recipes/:id`: Update an existing recipe in the local database.
    *   `DELETE /api/recipes/:id`: Delete a recipe from the local database.
    *   `POST /api/recipes/favorites`: Fetch a list of recipes by their IDs (used for displaying favorited recipes).

*   **Spoonacular API Proxy:**
    *   `GET /api/search-recipes`: Proxies requests to Spoonacular's `complexSearch` endpoint, supporting `query`, `cuisine`, `diet`, and `intolerances` parameters.
    *   `GET /api/recipe/:id`: Proxies requests to Spoonacular's `information` endpoint for detailed recipe data.
    *   `GET /api/recipe/:id/nutrition`: Proxies requests to Spoonacular's `nutritionWidget.json` endpoint for nutritional information.
    *   `GET /api/ingredient-substitutes`: Proxies requests to Spoonacular's `food/ingredients/substitutes` endpoint for ingredient substitution suggestions.
    *   **API Key Handling:** The Spoonacular API key is securely managed server-side using environment variables (`.env` file).
    *   **Caching:** API responses from Spoonacular are cached using `memory-cache` to reduce redundant requests and improve performance.

### Testing
The backend includes comprehensive unit and integration tests using **Jest** and **Supertest**.
*   **`recipes.test.js`:** Covers CRUD operations for local recipes, including validation, error handling, and the favorites endpoint. It also tests the database seeding process.
*   **`spoonacular.test.js`:** (Assumed to exist and cover Spoonacular proxy endpoints).
*   All backend tests are currently passing, ensuring the stability and correctness of the server-side logic.

## 8. Frontend Details

### Routing
The frontend uses `react-router-dom` (v6 API) for navigation:
*   `/`: Home page, displaying a list of recipes.
*   `/recipe/:id`: Detailed view for a single recipe.
*   `/add-recipe`: Form for adding new recipes.
*   `/edit-recipe/:id`: Form for editing existing local recipes.
*   `/favorites`: Displays only favorited recipes.
*   `/shopping-list`: Manages the user's shopping list.
*   `/pantry`: Manages the user's pantry items.
*   `/meal-planner`: The new meal planning interface.

### State Management & Data Fetching
*   **React Hooks:** Utilizes `useState` and `useEffect` for component-level state management.
*   **TanStack Query:** Integrated for efficient data fetching, caching, and synchronization with the backend API and Spoonacular. This reduces boilerplate and improves performance by managing loading, error, and data states.
*   **Local Storage:** User-specific data like dark mode preference, favorited recipes, shopping list items, pantry items, and custom recipe notes are persisted in the browser's `localStorage`.

### Styling
*   **Tailwind CSS:** Used extensively for utility-first styling, enabling rapid UI development and responsive design.
*   **CSS Variables:** Global design tokens (colors, spacing, typography) are defined using CSS variables in `client/src/styles/tokens.css` for easy theming and consistency.
*   **Dark Mode:** A global dark mode toggle is implemented, applying different CSS variable values to `document.documentElement` for a seamless theme switch.
*   **Framer Motion:** Used for animations, including subtle hover effects, transitions, and more complex animations like parallax scrolling.

### Components Overview
*   **`App.js`:** The main application component, setting up routing and global context (dark mode, notifications).
*   **`Navbar.js`:** Provides primary navigation, search input, filter dropdowns, and the dark mode toggle.
*   **`RecipeList.js`:** Displays a grid of recipe cards, handles search and filtering, and integrates lazy loading for images.
*   **`RecipeDetail.js`:** Shows detailed recipe information, manages favorites, editing/deletion, unit conversion, ingredient substitution, nutritional data, and guided cooking steps.
*   **`RecipeForm.js`:** A form for adding and editing local recipes.
*   **`ShoppingList.js`:** Manages the user's shopping list.
*   **`Pantry.js`:** Manages the user's pantry items.
*   **`MealPlanner.js`:** The core component for meal planning, allowing users to assign recipes to meal slots.
*   **`RecipeSelectionModal.js`:** A modal used within the Meal Planner to select recipes from both local data and Spoonacular API search results.
*   **`Notification.js`:** A reusable component for displaying transient success/error messages.
*   **`Timer.js`:** A reusable component for countdown timers within guided cooking.

## 9. Development History & Context
This project has undergone continuous development and refinement. Key historical changes include:
*   **Backend Migration:** Transitioned from file-based recipe storage (`recipes.json`) to a more robust SQLite database with Sequelize ORM.
*   **Spoonacular API Integration:** Implemented proxy endpoints to securely fetch and cache data from the Spoonacular API.
*   **Frontend Framework Update:** The `new_client` (Vue.js) application was removed as the project standardized on React.
*   **Design System Implementation:** Adopted Tailwind CSS and a CSS variable-based design token system for consistent and efficient styling.
*   **Feature Additions:** Implemented core features like pantry, shopping list, and the comprehensive Meal Planning module.
*   **Testing:** Established a robust testing suite for the backend API to ensure reliability.

## 10. Outstanding Issues & Next Steps
While the application is functional and feature-rich, there are areas for further improvement:

*   **Frontend Functionality Testing:** Thoroughly test all features in the React frontend to ensure they work as expected with the updated backend logic and new features.
*   **WebSocket Errors:** Investigate and fix persistent `WebSocket connection to 'ws://localhost:3000/ws' failed` errors appearing in the browser console. These typically relate to the frontend development server's hot-reloading and need further investigation.
*   **API Enhancements:** Discuss and implement further enhancements to the existing API endpoints, potentially adding more complex queries or user-specific data management.
*   **Advanced Shopping List:** Enhance the shopping list generation to include more sophisticated unit conversions and better integration with pantry items (e.g., automatically deducting pantry items from the list).
*   **User Authentication:** Implement user authentication and personalization features to allow users to save their data across devices and sessions.
*   **Deployment:** Prepare the application for deployment to a production environment.