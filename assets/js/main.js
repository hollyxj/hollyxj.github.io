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

    // --- Serving Size Spinner Logic ---
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
            'slices': 'slices',
            'slice': 'slice',
            'egg': 'egg',
            'eggs': 'eggs',
            '': ''
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

                    // Special handling for count units (eggs, slices) - always round to nearest whole number
                    if (originalUnit === 'egg' || originalUnit === 'slices' || originalUnit === 'slice') {
                        formatted = {
                            quantity: Math.round(newQuantity).toString(), // Round to nearest whole number
                            unit: preferredUnits[originalUnit] || originalUnit
                        };
                        // Pluralization
                        if (originalUnit === 'egg' && Math.round(newQuantity) !== 1) {
                             formatted.unit = 'eggs';
                        } else if (originalUnit === 'slices' && Math.round(newQuantity) === 1) {
                            formatted.unit = 'slice';
                        } else if (originalUnit === 'slice' && Math.round(newQuantity) !== 1) { // Added for 'slice' original unit
                            formatted.unit = 'slices';
                        }
                    } else if (isLiquidVolumeUnit(originalUnit)) {
                        formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                    } else {
                        // For non-liquid, non-count units, just format the number (no aggressive rounding or unit conversion)
                        formatted = {
                            quantity: formatToFraction(newQuantity), // Use formatToFraction without aggressive rounding
                            unit: preferredUnits[originalUnit] || originalUnit
                        };
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

                        // Same special handling for count units in instructions
                        if (originalUnit === 'egg' || originalUnit === 'slices' || originalUnit === 'slice') {
                            formatted = {
                                quantity: Math.round(newQuantity).toString(),
                                unit: originalUnit // Keep original unit text from instruction HTML
                            };
                        } else if (isLiquidVolumeUnit(originalUnit)) {
                            formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                        } else {
                            formatted = {
                                quantity: formatToFraction(newQuantity),
                                unit: originalUnit // Keep original unit text from instruction HTML
                            };
                        }
                        span.textContent = formatted.quantity;
                    }
                }
            });
        }

        // Function to format quantity with unit conversion logic
        // This version attempts to convert liquid units to larger, whole-number friendly units,
        // but does NOT aggressively round fractions.
        function formatQuantityWithConversion(num, unit) {
            if (num === 0) return { quantity: '0', unit: preferredUnits[unit] || unit };

            // If it's not a liquid volume unit, just format the number and return the original unit.
            // This case should ideally be caught by the updateQuantities function now for count units.
            if (!isLiquidVolumeUnit(unit)) {
                return { quantity: formatToFraction(num), unit: preferredUnits[unit] || unit };
            }

            let bestQuantity = num;
            let bestUnit = unit;
            let bestSimplicity = Infinity; // Lower is better

            // First, evaluate the original unit itself without conversion
            // This establishes a baseline for simplicity (e.g., 0.25 cup is simple)
            const initialScore = num % 1 === 0 ? 1 : (formatToFraction(num).includes('/') ? 10 : 50); // Whole numbers best, then fractions, then decimals
            bestSimplicity = initialScore;


            // Iterate through liquid units in reverse (largest to smallest) to find the best conversion
            const liquidUnitsSorted = Object.keys(conversions.liquid).sort((a, b) => conversions.liquid[b] - conversions.liquid[a]);

            for (const targetUnit of liquidUnitsSorted) {
                const targetUnitBaseValue = conversions.liquid[targetUnit];
                const currentUnitBaseValue = conversions.liquid[unit];

                if (!targetUnitBaseValue || !currentUnitBaseValue) continue;

                const convertedValue = (num * currentUnitBaseValue) / targetUnitBaseValue;

                let currentSimplicity = Infinity;
                if (convertedValue % 1 === 0) { // If it's a whole number
                    currentSimplicity = 1; // Very simple!
                } else {
                    // Score based on whether it creates a common fraction (e.g., 1/2, 1/4, 1/3, 2/3, 3/4)
                    const fractionText = formatToFraction(convertedValue);
                    if (fractionText.includes('/')) {
                        const parts = fractionText.split(' ');
                        const frac = parts.length > 1 ? parts[1] : parts[0];
                        const denom = parseInt(frac.split('/')[1]);
                        // Reward smaller denominators (2, 3, 4, 8)
                        if (denom === 2 || denom === 4) currentSimplicity = 10;
                        else if (denom === 3 || denom === 8) currentSimplicity = 20;
                        else currentSimplicity = 50; // Less common fraction
                    } else {
                        currentSimplicity = 100; // Decimal, less preferred
                    }
                }

                // If this conversion leads to a significantly simpler representation, use it.
                // Prioritize whole numbers, then common fractions, then decimals.
                // Prefer staying in the current unit unless a better option is found.
                if (currentSimplicity < bestSimplicity) {
                    bestSimplicity = currentSimplicity;
                    bestQuantity = convertedValue;
                    bestUnit = targetUnit;
                }
            }

            // Final output
            return {
                quantity: formatToFraction(bestQuantity),
                unit: preferredUnits[bestUnit] || bestUnit
            };
        }


        // Original formatToFraction function (no aggressive rounding)
        // This will produce exact fractions or decimals based on precision.
        function formatToFraction(num) {
            if (num === 0) return '0';

            const tolerance = 0.000001; // For very precise floating point comparisons
            const whole = Math.floor(num);
            let fraction = num - whole;

            const denominators = [2, 3, 4, 5, 6, 8, 10, 12, 16, 32]; // Expanded denominators for precision
            let bestFractionText = '';
            let bestNumerator = 0;
            let bestDenominator = 1;
            let foundFraction = false;

            if (fraction > tolerance) { // Only calculate fraction if there's a fractional part
                for (let i = 0; i < denominators.length; i++) {
                    const d = denominators[i];
                    const n = Math.round(fraction * d);
                    // Check for a very close match
                    if (Math.abs(fraction - n / d) < tolerance) {
                        bestNumerator = n;
                        bestDenominator = d;
                        foundFraction = true;
                        break; // Found a good enough fraction, exit loop
                    }
                }

                if (foundFraction) {
                    // Reduce fraction to simplest form (e.g., 2/4 becomes 1/2)
                    let gcdVal = gcd(bestNumerator, bestDenominator);
                    bestNumerator /= gcdVal;
                    bestDenominator /= gcdVal;

                    if (bestNumerator !== 0) { // Avoid "0/X"
                        bestFractionText = `${bestNumerator}/${bestDenominator}`;
                    }
                } else {
                    // If no exact fraction is found within tolerance, return as a decimal
                    // This is key to prevent 0.25 from becoming 0
                    return num.toFixed(2).replace(/\.00$/, ''); // Format to 2 decimal places, remove trailing .00
                }
            }


            if (whole > 0 && bestFractionText) {
                return `${whole} ${bestFractionText}`;
            } else if (bestFractionText) {
                return bestFractionText;
            } else if (whole > 0) {
                return whole.toString();
            } else {
                // If it's a very small number that couldn't be cleanly converted to a fraction,
                // return it as a decimal, possibly with limited precision.
                if (num > 0) {
                    return num.toFixed(2).replace(/\.00$/, ''); // Show as decimal, e.g., "0.25"
                }
                return '0'; // If num is exactly 0
            }
        }


        // Helper function to calculate Greatest Common Divisor (GCD) for reducing fractions
        function gcd(a, b) {
            return b === 0 ? a : gcd(b, a % b);
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
