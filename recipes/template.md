---
layout: default
title: INSERT
categories:
  - INSERT
  - INSERT
original_servings: INSERT
ingredients_data:
  - id: INSERT
    quantity: 1
    unit: teaspoon
    item: INSERT
  - id: egg
    quantity: 1
    unit: "" # No unit needed for egg
    item: egg

---

# INSERT RECIPE NAME

<p>
  Source: <a href="INSERTLINK" target="_blank" rel="noopener noreferrer">INSERT</a>
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
1.  
   <span class="inst-quantity" data-ingredient-id="vanilla">1</span> tsp vanilla and
   <span class="inst-quantity" data-ingredient-id="cinnamon">0.5</span> tsp cinnamon in shallow dish.



[Back to Recipes Index](/recipes/)
