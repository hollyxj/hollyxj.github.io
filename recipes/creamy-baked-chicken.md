---
layout: default
title: Creamy Baked Chicken
categories:
  - INSERT
  - INSERT
original_servings: INSERT
ingredients_data:
  - id: chicken
    quantity: 4
    unit: 
    item: chicken breasts
  - id: cheese
    quantity: 8
    unit: slices
    item: Swiss cheese
  - id: creamofchickensoup
    quantity: 1
    unit: can
    item: cream of chicken soup, undiluted
  - id: wine
    quantity: 0.25
    unit: c
    item: white wine
  - id: stuffing
    quantity: 1
    unit: cup
    item: herb seasoned stuffing mix, crushed
  - id: butter
    quantity: 0.25
    unit: cup
    item: butter, melted
---

# Creamy Baked Chicken

<p>
  Source: <a href="INSERTLINK" target="_blank" rel="noopener noreferrer">INSERT</a>
</p>

<div class="servings-spinner-container">
    <label for="servings-input">Servings:</label>
    <button id="decrease-servings">-</button>
    <input type="number" id="servings-input" value="8" min="1" max="99">
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
1. Arrange chicken in pan, sprayed with Pam or lightly greased.
2. Top with <span class="inst-quantity" data-ingredient-id="cheese">8</span> slices Swiss cheese
3. Combine <span class="inst-quantity" data-ingredient-id="creamofchickensoup">1</span> can cream of chicken soup
and <span class="inst-quantity" data-ingredient-id="creamofchickensoup">0.25</span> cups white wine. Spoon evently over chicken.
4. Sprinkle with stuffing mix and pour <span class="inst-quantity" data-ingredient-id="butter">0.25</span> cups melted butter over all.
5. Bake at 350°F (175°C) for 45-55 minutes. 

[Back to All Recipes](/recipes/)
