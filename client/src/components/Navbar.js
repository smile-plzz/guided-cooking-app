import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';



function Navbar({ darkMode, toggleDarkMode }) {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center py-4 px-8 bg-white/80 text-text shadow-md dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
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
        <NavLink to="/meal-planner" className={({ isActive }) => `relative font-inter font-medium text-body no-underline ${isActive ? 'text-primary dark:text-accent1' : 'text-text dark:text-gray-100'} hover:text-primary dark:hover:text-accent1 group`}>
          Meal Planner
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary dark:bg-accent1 transition-all duration-300 group-hover:w-full"></span>
        </NavLink>
      </div>
      <div className="flex items-center gap-4">
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
