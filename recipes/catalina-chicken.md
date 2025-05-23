---
layout: default
title: Grandma's Catalina Chicken
categories:
  - dinner
original_servings: 6
ingredients_data:
  - id: chicken
    quantity: 3
    unit: pounds
    item: chicken breast
  - id: dressing
    quantity: 8
    unit: oz
    item: Catalina French dressing
  - id: onionsoupmix 
    quantity: 8
    unit: oz
    item: Lipton onion soup mix
  - id: peachpreserves
    quantity: 10
    unit: oz
    item: peach preserves
---

<p>
  Source: Grandma
</p>

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
1. Remove skin from chicken. Place in shallow roasting pan.
2. Combine 
   <span class="inst-quantity" data-ingredient-id="dressing">8</span> oz Catalina French dressing, 
   <span class="inst-quantity" data-ingredient-id="onionsoupmix">8</span> oz Lipton onion soup mix, and
   <span class="inst-quantity" data-ingredient-id="peachpreserves">10</span> oz peach preserves. Pour over chicken.
3. Bake at 350°F (175°C) for 50 minutes.



[Back to All Recipes](/recipes/)
