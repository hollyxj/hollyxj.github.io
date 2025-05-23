document.addEventListener('DOMContentLoaded', function() {
    // --- Checkbox Logic (unchanged) --- ---
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
                            quantity: Math.round(newQuantity).toString(), // Ensure it's a string
                            unit: preferredUnits[originalUnit] || originalUnit
                        };
                        // Pluralization
                        if (originalUnit === 'egg' && Math.round(newQuantity) !== 1) {
                            formatted.unit = 'eggs';
                        } else if (originalUnit === 'slices' && Math.round(newQuantity) === 1) {
                            formatted.unit = 'slice';
                        } else if (originalUnit === 'slice' && Math.round(newQuantity) !== 1) {
                            formatted.unit = 'slices';
                        }
                    } else if (isLiquidVolumeUnit(originalUnit)) {
                        formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                    } else {
                        // For other non-liquid, non-count units, just format as fraction
                        formatted = {
                            quantity: formatToFraction(newQuantity, true), // Apply aggressive rounding for display
                            unit: preferredUnits[originalUnit] || originalUnit
                        };
                    }

                    quantitySpan.textContent = formatted.quantity;
                    if (unitSpan) {
                        unitSpan.textContent = formatted.unit ? `${formatted.unit} ` : '';
                    }
                }
            });

            instructionQuantitySpans.forEach(span => {
                const ingredientId = span.dataset.ingredientId;
                const originalUnit = span.dataset.originalUnit ? span.dataset.originalUnit.toLowerCase() : '';
                const matchingIngredientData = document.querySelector(`li[data-ingredient-id="${ingredientId}"]`);

                if (matchingIngredientData) {
                    const originalQuantity = parseFloat(matchingIngredientData.dataset.originalQuantity);
                    if (!isNaN(originalQuantity)) {
                        const newQuantity = originalQuantity * scalingFactor;
                        let formatted;

                        if (originalUnit === 'egg' || originalUnit === 'slices' || originalUnit === 'slice') {
                            formatted = {
                                quantity: Math.round(newQuantity).toString(),
                                unit: originalUnit // Keep original unit text from instruction HTML
                            };
                        } else if (isLiquidVolumeUnit(originalUnit)) {
                            formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                        } else {
                             formatted = {
                                quantity: formatToFraction(newQuantity, true),
                                unit: originalUnit
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

            // If it's not a liquid volume unit (already handled count units above)
            if (!isLiquidVolumeUnit(unit)) {
                return { quantity: formatToFraction(num, true), unit: preferredUnits[unit] || unit };
            }

            const niceDenominators = [2, 3, 4, 8, 16];
            const tolerance = 0.00001;

            let bestResult = {
                quantity: formatToFraction(num, true), // Default to original unit, with aggressive rounding
                unit: preferredUnits[unit] || unit,
                simplicityScore: calculateFractionSimplicity(num, unit, conversions.liquid[unit], niceDenominators)
            };

            const liquidUnitsSorted = Object.keys(conversions.liquid).sort((a, b) => conversions.liquid[b] - conversions.liquid[a]);

            for (const targetUnit of liquidUnitsSorted) {
                const targetUnitBaseValue = conversions.liquid[targetUnit];
                const currentUnitBaseValue = conversions.liquid[unit];

                if (!targetUnitBaseValue || !currentUnitBaseValue) continue;

                const convertedValue = (num * currentUnitBaseValue) / targetUnitBaseValue;

                // Calculate simplicity score for this conversion, allowing for aggressive rounding
                const currentSimplicity = calculateFractionSimplicity(convertedValue, targetUnit, targetUnitBaseValue, niceDenominators);

                // If this conversion results in a "nicer" measurement, update bestResult
                if (currentSimplicity < bestResult.simplicityScore) {
                    bestResult = {
                        quantity: formatToFraction(convertedValue, true), // Always format with aggressive rounding for comparison
                        unit: preferredUnits[targetUnit] || targetUnit,
                        simplicityScore: currentSimplicity
                    };
                }
            }

            // If bestResult found no better conversion (score remained the same high value),
            // ensure we don't convert to 'teaspoon' if the original unit was reasonable and preferred
            if (bestResult.unit === 'teaspoon' && preferredUnits[unit] !== 'teaspoon' && bestResult.simplicityScore > 100) {
                 return { quantity: formatToFraction(num, true), unit: preferredUnits[unit] || unit };
            }

            return {
                quantity: formatToFraction(parseFloat(bestResult.quantity.replace(' ', '+')), true),
                unit: bestResult.unit
            };
        }


        // Helper function to calculate a "simplicity score" for a quantity
        function calculateFractionSimplicity(value, unit, unitBaseValue, niceDenominators) {
            if (value === 0) return 0;
            if (value % 1 === 0) return 1; // Whole numbers are simplest

            const whole = Math.floor(value);
            const fraction = value - whole;

            let bestScore = Infinity;

            for (let d of niceDenominators) {
                const n = Math.round(fraction * d);
                // Increased tolerance for "niceness" to encourage rounding to common fractions
                if (Math.abs(fraction - n / d) < 0.05) { // Original 0.05, try 0.04 or 0.03 for tighter rounding
                    const currentScore = d;
                    if (currentScore < bestScore) {
                        bestScore = currentScore;
                    }
                }
            }

            if (bestScore === Infinity) {
                // If no nice fraction found, return a high score, but not infinitely high if it's measurable
                return 500; // Use a slightly lower high score than before
            }

            // Slight penalty for changing from a generally preferred unit (e.g. cup) to a less preferred unit (e.g. tbsp)
            // unless the new quantity is significantly simpler.
            const preferredUnitScore = {
                'cup': 10, 'c': 10,
                'tablespoon': 20, 'tbsp': 20,
                'teaspoon': 30, 'tsp': 30,
                'fluid ounce': 25, 'fl oz': 25
            };
            let unitPenalty = 0;
            if (preferredUnitScore[unit]) {
                unitPenalty = preferredUnitScore[unit];
            }

            return bestScore + unitPenalty;
        }


        // Modified formatToFraction function to allow aggressive rounding for display
        // `aggressiveRounding` parameter: if true, will round to closest "nice" fraction.
        function formatToFraction(num, aggressiveRounding = false) {
            if (num === 0) return '0';

            const tolerance = 0.000001; // Very tight tolerance for exact match
            const whole = Math.floor(num);
            let fraction = num - whole;

            const commonDenominators = [2, 3, 4, 8, 16]; // Common culinary denominators
            let bestFractionText = '';
            let bestNumerator = 0;
            let bestDenominator = 1;
            let minDiff = Infinity;

            // Handle very small numbers that should be rounded up to the smallest measurable unit
            if (num > 0 && num < 0.125 && aggressiveRounding) { // If less than 1/8 (or adjust this threshold)
                // Try to round up to 1/8 or 1/4 directly
                if (num > 0.01 && num <= 0.2) { // Example: 0.05 to 1/8, 0.1 to 1/8, 0.2 to 1/4
                     if (num < 0.08) return '1/8'; // For tiny amounts, round to 1/8
                     return '1/4'; // For slightly larger tiny amounts, round to 1/4
                }
                // Fallback to a very small decimal if too small for fraction (e.g. 0.001)
                // Or if it's truly too small to measure, return a dash or 'pinch' (requires more complex logic)
                return num.toFixed(2).replace(/\.00$/, ''); // Keep small decimals like 0.05
            }

            if (fraction > tolerance) {
                for (let d of commonDenominators) {
                    const n = Math.round(fraction * d);
                    const currentDiff = Math.abs(fraction - n / d);

                    // If it's very close (within a comfortable rounding margin)
                    if (currentDiff < 0.02) { // Adjusted tolerance, e.g., 0.02 means within 2/100ths
                        if (currentDiff < minDiff) {
                            minDiff = currentDiff;
                            bestNumerator = n;
                            bestDenominator = d;
                        }
                    } else if (currentDiff < tolerance && bestDenominator > d) { // Prefer smaller denominators for exact matches
                        minDiff = currentDiff;
                        bestNumerator = n;
                        bestDenominator = d;
                    }
                }

                if (minDiff < Infinity) { // If we found any potential fraction
                    let gcdVal = gcd(bestNumerator, bestDenominator);
                    bestNumerator /= gcdVal;
                    bestDenominator /= gcdVal;
                    // If after rounding and reducing, the fraction is meaningful
                    if (bestNumerator !== 0 && bestDenominator !== 0) {
                        bestFractionText = `${bestNumerator}/${bestDenominator}`;
                    }
                }
            }

            if (whole > 0 && bestFractionText && bestNumerator !== 0) {
                return `${whole} ${bestFractionText}`;
            } else if (bestFractionText && bestNumerator !== 0) {
                return bestFractionText;
            } else if (whole > 0) {
                return whole.toString();
            } else {
                // If it's a very small number that couldn't be cleanly converted to a fraction,
                // return it as a decimal, possibly with limited precision.
                // This prevents 0.05 from becoming "0".
                if (num > 0) {
                    return num.toFixed(2).replace(/\.00$/, ''); // Show as decimal, e.g., "0.25"
                }
                return '0';
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
