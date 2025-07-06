import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const cuisines = ["Italian", "Mexican", "Chinese", "Indian", "American"];
const diets = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo"];
const intolerancesOptions = ["Dairy", "Egg", "Gluten", "Grain", "Peanut", "Seafood", "Sesame", "Shellfish", "Soy", "Sulfite", "Tree Nut", "Wheat"];

function Navbar({ darkMode, toggleDarkMode, searchQuery, handleSearchChange, cuisine, setCuisine, diet, setDiet, intolerances, setIntolerances }) {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center py-4 px-8 bg-white/10 text-text shadow-md dark:bg-gray-800/80 backdrop-blur-md border-b border-white/20">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Link to="/" className="font-inter font-bold text-h2 no-underline text-text dark:text-gray-100">
          Guided Cooking
        </Link>
      </motion.div>
      <div className="flex items-center gap-8">
        <NavLink to="/" className={({ isActive }) => `relative font-inter font-medium text-body no-underline ${isActive ? 'text-primary dark:text-accent1' : 'text-text dark:text-gray-100'} hover:text-primary dark:hover:text-accent1 group`}>
          Home
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary dark:bg-accent1 transition-all duration-300 group-hover:w-full"></span>
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => `relative font-inter font-medium text-body no-underline ${isActive ? 'text-primary dark:text-accent1' : 'text-text dark:text-gray-100'} hover:text-primary dark:hover:text-accent1 group`}>
          Favorites
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary dark:bg-accent1 transition-all duration-300 group-hover:w-full"></span>
        </NavLink>
        <NavLink to="/add-recipe" className={({ isActive }) => `relative font-inter font-medium text-body no-underline ${isActive ? 'text-primary dark:text-accent1' : 'text-text dark:text-gray-100'} hover:text-primary dark:hover:text-accent1 group`}>
          Add Recipe
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary dark:bg-accent1 transition-all duration-300 group-hover:w-full"></span>
        </NavLink>
        <NavLink to="/shopping-list" className={({ isActive }) => `relative font-inter font-medium text-body no-underline ${isActive ? 'text-primary dark:text-accent1' : 'text-text dark:text-gray-100'} hover:text-primary dark:hover:text-accent1 group`}>
          Shopping List
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary dark:bg-accent1 transition-all duration-300 group-hover:w-full"></span>
        </NavLink>
        <NavLink to="/pantry" className={({ isActive }) => `relative font-inter font-medium text-body no-underline ${isActive ? 'text-primary dark:text-accent1' : 'text-text dark:text-gray-100'} hover:text-primary dark:hover:text-accent1 group`}>
          Pantry
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary dark:bg-accent1 transition-all duration-300 group-hover:w-full"></span>
        </NavLink>
      </div>
      <div className="flex items-center gap-4 relative">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 pl-10 rounded-full border border-gray-300 text-base w-64 bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-300 focus:w-80 font-inter"
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="p-2 rounded-full border border-gray-300 text-base bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-300 font-inter">
          <option value="">All Cuisines</option>
          {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={diet} onChange={(e) => setDiet(e.target.value)} className="p-2 rounded-full border border-gray-300 text-base bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-300 font-inter">
          <option value="">All Diets</option>
          {diets.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={intolerances} onChange={(e) => setIntolerances(e.target.value)} className="p-2 rounded-full border border-gray-300 text-base bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-300 font-inter">
          <option value="">All Intolerances</option>
          {intolerancesOptions.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 border-none rounded-full cursor-pointer text-base transition-colors duration-300 bg-secondary text-text dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 flex items-center justify-center gap-2 font-inter"
        >
          {darkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.325 6.675l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z"></path></svg>
          )}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
