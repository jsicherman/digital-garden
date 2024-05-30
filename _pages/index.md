---
layout: page
title: home
id: home
permalink: /
---

<div class="incident">
  <div class="counter-wrapper"><div id="counter"></div></div>
  <p id="days-text">day</p>
  <p>since last incident</p>
</div>

welcome to my collection of {{ site.notes.size }} ramblings. in the event of an emergency, please hang up and find a new site (might i suggest some [alternatives](about))? otherwise, venture on at your <a id="lucky" class="internal-link" href="#">own risk</a>.

<div class="quote-block">
  <q></q>
  <div class="aut"></div>
</div>

<strong>hot off the press:</strong>

<ul>
  {% assign recent_notes = site.notes | sort: "last_modified_at_timestamp" | reverse %}
  {% for note in recent_notes limit: 5 %}
    {% assign d = note.last_modified_at | date: "%-j" | ordinal_suffix %}
    <li>
      {{ note.last_modified_at | date: "the DAY day of %Y" | replace: "DAY", d }} — <a class="internal-link" href="{{ note.url }}">{{ note.title }}</a>
    </li>
  {% endfor %}
</ul>

<div id="dinosaur"></div>
<label class="cactus"></label>
<hr>

{% include notes_graph.html %}

<script>
  const a = new Date({{ 'now' | date: "%Y" }},{{ 'now' | date: "%m" }}-1,{{ 'now' | date: "%d" }});
  const b = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
  var days = Math.floor((b-a)/86400000);
  document.getElementById("counter").innerHTML=days;
  if(days != 1) {
    document.getElementById("days-text").innerHTML="days";
  }
</script>

<script>
  let notes = [];
  {% for item in site.notes %}
     notes.push("{{item.url}}");
  {% endfor %}
  document.getElementById("lucky").href = notes[notes.length * Math.random() | 0];
</script>

<script>
  fetch("https://seussology.info/api/quotes/random/1")
    .then(response => {
      if(response.ok) {
        return response.json();
      } else {
        throw new Error('Unable to get quote');
      }
    })
    .then(data => {
      document.querySelector("q").innerHTML=data[0].text.toLowerCase();
      document.querySelector(".aut").innerHTML="-- "+data[0].book.title.toLowerCase();
    });
</script>