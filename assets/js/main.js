document.addEventListener('DOMContentLoaded', function() {
    // --- Checkbox Logic ---
    const ingredientLists = document.querySelectorAll('.ingredient-list');

    ingredientLists.forEach(list => {
        const checkboxes = list.querySelectorAll('input[type="checkbox"]');
        const pageId = window.location.pathname; // Unique ID for the current page

        // Load saved state
        checkboxes.forEach(checkbox => {
            const storageKey = `<span class="math-inline">\{pageId\}\-</span>{checkbox.id}`;
            if (localStorage.getItem(storageKey) === 'checked') {
                checkbox.checked = true;
                checkbox.nextElementSibling.classList.add('checked-item');
            }
        });

        // Save state on change
        list.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox') {
                const checkbox = event.target;
                const storageKey = `<span class="math-inline">\{pageId\}\-</span>{checkbox.id}`;

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

    // ONLY proceed if all essential elements are found on the page
    if (servingsInput && decreaseButton && increaseButton && ingredientListElement) {

        // Get original servings from the HTML input's value attribute on load
        const originalServings = parseFloat(servingsInput.value); // This will parse the initial '4'
        let currentServings = originalServings; // Start with the value in the input box

        const ingredientItems = Array.from(ingredientListElement.querySelectorAll('li[data-original-quantity]')); // Select only LIs with data-original-quantity

        // Function to update quantities
        function updateQuantities() {
            ingredientItems.forEach(li => {
                const originalQuantity = parseFloat(li.dataset.originalQuantity); // Ensure it's parsed as a number
                const quantitySpan = li.querySelector('.ingredient-quantity');

                if (!isNaN(originalQuantity) && quantitySpan) { // Check if originalQuantity is a valid number
                    // Avoid division by zero if original_servings somehow becomes 0
                    const newQuantity = (originalServings !== 0) ? (originalQuantity / originalServings) * currentServings : 0;
                    quantitySpan.textContent = formatQuantity(newQuantity);
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
                if (Math.abs(fraction - n / d) < tolerance) {
                    // Check if this fraction is simpler/more accurate than current best
                    // Prioritize simpler fractions (smaller denominator)
                    // You might adjust this logic based on desired output (e.g., always reduce to lowest terms)
                    if (bestFraction === '' || d < bestDenominator) { // Prefer smaller denominators
                        bestNumerator = n;
                        bestDenominator = d;
                        // Reduce fraction if possible
                        for (let j = Math.min(bestNumerator, bestDenominator); j > 1; j--) {
                            if (bestNumerator % j === 0 && bestDenominator % j === 0) {
                                bestNumerator /= j;
                                bestDenominator /= j;
                            }
                        }
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
