---
layout: default
title: Creamy Baked Chicken Breast
categories:
  - dinner
original_servings: 8
ingredients_data:
  - id: chicken_breast
    quantity: 4
    unit: pieces
    item: chicken breasts, skinned, boned, and split
  - id: swiss_cheese
    quantity: 8
    unit: slices
    item: Swiss cheese (4x4 slices)
  - id: cream_of_chicken_soup
    quantity: 10.75 # Assuming standard 10.75 oz can size
    unit: oz
    item: can cream of chicken soup, undiluted
  - id: white_wine
    quantity: 0.25
    unit: cup
    item: white wine
  - id: stuffing_mix
    quantity: 1
    unit: cup
    item: herb seasoned stuffing mix, crushed
  - id: oleo
    quantity: 0.25
    unit: cup
    item: oleo (margarine), melted
---

# Creamy Baked Chicken Breast

A delightfully simple and comforting chicken dish from Grandma, baked until tender in a creamy sauce with a savory stuffing topping.

## Ingredients

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

1.  Preheat oven to 350°F (175°C).
2.  Arrange <span class="inst-quantity" data-ingredient-id="chicken_breast">4</span> chicken breasts in a baking pan that has been sprayed with cooking spray (like Pam) or lightly greased.
3.  Top each chicken breast with <span class="inst-quantity" data-ingredient-id="swiss_cheese">8</span> slices of Swiss cheese.
4.  In a separate bowl, combine the <span class="inst-quantity" data-ingredient-id="cream_of_chicken_soup">10.75 oz</span> cream of chicken soup and <span class="inst-quantity" data-ingredient-id="white_wine">0.25 cup</span> white wine, stirring well until fully combined.
5.  Spoon this soup and wine mixture evenly over the chicken breasts.
6.  Sprinkle the <span class="inst-quantity" data-ingredient-id="stuffing_mix">1 cup</span> herb seasoned stuffing mix over the top of the chicken and sauce.
7.  Pour the <span class="inst-quantity" data-ingredient-id="oleo">0.25 cup</span> melted oleo (margarine) evenly over everything.
8.  Bake in the preheated oven at 350°F (175°C) for 45 to 55 minutes, or until the chicken is cooked through and tender.
9.  This recipe yields <span class="inst-quantity" data-original-quantity="8" data-original-unit="servings" data-ingredient-id="servings">8</span> servings.
