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

        // Function to update quantities for both ingredient list and instructions (unchanged)
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

                    if (isLiquidVolumeUnit(originalUnit)) {
                        formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                    } else {
                        formatted = {
                            quantity: formatToFraction(Math.round(newQuantity), true), // Round to nearest whole number for count units
                            unit: preferredUnits[originalUnit] || originalUnit
                        };
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
                            formatted = {
                                quantity: formatToFraction(Math.round(newQuantity), true),
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

            let workingUnit = unit;
            let workingValue = num; // Current value in original unit

            // Only proceed with conversion if the unit is a known liquid volume unit
            if (!isLiquidVolumeUnit(unit)) {
                // If it's not a liquid volume unit, just format the number and return the original unit
                return { quantity: formatToFraction(num, true), unit: preferredUnits[unit] || unit };
            }

            // --- Conversion Strategy ---
            // 1. Try to convert to the largest unit that results in a "nice" whole number or common fraction.
            // 2. If no ideal larger unit, try to convert to a smaller unit (e.g., cups to tablespoons if it makes sense).
            // 3. Fallback to formatting in the original unit with simplified fractions.

            // Define "nice" denominators for fractions (prioritize smaller denominators)
            const niceDenominators = [2, 3, 4, 8, 16]; // Common cooking fractions
            const tolerance = 0.00001; // For float comparisons

            let bestResult = {
                quantity: formatToFraction(num, false), // Default to original unit, exact fraction
                unit: preferredUnits[unit] || unit,
                simplicityScore: calculateFractionSimplicity(num, unit, conversions.liquid[unit], niceDenominators) // Lower is better
            };

            // Iterate through all possible liquid units (largest to smallest)
            const liquidUnitsSorted = Object.keys(conversions.liquid).sort((a, b) => conversions.liquid[b] - conversions.liquid[a]);

            for (const targetUnit of liquidUnitsSorted) {
                const targetUnitBaseValue = conversions.liquid[targetUnit]; // e.g., 48 for 'cup'
                const currentUnitBaseValue = conversions.liquid[unit]; // e.g., 1 for 'teaspoon'

                // Skip if current unit cannot be converted to target unit
                if (!targetUnitBaseValue || !currentUnitBaseValue) continue;

                // Value of the ingredient in the target unit
                const convertedValue = (num * currentUnitBaseValue) / targetUnitBaseValue;

                // Calculate simplicity score for this conversion
                const currentSimplicity = calculateFractionSimplicity(convertedValue, targetUnit, targetUnitBaseValue, niceDenominators);

                // If this conversion results in a "nicer" measurement, update bestResult
                if (currentSimplicity < bestResult.simplicityScore) {
                    bestResult = {
                        quantity: formatToFraction(convertedValue, false), // Use exact fraction for comparison, then simplify
                        unit: preferredUnits[targetUnit] || targetUnit,
                        simplicityScore: currentSimplicity
                    };
                }
            }

            // Final formatting, applying rounding for display
            return {
                quantity: formatToFraction(parseFloat(bestResult.quantity.replace(' ', '+')), true), // Convert to float, then simplify
                unit: bestResult.unit
            };
        }

        // Helper function to calculate a "simplicity score" for a quantity
        // Lower score means simpler/nicer
        function calculateFractionSimplicity(value, unit, unitBaseValue, niceDenominators) {
            if (value === 0) return 0;
            if (value % 1 === 0) return 1; // Whole numbers are simplest

            const whole = Math.floor(value);
            const fraction = value - whole;

            let bestScore = Infinity;

            for (let d of niceDenominators) {
                const n = Math.round(fraction * d);
                // If it's very close to a nice fraction
                if (Math.abs(fraction - n / d) < 0.05) { // Tolerance for rounding to a nice fraction
                    const currentScore = d; // Use denominator as score, smaller is better
                    if (currentScore < bestScore) {
                        bestScore = currentScore;
                    }
                }
            }

            // If no nice fraction found within tolerance, give a high score
            if (bestScore === Infinity) {
                return 1000; // Arbitrary high score for complex fractions
            }

            // Add a penalty for changing units if the current unit is already "nice"
            // This prevents converting a perfect 1/2 cup to 8 tablespoons if 1/2 cup is preferred.
            if (unitBaseValue && niceDenominators.includes(unitBaseValue)) { // If current unit is already a simple base (e.g., cup, tbsp)
                 bestScore -= 0.5; // Slight bonus for staying in current unit if it's already "nice"
            }

            return bestScore;
        }


        // Modified formatToFraction function to allow aggressive rounding for display
        // `aggressiveRounding` parameter: if true, will round to closest "nice" fraction.
        function formatToFraction(num, aggressiveRounding = false) {
            if (num === 0) return '0';

            const tolerance = 0.00001; // For exact floating point comparisons
            const whole = Math.floor(num);
            let fraction = num - whole;

            // Define common culinary denominators for "nice" fractions
            const commonDenominators = [2, 3, 4, 8, 16]; // Prioritize these

            let bestFractionText = '';
            let bestNumerator = 0;
            let bestDenominator = 1;
            let minDiff = Infinity; // To find the closest fraction

            if (fraction > tolerance) { // Only calculate fraction if there's a fractional part
                for (let d of commonDenominators) {
                    const n = Math.round(fraction * d);
                    const currentDiff = Math.abs(fraction - n / d);

                    if (currentDiff < minDiff) {
                        minDiff = currentDiff;
                        bestNumerator = n;
                        bestDenominator = d;
                    }
                }

                // If aggressive rounding is on, and we're within a reasonable tolerance
                // (e.g., within 1/32nd of a whole or 0.03 for 1/3), use the "nicer" fraction.
                // Or if we found a perfect match.
                if (aggressiveRounding && minDiff < 0.03) { // Adjust this tolerance (e.g., 0.02 for tighter rounding)
                    let gcdVal = gcd(bestNumerator, bestDenominator);
                    bestNumerator /= gcdVal;
                    bestDenominator /= gcdVal;
                    bestFractionText = `${bestNumerator}/${bestDenominator}`;
                } else if (minDiff < tolerance) { // Exact match (original behavior)
                    let gcdVal = gcd(bestNumerator, bestDenominator);
                    bestNumerator /= gcdVal;
                    bestDenominator /= gcdVal;
                    bestFractionText = `${bestNumerator}/${bestDenominator}`;
                } else {
                    // Fallback if not aggressively rounding or not close enough to a common fraction
                    // This will result in weird fractions like 7/16 if not caught by aggressive rounding
                    // You might adjust the denominators array or tolerance here.
                    const d = 16; // Default to 16ths if no common fraction is close enough
                    const n = Math.round(fraction * d);
                    let gcdVal = gcd(n, d);
                    bestNumerator = n / gcdVal;
                    bestDenominator = d / gcdVal;
                    if (bestNumerator !== 0 && bestDenominator !== 0) { // Avoid 0/X
                        bestFractionText = `${bestNumerator}/${bestDenominator}`;
                    } else {
                        bestFractionText = ''; // No meaningful fraction
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
                // If no whole part, no meaningful fraction, return '0' or a small decimal
                // For very small numbers that don't fit fractions, you might just want '0' or 'a dash'
                return '0'; // If it's less than a measurable fraction, just call it 0
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
