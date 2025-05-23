---
layout: default
title: Classic French Toast
categories:
  - breakfast
  - brunch
ingredients_data: # Define your ingredient data here
  - id: egg # Unique identifier for referencing
    quantity: 1
    unit: "" # No unit needed for egg
    item: egg
  - id: vanilla
    quantity: 1
    unit: teaspoon
    item: Vanilla Extract
  - id: cinnamon
    quantity: 1/2
    unit: teaspoon
    item: Ground Cinnamon
  - id: milk
    quantity: 1/4
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

## Ingredients

<ul class="ingredient-list">
  {% for ingredient in page.ingredients_data %}
  <li>
    <input type="checkbox" id="ingredient{{ forloop.index }}" name="ingredient{{ forloop.index }}">
    <label for="ingredient{{ forloop.index }}">
      {% if ingredient.quantity %}{{ ingredient.quantity }}{% endif %}
      {% if ingredient.unit %}{{ ingredient.unit }} {% endif %}
      {{ ingredient.item }}
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
