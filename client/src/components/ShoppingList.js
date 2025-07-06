import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkboxRipple, slideInConfirmation } from '../utils/motion';

function ShoppingList({ darkMode }) {
  const [shoppingList, setShoppingList] = useState([]);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  useEffect(() => {
    const storedList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    setShoppingList(storedList);
  }, []);

  const handleToggleCheck = (index) => {
    const newList = [...shoppingList];
    newList[index].checked = !newList[index].checked;
    setShoppingList(newList);
    localStorage.setItem('shoppingList', JSON.stringify(newList));
  };

  const handleClearList = () => {
    setShowClearConfirmation(true);
  };

  const confirmClear = () => {
    setShoppingList([]);
    localStorage.removeItem('shoppingList');
    setShowClearConfirmation(false);
  };

  const cancelClear = () => {
    setShowClearConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-text dark:text-gray-100 transition-colors duration-300 font-inter p-8 max-w-5xl mx-auto rounded-2xl shadow-lg backdrop-blur-md">
      <h1 className="text-h1 font-bold text-primary text-center mb-8">Shopping List</h1>
      {shoppingList.length === 0 ? (
        <p className="text-center text-body text-text-secondary p-10">Your shopping list is empty. Add ingredients from recipe details!</p>
      ) : (
        <div className="bg-secondary/70 dark:bg-gray-700/70 rounded-lg p-6 shadow-inner border border-gray-200/50 dark:border-gray-600/50">
          <ul>
            {shoppingList.map((item, index) => (
              <motion.li
                key={index}
                className={`flex items-center py-3 border-b border-gray-200/50 dark:border-gray-600/50 text-body ${item.checked ? 'line-through text-text-secondary' : 'text-text'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <motion.input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggleCheck(index)}
                  className="mr-4 w-5 h-5 accent-primary cursor-pointer"
                  whileTap="tap"
                  variants={checkboxRipple}
                />
                <span>{item.quantity} {item.unit} {item.name}</span>
              </motion.li>
            ))}
          </ul>
          <motion.button
            onClick={handleClearList}
            className="block w-fit mx-auto mt-8 px-6 py-3 bg-accent1 text-white rounded-full cursor-pointer text-body font-semibold transition-all duration-300 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >Clear List</motion.button>
        </div>
      )}

      <AnimatePresence>
        {showClearConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideInConfirmation}
          >
            <motion.div className="bg-white/70 dark:bg-gray-800/70 p-8 rounded-lg shadow-xl max-w-sm w-full text-center backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-h3 font-bold mb-4 text-text dark:text-gray-100">Confirm Clear</h2>
              <p className="text-body text-text-secondary mb-6">Are you sure you want to clear your shopping list? This action cannot be undone.</p>
              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={confirmClear}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >Clear</motion.button>
                <motion.button
                  onClick={cancelClear}
                  className="px-4 py-2 bg-gray-300 text-text rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >Cancel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ShoppingList;