---
title: even a broken clock
---

### once a day

the front page of this site is totally static. github actions builds it whenever i push to main, and that's that. which means that i can't have a big header that displays today's date like "happy <span id="todays_date"></span>". i mean, unless i update it [[better-late|every day]], or add one line of javascript.

but i would never do that.

<script>document.getElementById("todays_date").innerHTML = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()];</script>