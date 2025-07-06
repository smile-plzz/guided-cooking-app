import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { floatingLabel, buttonHover, slideUpStagger, staggerContainer } from '../utils/motion';

function Pantry({ darkMode, showNotification }) {
  const [pantryItems, setPantryItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const storedPantry = JSON.parse(localStorage.getItem('pantryItems') || '[]');
    setPantryItems(storedPantry);
  }, []);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim() !== '') {
      const updatedPantry = [...pantryItems, newItem.trim()];
      setPantryItems(updatedPantry);
      localStorage.setItem('pantryItems', JSON.stringify(updatedPantry));
      setNewItem('');
      showNotification('Item added to pantry!', 'success');
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    const updatedPantry = pantryItems.filter(item => item !== itemToRemove);
    setPantryItems(updatedPantry);
    localStorage.setItem('pantryItems', JSON.stringify(updatedPantry));
    showNotification('Item removed from pantry!', 'success');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-text dark:text-gray-100 transition-colors duration-300 font-inter p-8 max-w-3xl mx-auto rounded-2xl shadow-lg backdrop-blur-md">
      <h1 className="text-h1 font-bold text-primary mb-8 text-center">Your Pantry</h1>
      <form onSubmit={handleAddItem} className="flex gap-4 mb-8 justify-center">
        <motion.input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new ingredient to pantry"
          className="p-3 rounded-md border border-gray-300 text-body flex-grow bg-white text-text focus:outline-none focus:ring-2 focus:ring-accent2"
          variants={floatingLabel}
          whileFocus="focus"
          onBlur="blur"
        />
        <motion.button
          type="submit"
          className="px-5 py-2 bg-primary text-white rounded-full cursor-pointer text-body font-semibold transition-all duration-300 shadow-md"
          variants={buttonHover}
          whileHover="hover"
          whileTap="tap"
        >Add to Pantry</motion.button>
      </form>

      {pantryItems.length === 0 ? (
        <p className="text-center text-body text-text-secondary p-10">Your pantry is empty. Add some ingredients!</p>
      ) : (
        <motion.ul
          className="list-none p-0"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {pantryItems.map((item, index) => (
              <motion.li
                key={item} // Use item as key for AnimatePresence to track unique items
                className="flex justify-between items-center bg-secondary/70 border border-gray-200/50 p-3 mb-2 rounded-md text-text transition-all duration-200"
                variants={slideUpStagger}
                exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
              >
                <span className="font-body">{item}</span>
                <motion.button
                  onClick={() => handleRemoveItem(item)}
                  className="px-3 py-1 bg-red-500 text-white rounded-full text-sm transition-colors duration-300"
                  variants={buttonHover}
                  whileHover="hover"
                  whileTap="tap"
                >Remove</motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

export default Pantry;