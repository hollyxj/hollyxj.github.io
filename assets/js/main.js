document.addEventListener('DOMContentLoaded', function() {
    // --- Checkbox Logic ---
    const ingredientLists = document.querySelectorAll('.ingredient-list');

    ingredientLists.forEach(list => {
        const checkboxes = list.querySelectorAll('input[type="checkbox"]');
        const pageId = window.location.pathname; // Unique ID for the current page

        // Load saved state
        checkboxes.forEach(checkbox => {
            const storageKey = `${pageId}-${checkbox.id}`;
            if (localStorage.getItem(storageKey) === 'checked') {
                checkbox.checked = true;
                checkbox.nextElementSibling.classList.add('checked-item');
            }
        });

        // Save state on change
        list.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox') {
                const checkbox = event.target;
                const storageKey = `${pageId}-${checkbox.id}`;

                if (checkbox.checked) {
                    localStorage.setItem(storageKey, 'checked');
                    checkbox.nextElementSibling.classList.add('checked-item');
                } else {
                    localStorage.removeItem(storageKey);
                    checkbox.nextElementSibling.classList.remove('checked-item');
                }
            }
        });
    });

    // --- Serving Size Spinner Logic ---
    const servingsInput = document.getElementById('servings-input');
    const decreaseButton = document.getElementById('decrease-servings');
    const increaseButton = document.getElementById('increase-servings');
    const ingredientListElement = document.querySelector('.ingredient-list');

    // NEW: Get the instruction quantity spans
    const instructionQuantitySpans = document.querySelectorAll('.inst-quantity');

    // ONLY proceed if all essential elements are found on the page
    if (servingsInput && decreaseButton && increaseButton && ingredientListElement) {
        // We'll get the original_servings from the data attribute on the body or a hidden element
        // or directly from the initial value of servingsInput if it's set by Jekyll
        // For now, we'll rely on the initial servingsInput.value to be the original_servings
        const originalServings = parseFloat(document.querySelector('[data-original-servings]').dataset.originalServings); // Get this from a new data attribute
        let currentServings = originalServings; // Start with the value in the input box

        const ingredientItems = Array.from(ingredientListElement.querySelectorAll('li[data-original-quantity]')); // Select only LIs with data-original-quantity

        // Function to update quantities for both ingredient list and instructions
        function updateQuantities() {
            const scalingFactor = currentServings / originalServings;

            // Update ingredient list quantities
            ingredientItems.forEach(li => {
                const originalQuantity = parseFloat(li.dataset.originalQuantity); // Ensure it's parsed as a number
                const quantitySpan = li.querySelector('.ingredient-quantity');

                if (!isNaN(originalQuantity) && quantitySpan) {
                    const newQuantity = originalQuantity * scalingFactor;
                    quantitySpan.textContent = formatQuantity(newQuantity);
                }
            });

            // Update instruction quantities
            instructionQuantitySpans.forEach(span => {
                const ingredientId = span.dataset.ingredientId;
                const matchingIngredientData = document.querySelector(`[data-ingredient-id="${ingredientId}"]`); // Find the corresponding li for original quantity

                if (matchingIngredientData) {
                    const originalQuantity = parseFloat(matchingIngredientData.dataset.originalQuantity);
                    if (!isNaN(originalQuantity)) {
                        const newQuantity = originalQuantity * scalingFactor;
                        span.textContent = formatQuantity(newQuantity);
                    }
                }
            });
        }

        // Function to format quantities (e.g., 0.5 to 1/2, 2.25 to 2 1/4)
        function formatQuantity(num) {
            if (num === 0) return '0'; // Handle zero specifically

            const tolerance = 0.00001; // For floating point comparison issues

            // Special handling for common fractions
            if (Math.abs(num - 0.25) < tolerance) return '1/4';
            if (Math.abs(num - 0.5) < tolerance) return '1/2';
            if (Math.abs(num - 0.75) < tolerance) return '3/4';
            if (Math.abs(num - (1/3)) < tolerance) return '1/3';
            if (Math.abs(num - (2/3)) < tolerance) return '2/3';

            const whole = Math.floor(num);
            const fraction = num - whole;

            // Try to represent fractions like X/2, X/3, X/4, X/5, X/6, X/8, X/16
            const denominators = [2, 3, 4, 5, 6, 8, 16]; // Common denominators to check
            let bestFraction = '';
            let bestNumerator = 0;
            let bestDenominator = 1;

            for (let i = 0; i < denominators.length; i++) {
                const d = denominators[i];
                const n = Math.round(fraction * d);
                // Check if this fraction is a good approximation and has a smaller or equal denominator
                if (Math.abs(fraction - n / d) < tolerance) {
                    // Reduce fraction if possible before comparing
                    let currentN = n;
                    let currentD = d;
                    for (let j = Math.min(currentN, currentD); j > 1; j--) {
                        if (currentN % j === 0 && currentD % j === 0) {
                            currentN /= j;
                            currentD /= j;
                        }
                    }

                    if (bestFraction === '' || currentD < bestDenominator) { // Prefer simpler fractions (smaller denominator)
                        bestNumerator = currentN;
                        bestDenominator = currentD;
                        bestFraction = `${bestNumerator}/${bestDenominator}`;
                    }
                }
            }

            if (bestFraction && bestNumerator !== 0) {
                if (whole > 0) {
                    return `${whole} ${bestFraction}`; // e.g., "2 1/4"
                } else {
                    return bestFraction; // e.g., "1/4" (if whole is 0)
                }
            } else if (whole > 0) {
                return whole.toString(); // If no fractional part, just return the whole number
            } else {
                return num.toFixed(2).replace(/\.00$/, ''); // Fallback for other decimals, rounds to 2 decimal places
            }
        }


        // Event Listeners for buttons and input
        decreaseButton.addEventListener('click', () => {
            if (currentServings > 1) { // Lowest serving size is 1
                currentServings--;
                servingsInput.value = currentServings;
                updateQuantities();
            }
        });

        increaseButton.addEventListener('click', () => {
            currentServings++;
            servingsInput.value = currentServings;
            updateQuantities();
        });

        servingsInput.addEventListener('change', () => {
            let inputValue = parseFloat(servingsInput.value);
            if (isNaN(inputValue) || inputValue < 1) {
                inputValue = 1; // Default to 1 if invalid
            }
            currentServings = inputValue;
            servingsInput.value = currentServings; // Ensure input field reflects valid value
            updateQuantities();
        });

        // Initialize quantities on page load
        updateQuantities();
    }
});
