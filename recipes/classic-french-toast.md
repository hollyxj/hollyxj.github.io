---
layout: default
title: Classic French Toast
categories:
  - breakfast
  - brunch
original_servings: 4
ingredients_data: # Define ingredient data
  - id: egg # Unique identifier for referencing
    quantity: 1
    unit: "" # No unit needed for egg
    item: egg
  - id: vanilla
    quantity: 1
    unit: teaspoon
    item: vanilla extract
  - id: cinnamon
    quantity: 0.5
    unit: teaspoon
    item: ground cinnamon
  - id: milk
    quantity: 0.25
    unit: cup
    item: milk
  - id: bread
    quantity: 4
    unit: slices
    item: brioche bread
---

# Classic French Toast

<p>
  Source: <a href="https://www.mccormick.com/recipes/breakfast-brunch/quick-and-easy-french-toast" target="_blank" rel="noopener noreferrer">McCormick®</a>
</p>

<div class="servings-spinner-container">
    <label for="servings-input">Servings:</label>
    <button id="decrease-servings">-</button>
    <input type="number" id="servings-input" value="4" min="1" max="99">
    <button id="increase-servings">+</button>
</div>

## Ingredients

<ul class="ingredient-list">
  {% for ingredient in page.ingredients_data %}
  <li data-ingredient-id="{{ ingredient.id }}" data-original-quantity="{{ ingredient.quantity }}">
    <input type="checkbox" id="ingredient{{ forloop.index }}" name="ingredient{{ forloop.index }}">
    <label for="ingredient{{ forloop.index }}">
      <span class="ingredient-quantity">
        {% if ingredient.quantity %}{{ ingredient.quantity }}{% endif %}
      </span>
      {% if ingredient.unit %}{{ ingredient.unit }} {% endif %}
      <span class="ingredient-item">{{ ingredient.item }}</span>
    </label>
  </li>
  {% endfor %}
</ul>

## Instructions
Test 1 
1. Whisk <span id="inst-egg-qty" data-ingredient-id="egg">1</span> egg,
   <span id="inst-vanilla-qty" data-ingredient-id="vanilla">1</span> tsp vanilla and
   <span id="inst-cinnamon-qty" data-ingredient-id="cinnamon">0.5</span> tsp cinnamon in shallow dish.
   Stir in <span id="inst-milk-qty" data-ingredient-id="milk">0.25</span> c milk.

2. Dip <span class="inst-quantity" data-ingredient-id="bread">4</span> slices brioche bread in egg mixture, turning to coat evenly on both sides.

3. Cook bread slices on lightly greased nonstick griddle or skillet on medium heat until cooked through and browned on both sides. Serve with Easy Spiced Syrup (recipe follows), if desired. Voila, easy French toast.

[Back to Recipes Index](/recipes/)
