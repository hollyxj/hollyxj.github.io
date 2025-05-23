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
  - id: 
    quantity: 
    unit: 
    item: 
  - id: 
    quantity: 
    unit: 
    item:
  - id: 
    quantity: 
    unit: 
    item:
  - id: 
    quantity: 
    unit: 
    item:
  - id: 
    quantity: 
    unit: 
    item:
  - id: 
    quantity: 
    unit: 
    item:
---
<span class="inst-quantity" data-ingredient-id="insert">1</span> 

<p>
  Source: <a href="INSERTLINK" target="_blank" rel="noopener noreferrer">INSERT</a>
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
1.  

Bake at 350°F (175°C) for 50 minutes.


[Back to All Recipes](/recipes/)
