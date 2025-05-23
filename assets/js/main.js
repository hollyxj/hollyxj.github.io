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
    const ingredientListElement = document.querySelector('.ingredient-list'); // Used to select all 'li' elements with data-original-quantity
    const instructionQuantitySpans = document.querySelectorAll('.inst-quantity');
    const resetButton = document.getElementById('reset-servings'); // Get the new reset button

    // *** DEBUGGING: Check if resetButton element is found ***
    console.log('resetButton element:', resetButton);
    // *** END DEBUGGING ***

    // Ensure all necessary elements for the spinner logic are found before proceeding
    // This check is important as not all pages will have a spinner or ingredient list
    if (servingsInput && decreaseButton && increaseButton && ingredientListElement) {
        // originalServings is read from the body's data attribute, set in default.html
        const originalServings = parseFloat(document.querySelector('body').dataset.originalServings);
        let currentServings = originalServings;

        // Get all ingredient <li> items that have the data-original-quantity attribute
        // This relies on the Liquid loop in your recipe Markdown files
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
            'pieces': 'pieces', // Added for "pieces" unit, e.g., for chicken breasts
            'pound': 'pound',
            'pounds': 'pounds',
            'oz': 'oz', // Short for ounce, for cream of chicken soup
            'as needed': 'as needed', // For paprika
            '': '' // For cases where no unit is specified (e.g., egg)
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
                const originalQuantity = parseFloat(li.dataset.original-quantity); // Typo here, should be 'originalQuantity'
                const originalUnit = li.dataset.originalUnit ? li.dataset.originalUnit.toLowerCase() : '';
                const quantitySpan = li.querySelector('.ingredient-quantity');
                const unitSpan = li.querySelector('.ingredient-unit');

                if (!isNaN(originalQuantity) && quantitySpan) {
                    const newQuantity = originalQuantity * scalingFactor;
                    let formatted;

                    // Special handling for count units (eggs, slices, pieces) - always round to nearest whole number
                    if (originalUnit === 'egg' || originalUnit === 'slices' || originalUnit === 'slice' || originalUnit === 'pieces') {
                        formatted = {
                            quantity: Math.round(newQuantity).toString(), // Round to nearest whole number
                            unit: preferredUnits[originalUnit] || originalUnit
                        };
                        // Pluralization
                        if (originalUnit === 'egg' && Math.round(newQuantity) !== 1) {
                             formatted.unit = 'eggs';
                        } else if (originalUnit === 'slice' && Math.round(newQuantity) !== 1) {
                            formatted.unit = 'slices';
                        } else if (originalUnit === 'slices' && Math.round(newQuantity) === 1) { // If original was 'slices' but new is 1
                            formatted.unit = 'slice';
                        } else if (originalUnit === 'piece' && Math.round(newQuantity) !== 1) {
                            formatted.unit = 'pieces';
                        } else if (originalUnit === 'pieces' && Math.round(newQuantity) === 1) { // If original was 'pieces' but new is 1
                            formatted.unit = 'piece';
                        }
                    } else if (isLiquidVolumeUnit(originalUnit)) {
                        formatted = formatQuantityWithConversion(newQuantity, originalUnit);
                    } else {
                        // For non-liquid, non-count units (like pounds, oz, as needed), just format the number (no aggressive rounding or unit conversion)
                        formatted = {
                            quantity: formatToFraction(newQuantity),
                            unit: preferredUnits[originalUnit] || originalUnit
                        };
                        // Specific pluralization for 'pound'
                        if (originalUnit === 'pound' && newQuantity !== 1) {
                            formatted.unit = 'pounds';
                        } else if (originalUnit === 'pounds' && newQuantity === 1) {
                            formatted.unit = 'pound';
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
                const matchingIngredientData = document.querySelector(`li[data-ingredient-id="${ingredientId}"]`);

                if (matchingIngredientData) {
                    const originalQuantity = parseFloat(matchingIngredientData.dataset.original-quantity); // Typo here, should be 'originalQuantity'
                    const originalUnit = matchingIngredientData.dataset.originalUnit ? matchingIngredientData.dataset.originalUnit.toLowerCase() : '';

                    if (!isNaN(originalQuantity)) {
                        const newQuantity = originalQuantity * scalingFactor;
                        let formatted;

                        // Same special handling for count units in instructions
                        if (originalUnit === 'egg' || originalUnit === 'slices' || originalUnit === 'slice' || originalUnit === 'pieces') {
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
        function formatQuantityWithConversion(num, unit) {
            if (num === 0) return { quantity: '0', unit: preferredUnits[unit] || unit };

            if (!isLiquidVolumeUnit(unit)) {
                return { quantity: formatToFraction(num), unit: preferredUnits[unit] || unit };
            }

            let bestQuantity = num;
            let bestUnit = unit;
            let bestSimplicity = Infinity;

            // First, evaluate the original unit itself without conversion
            const initialScore = num % 1 === 0 ? 1 : (formatToFraction(num).includes('/') ? 10 : 50);
            bestSimplicity = initialScore;

            // Iterate through liquid units in reverse (largest to smallest) to find the best conversion
            const liquidUnitsSorted = Object.keys(conversions.liquid).sort((a, b) => conversions.liquid[b] - conversions.liquid[a]);

            for (const targetUnit of liquidUnitsSorted) {
                const targetUnitBaseValue = conversions.liquid[targetUnit];
                const currentUnitBaseValue = conversions.liquid[unit];

                if (!targetUnitBaseValue || !currentUnitBaseValue) continue;

                const convertedValue = (num * currentUnitBaseValue) / targetUnitBaseValue;

                let currentSimplicity = Infinity;
                if (convertedValue % 1 === 0) {
                    currentSimplicity = 1;
                } else {
                    const fractionText = formatToFraction(convertedValue);
                    if (fractionText.includes('/')) {
                        const parts = fractionText.split(' ');
                        const frac = parts.length > 1 ? parts[1] : parts[0];
                        const denom = parseInt(frac.split('/')[1]);
                        if (denom === 2 || denom === 4) currentSimplicity = 10;
                        else if (denom === 3 || denom === 8) currentSimplicity = 20;
                        else currentSimplicity = 50;
                    } else {
                        currentSimplicity = 100;
                    }
                }

                if (currentSimplicity < bestSimplicity) {
                    bestSimplicity = currentSimplicity;
                    bestQuantity = convertedValue;
                    bestUnit = targetUnit;
                }
            }

            return {
                quantity: formatToFraction(bestQuantity),
                unit: preferredUnits[bestUnit] || bestUnit
            };
        }


        // Original formatToFraction function (no aggressive rounding)
        function formatToFraction(num) {
            if (num === 0) return '0';

            const tolerance = 0.000001;
            const whole = Math.floor(num);
            let fraction = num - whole;

            const denominators = [2, 3, 4, 5, 6, 8, 10, 12, 16, 32];
            let bestFractionText = '';
            let bestNumerator = 0;
            let bestDenominator = 1;
            let foundFraction = false;

            if (fraction > tolerance) {
                for (let i = 0; i < denominators.length; i++) {
                    const d = denominators[i];
                    const n = Math.round(fraction * d);
                    if (Math.abs(fraction - n / d) < tolerance) {
                        bestNumerator = n;
                        bestDenominator = d;
                        foundFraction = true;
                        break;
                    }
                }

                if (foundFraction) {
                    let gcdVal = gcd(bestNumerator, bestDenominator);
                    bestNumerator /= gcdVal;
                    bestDenominator /= gcdVal;

                    if (bestNumerator !== 0) {
                        bestFractionText = `${bestNumerator}/${bestDenominator}`;
                    }
                } else {
                    return num.toFixed(2).replace(/\.00$/, '');
                }
            }

            if (whole > 0 && bestFractionText) {
                return `${whole} ${bestFractionText}`;
            } else if (bestFractionText) {
                return bestFractionText;
            } else if (whole > 0) {
                return whole.toString();
            } else {
                if (num > 0) {
                    return num.toFixed(2).replace(/\.00$/, '');
                }
                return '0';
            }
        }

        // Helper function to calculate Greatest Common Divisor (GCD) for reducing fractions
        function gcd(a, b) {
            return b === 0 ? a : gcd(b, a % b);
        }

        // Event Listeners for buttons and input
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

        // Event listener for the "Default" button
        if (resetButton) { // Ensure the reset button exists on the page
            // *** DEBUGGING: Confirm reset button found ***
            console.log('Reset button found, adding event listener.');
            // *** END DEBUGGING ***
            resetButton.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent the link from navigating or jumping
                currentServings = originalServings; // Reset currentServings to the original
                servingsInput.value = currentServings; // Update the input field
                updateQuantities(); // Recalculate and display ingredient quantities
                // *** DEBUGGING: Confirm click registered and value reset ***
                console.log('Default button clicked, servings reset to:', currentServings);
                // *** END DEBUGGING ***
            });
        }
        
        // Initialize quantities on page load
        updateQuantities();
    } else {
        // *** DEBUGGING: Log if critical spinner elements are not found ***
        console.log('Spinner or ingredient list elements not found on this page. Spinner logic will not execute.');
        console.log('servingsInput:', servingsInput);
        console.log('decreaseButton:', decreaseButton);
        console.log('increaseButton:', increaseButton);
        console.log('ingredientListElement:', ingredientListElement);
        // *** END DEBUGGING ***
    }
});
