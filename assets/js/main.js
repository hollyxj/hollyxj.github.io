document.addEventListener('DOMContentLoaded', function() {
    // --- Checkbox Logic ---
    const ingredientLists = document.querySelectorAll('.ingredient-list');

    ingredientLists.forEach(list => {
        const checkboxes = list.querySelectorAll('input[type="checkbox"]');
        const pageId = window.location.pathname;

        checkboxes.forEach(checkbox => {
            const storageKey = `${pageId}-${checkbox.id}`;
            if (localStorage.getItem(storageKey) === 'checked') {
                checkbox.checked = true;
                checkbox.nextElementSibling.classList.add('checked-item');
            }
        });

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
    const instructionQuantitySpans = document.querySelectorAll('.inst-quantity');

    // ONLY proceed if all essential elements are found on the page
    if (servingsInput && decreaseButton && increaseButton && ingredientListElement) {

        const originalServings = parseFloat(document.querySelector('body').dataset.originalServings);
        let currentServings = originalServings;

        const ingredientItems = Array.from(ingredientListElement.querySelectorAll('li[data-original-quantity]'));

        // Define conversion rates (all in terms of teaspoons as base)
        const conversions = {
            'teaspoon': 1,
            'tsp': 1,
            'tablespoon': 3, // 3 teaspoons in 1 tablespoon
            'tbsp': 3,
            'fluid ounce': 6, // 2 tbsp = 1 fl oz, so 6 tsp = 1 fl oz
            'fl oz': 6,
            'cup': 48, // 16 tbsp = 1 cup, so 48 tsp = 1 cup
            'c': 48,
            'pint': 96, // 2 cups = 1 pint, so 96 tsp = 1 pint
            'pt': 96,
            'quart': 192, // 2 pints = 1 quart, so 192 tsp = 1 quart
            'qt': 192,
            'gallon': 768, // 4 quarts = 1 gallon, so 768 tsp = 1 gallon
            'gal': 768
            // Add more as needed, e.g., 'pound', 'oz' for weight if you include that
        };

        // Define preferred units and their abbreviations for display
        const preferredUnits = {
            'tsp': 'teaspoon',
            'tbsp': 'tablespoon',
            'fl oz': 'fluid ounce',
            'c': 'cup',
            'pt': 'pint',
            'qt': 'quart',
            'gal': 'gallon',
            'slices': 'slices', // Non-convertible unit, keep as is
            'egg': 'egg',     // Non-convertible unit, keep as is
            '': ''           // For cases with no unit
        };

        // Function to update quantities for both ingredient list and instructions
        function updateQuantities() {
            const scalingFactor = currentServings / originalServings;

            // Update ingredient list quantities
            ingredientItems.forEach(li => {
                const originalQuantity = parseFloat(li.dataset.originalQuantity);
                const originalUnit = li.dataset.originalUnit ? li.dataset.originalUnit.toLowerCase() : ''; // Get original unit
                const quantitySpan = li.querySelector('.ingredient-quantity');
                const unitSpan = li.querySelector('.ingredient-unit'); // Get the unit span

                if (!isNaN(originalQuantity) && quantitySpan) {
                    const newQuantity = originalQuantity * scalingFactor;
                    const formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                    quantitySpan.textContent = formatted.quantity;
                    if (unitSpan) {
                        unitSpan.textContent = formatted.unit ? `${formatted.unit} ` : ''; // Add space if unit exists
                    }
                }
            });

            // Update instruction quantities
            instructionQuantitySpans.forEach(span => {
                const ingredientId = span.dataset.ingredientId;
                const originalUnit = span.dataset.originalUnit ? span.dataset.originalUnit.toLowerCase() : ''; // Get original unit
                const matchingIngredientData = document.querySelector(`li[data-ingredient-id="${ingredientId}"]`);

                if (matchingIngredientData) {
                    const originalQuantity = parseFloat(matchingIngredientData.dataset.originalQuantity);
                    if (!isNaN(originalQuantity)) {
                        const newQuantity = originalQuantity * scalingFactor;
                        const formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                        // For instructions, we often keep the original unit unless the conversion is significant
                        // For simplicity, we'll just update the number here.
                        // If you want unit changes in instructions, you'd need to modify the instruction text more.
                        span.textContent = formatted.quantity;
                    }
                }
            });
        }

        // New function to format quantity with unit conversion logic
        function formatQuantityWithConversion(num, unit) {
            if (num === 0) return { quantity: '0', unit: unit };

            let workingUnit = unit;
            let workingValue = num;

            // Convert to base unit (teaspoons) if it's a known liquid measurement
            if (conversions[unit]) {
                workingValue = num * conversions[unit]; // Convert quantity to teaspoons
                workingUnit = 'teaspoon'; // Set working unit to base
            }

            // Attempt to convert to a larger, "nicer" unit if it results in a whole number or common fraction
            for (const targetUnit in conversions) {
                // Skip units that are not larger or not relevant for the current type
                if (conversions[targetUnit] <= conversions[workingUnit] || !preferredUnits[targetUnit]) continue;

                const convertedValue = workingValue / conversions[targetUnit];

                // Check if conversion results in a "nice" number (whole or common fraction)
                const formattedConverted = formatToFraction(convertedValue);
                if (formattedConverted.includes('/') || formattedConverted.includes(' ')) { // Contains a fraction
                    // Check if the resulting fraction is simpler or more intuitive
                    // This is subjective; we're prioritizing common denominators
                    // A simple check could be if the denominator is <= 16 or results in a whole number.
                    if (convertedValue % 1 === 0 || formattedConverted.split('/')[1] <= 16 || formattedConverted.split(' ')[1]) {
                         return { quantity: formattedConverted, unit: preferredUnits[targetUnit] };
                    }
                } else if (convertedValue % 1 === 0) { // Check for a clean whole number conversion
                    return { quantity: convertedValue.toString(), unit: preferredUnits[targetUnit] };
                }
            }

            // If no "nicer" unit found, format in the original unit (or the closest converted unit)
            return { quantity: formatToFraction(num), unit: unit };
        }


        // Existing formatToFraction function (renamed for clarity from formatQuantity)
        function formatToFraction(num) {
            if (num === 0) return '0';

            const tolerance = 0.00001;
            const whole = Math.floor(num);
            let fraction = num - whole;

            // Try to represent fractions with common denominators (up to 16ths for precision)
            const denominators = [2, 3, 4, 5, 6, 8, 16]; // Common denominators to check
            let bestFraction = '';
            let bestNumerator = 0;
            let bestDenominator = 1;

            for (let i = 0; i < denominators.length; i++) {
                const d = denominators[i];
                const n = Math.round(fraction * d);
                if (Math.abs(fraction - n / d) < tolerance) {
                    let currentN = n;
                    let currentD = d;
                    // Reduce fraction
                    for (let j = Math.min(currentN, currentD); j > 1; j--) {
                        if (currentN % j === 0 && currentD % j === 0) {
                            currentN /= j;
                            currentD /= j;
                        }
                    }

                    // Prioritize simpler fractions (smaller denominator)
                    if (bestFraction === '' || currentD < bestDenominator) {
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
                return num.toFixed(2).replace(/\.00$/, ''); // Fallback for other decimals
            }
        }


        // Event Listeners for buttons and input (unchanged)
        decreaseButton.addEventListener('click', () => {
            if (currentServings > 1) {
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
                inputValue = 1;
            }
            currentServings = inputValue;
            servingsInput.value = currentServings;
            updateQuantities();
        });

        // Initialize quantities on page load
        updateQuantities();
    }
});
