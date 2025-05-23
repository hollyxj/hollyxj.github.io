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
    item: Milk
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
1. Whisk {% assign egg_data = page.ingredients_data | where:"id","egg" | first %}
   {% if egg_data %}{{ egg_data.quantity }}{% endif %}
   {% if egg_data.unit %}{{ egg_data.unit }} {% endif %}
   {{ egg_data.item | downcase }},
   {% assign vanilla_data = page.ingredients_data | where:"id","vanilla" | first %}
   {% if vanilla_data %}{{ vanilla_data.quantity }}{% endif %}
   {% if vanilla_data.unit %} {{ vanilla_data.unit }} {% endif %}
   {{ vanilla_data.item | downcase }} and
   {% assign cinnamon_data = page.ingredients_data | where:"id","cinnamon" | first %}
   {% if cinnamon_data %}{{ cinnamon_data.quantity }}{% endif %}
   {% if cinnamon_data.unit %} {{ cinnamon_data.unit }} {% endif %}
   {{ cinnamon_data.item | downcase }} in shallow dish.
   Stir in {% assign milk_data = page.ingredients_data | where:"id","milk" | first %}
   {% if milk_data %}{{ milk_data.quantity }}{% endif %}
   {% if milk_data.unit %} {{ milk_data.unit }} {% endif %}
   {{ milk_data.item | downcase }}.

2. Dip {% assign bread_data = page.ingredients_data | where:"id","bread" | first %}
   {% if bread_data %}{{ bread_data.quantity }}{% endif %}
   {% if bread_data.unit %} {{ bread_data.unit }} {% endif %}
   {{ bread_data.item | downcase }} in egg mixture, turning to coat evenly on both sides.

3. Cook bread slices on lightly greased nonstick griddle or skillet on medium heat until cooked through and browned on both sides. Serve with Easy Spiced Syrup (recipe follows), if desired. Voila, easy French toast.

[Back to Recipes Index](/recipes/)
