---
layout: page
title: home
id: home
permalink: /
---

# happy {{ 'now' | date: "%A" | downcase }}.

i hope you like to read things. or just stare knowingly if you don't know how to.

<strong>hot off the press:</strong>

<ul>
  {% assign recent_notes = site.notes | sort: "last_modified_at_timestamp" | reverse %}
  {% for note in recent_notes limit: 5 %}
    {% assign d = note.last_modified_at | date: "%j" %}
    {%capture d %}
      {% case d | slice: -1 %}
        {% when "1" %}{{ d }}st
        {% when "2" %}{{ d }}nd
        {% when "3" %}{{ d }}rd
        {% else %}{{ d }}th
      {% endcase %}
    {% endcapture %}
    <li>
      {{ note.last_modified_at | date: "the DAY day of %Y" | replace: "DAY", d }} — <a class="internal-link" href="{{ note.url }}">{{ note.title }}</a>
    </li>
  {% endfor %}
</ul>

<hr>

{% include notes_graph.html %}