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

        // Function to format quantities (e.g., 0.5 to 1/2)
        function formatQuantity(num) {
            if (num === 0.25) return '1/4';
            if (num === 0.5) return '1/2';
            if (num === 0.75) return '3/4';
            if (num === 0.3333333333333333) return '1/3';
            if (num === 0.6666666666666666) return '2/3';
            if (num % 1 === 0) return num.toString(); // Whole number
            return num.toFixed(2).replace(/\.00$/, ''); // Rounds to 2 decimal places, removes .00 if whole
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
