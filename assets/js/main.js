document.addEventListener('DOMContentLoaded', function() {
    // --- Checkbox Logic (unchanged) ---
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

    // --- Serving Size Spinner Logic (unchanged parts) ---
    const servingsInput = document.getElementById('servings-input');
    const decreaseButton = document.getElementById('decrease-servings');
    const increaseButton = document.getElementById('increase-servings');
    const ingredientListElement = document.querySelector('.ingredient-list');
    const instructionQuantitySpans = document.querySelectorAll('.inst-quantity');

    if (servingsInput && decreaseButton && increaseButton && ingredientListElement) {
        const originalServings = parseFloat(document.querySelector('body').dataset.originalServings);
        let currentServings = originalServings;

        const ingredientItems = Array.from(ingredientListElement.querySelectorAll('li[data-original-quantity]'));

        // Define conversion rates (all in terms of teaspoons as base)
        // Group by type for better control (liquid, dry, count)
        const conversions = {
            'liquid': {
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
            },
            // Add dry weights if needed later:
            // 'weight': {
            //     'gram': 1, // base unit
            //     'ounce': 28.3495,
            //     'pound': 453.592
            // },
            // 'count': { // These are non-convertible by ratio, handled differently
            //     'egg': 1,
            //     'clove': 1
            // }
        };

        // Define preferred units for display (maps lowercase unit to preferred display string)
        const preferredUnits = {
            'teaspoon': 'teaspoon',
            'tsp': 'teaspoon',
            'tablespoon': 'tablespoon',
            'tbsp': 'tablespoon',
            'fluid ounce': 'fluid ounce',
            'fl oz': 'fluid ounce',
            'cup': 'cup',
            'c': 'cup',
            'pint': 'pint',
            'pt': 'pint',
            'quart': 'quart',
            'qt': 'quart',
            'gallon': 'gallon',
            'gal': 'gallon',
            'slices': 'slices', // Non-convertible by standard volume/weight
            'slice': 'slices',
            'egg': 'egg',     // Non-convertible
            'eggs': 'eggs',
            '': ''           // For cases with no unit
        };

        // Function to determine if a unit is convertible by liquid volume
        function isLiquidVolumeUnit(unit) {
            return conversions.liquid.hasOwnProperty(unit);
        }

        // Function to update quantities for both ingredient list and instructions
        function updateQuantities() {
            const scalingFactor = currentServings / originalServings;

            // Update ingredient list quantities
            ingredientItems.forEach(li => {
                const originalQuantity = parseFloat(li.dataset.originalQuantity);
                const originalUnit = li.dataset.originalUnit ? li.dataset.originalUnit.toLowerCase() : '';
                const quantitySpan = li.querySelector('.ingredient-quantity');
                const unitSpan = li.querySelector('.ingredient-unit');

                if (!isNaN(originalQuantity) && quantitySpan) {
                    const newQuantity = originalQuantity * scalingFactor;
                    let formatted;

                    if (isLiquidVolumeUnit(originalUnit)) {
                        formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                    } else {
                        // For non-liquid units (like 'egg', 'slices'), just format the number
                        // and keep the original unit. Round to nearest whole for count units.
                        formatted = {
                            quantity: formatToFraction(Math.round(newQuantity)), // Round to nearest whole number for count units
                            unit: preferredUnits[originalUnit] || originalUnit // Use preferred, or original if not found
                        };
                        // Special handling for plural/singular of count units if needed (e.g., 1 egg, 2 eggs)
                        if (originalUnit === 'egg' && Math.round(newQuantity) !== 1) {
                             formatted.unit = 'eggs';
                        } else if (originalUnit === 'slices' && Math.round(newQuantity) === 1) {
                            formatted.unit = 'slice';
                        }
                    }

                    quantitySpan.textContent = formatted.quantity;
                    if (unitSpan) {
                        unitSpan.textContent = formatted.unit ? `${formatted.unit} ` : '';
                    }
                }
            });

            // Update instruction quantities
            instructionQuantitySpans.forEach(span => {
                const ingredientId = span.dataset.ingredientId;
                const originalUnit = span.dataset.originalUnit ? span.dataset.originalUnit.toLowerCase() : '';
                const matchingIngredientData = document.querySelector(`li[data-ingredient-id="${ingredientId}"]`);

                if (matchingIngredientData) {
                    const originalQuantity = parseFloat(matchingIngredientData.dataset.originalQuantity);
                    if (!isNaN(originalQuantity)) {
                        const newQuantity = originalQuantity * scalingFactor;
                        let formatted;

                        if (isLiquidVolumeUnit(originalUnit)) {
                            formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                        } else {
                            // For instructions, we mostly just update the number.
                            // Unit changes in instructions are complex, stick to original unit text for now.
                            formatted = {
                                quantity: formatToFraction(Math.round(newQuantity)), // Round to nearest whole for count units
                                unit: originalUnit // Keep original unit text from instruction HTML
                            };
                        }
                        span.textContent = formatted.quantity;
                    }
                }
            });
        }

        // Modified function to format quantity with unit conversion logic
        function formatQuantityWithConversion(num, unit) {
            if (num === 0) return { quantity: '0', unit: preferredUnits[unit] || unit };

            let workingUnit = unit;
            let workingValue = num;

            // Only proceed with conversion if the unit is a known liquid volume unit
            if (isLiquidVolumeUnit(unit)) {
                // Convert to base unit (teaspoons)
                workingValue = num * conversions.liquid[unit]; // Convert quantity to teaspoons
                workingUnit = 'teaspoon'; // Set working unit to base for iteration
            } else {
                // If it's not a liquid volume unit, return as is (just formatted)
                return { quantity: formatToFraction(num), unit: preferredUnits[unit] || unit };
            }

            // Attempt to convert to a larger, "nicer" unit if it results in a whole number or common fraction
            // Iterate through liquid units in reverse (largest to smallest) for best conversion
            const liquidUnitsSorted = Object.keys(conversions.liquid).sort((a, b) => conversions.liquid[b] - conversions.liquid[a]);

            for (const targetUnit of liquidUnitsSorted) {
                // Skip units that are not larger than the current base (teaspoon)
                // and skip the base unit itself as a conversion target unless it's the only option
                if (conversions.liquid[targetUnit] < conversions.liquid[workingUnit]) continue; // Only convert UP
                if (targetUnit === 'teaspoon' && workingValue < conversions.liquid.tablespoon) continue; // Don't convert tsp to tsp unless there's no other choice

                const convertedValue = workingValue / conversions.liquid[targetUnit];

                // Check if conversion results in a "nice" number (whole or common fraction)
                const formattedConverted = formatToFraction(convertedValue);

                // Prioritize whole numbers, then common fractions
                if (convertedValue % 1 === 0) { // Check for a clean whole number conversion
                    return { quantity: convertedValue.toString(), unit: preferredUnits[targetUnit] || targetUnit };
                } else if (formattedConverted.includes('/') || formattedConverted.includes(' ')) {
                    // This is subjective. We prefer simpler fractions (smaller denominator)
                    // For now, if it creates a fraction, it's considered.
                    // You might want to fine-tune this to, e.g., only accept 1/2, 1/4, 1/3, 2/3, 3/4
                    // or a maximum denominator like 8 or 16.
                    return { quantity: formattedConverted, unit: preferredUnits[targetUnit] || targetUnit };
                }
            }

            // If no "nicer" unit found, format in the original unit (or converted to tsp if it was liquid)
            // This fallback means it will try to keep it in the original unit if no better conversion was found
            // but if it was a liquid, it will convert to tsp if that's the best option.
            if (isLiquidVolumeUnit(unit)) {
                return { quantity: formatToFraction(num), unit: preferredUnits[unit] || unit };
            } else {
                 return { quantity: formatToFraction(num), unit: preferredUnits[unit] || unit };
            }
        }

        // Existing formatToFraction function (unchanged)
        function formatToFraction(num) {
            if (num === 0) return '0';

            const tolerance = 0.00001;
            const whole = Math.floor(num);
            let fraction = num - whole;

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
                    for (let j = Math.min(currentN, currentD); j > 1; j--) {
                        if (currentN % j === 0 && currentD % j === 0) {
                            currentN /= j;
                            currentD /= j;
                        }
                    }

                    if (bestFraction === '' || currentD < bestDenominator) {
                        bestNumerator = currentN;
                        bestDenominator = currentD;
                        bestFraction = `${bestNumerator}/${bestDenominator}`;
                    }
                }
            }

            if (bestFraction && bestNumerator !== 0) {
                if (whole > 0) {
                    return `${whole} ${bestFraction}`;
                } else {
                    return bestFraction;
                }
            } else if (whole > 0) {
                return whole.toString();
            } else {
                return num.toFixed(2).replace(/\.00$/, '');
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
