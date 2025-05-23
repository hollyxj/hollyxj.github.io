---
layout: default
title: Grandma's Caraway Pork Chops
categories:
  - dinner
original_servings: 6
ingredients_data:
  - id: pork_chops
    quantity: 6
    unit: pieces
    item: pork chops (about 6 or so)
  - id: paprika
    quantity: 0
    unit: as needed
    item: paprika
  - id: salt
    quantity: 0.5
    unit: teaspoon
    item: salt
  - id: water
    quantity: 0.25
    unit: cup
    item: water (1/4 to 1/2 cup or less)
  - id: caraway_seed
    quantity: 1
    unit: teaspoon
    item: caraway seeds
---

A comforting, flavorful pork chop recipe from Grandma, featuring the distinctive taste of caraway seeds. Usually served with noodles.

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

1.  Trim excess fat from the <span class="inst-quantity" data-ingredient-id="pork_chops">6</span> pork chops.
2.  Sprinkle each chop generously with <span class="inst-quantity" data-ingredient-id="paprika"></span> paprika and <span class="inst-quantity" data-ingredient-id="salt"></span> salt on both sides. Rub it around with your hands to distribute.
3.  Brown the chops in a hot skillet on both sides until nicely seared.
4.  Remove the browned chops to an oven-safe dish.
5.  Pour <span class="inst-quantity" data-ingredient-id="water">0.25</span> cup water into the same skillet and stir around to scrape up any browned bits from the bottom (this adds flavor).
6.  Add <span class="inst-quantity" data-ingredient-id="caraway_seed">1</span> teaspoon caraway seeds to the skillet with the water, stir, and then pour this mixture on top of the chops in the oven dish.
7.  Cover the dish and bake in a slow oven at 325°F (160°C) for about an hour, or until the chops are fork-tender.
8.  Serve warm, usually with noodles.
