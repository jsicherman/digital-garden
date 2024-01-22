---
title: the chase
---

### CAT and mouse

as you may know, i remain acutely interested in [[reading|etymology]]. it was then a pleasant surprise to learn the purported origin of something that i stare at probably more than anything else in the world[^1].

[^1]: no, not boobs.

the humble cursor.

### the chicken or the egg

according to roger bates (according to wikipedia), it was once neither a cursor nor a caret, but a CAT. and according to the same source, this preceeded the naming of the mouse. admittedly, this story seems a bit far fetched, and not only because the guy's name is bates. after all, the mouse has much stronger resemblance to its animal counterpart. it also doesn't _seem_ like the CAT is the one chasing the thing on my desk.

### who's chasing whom?

i won't make more excuses for my latest contribution lapse in writings. that would be so passé. sometimes i chase inspiration, sometimes it chases me, but for the last 82 days, the chase has come up verminless.

<h3 id="title">...</h3>

lately, inspiration has returned in the form of a book, and with it i sense it filling more than just these pages. i feel the need to asterisk that, though, because admittedly my excitement about this book, like my progress through it, is only middling. as another reader describes,
> her loooooong paragraphs about physics and morality are somewhat interesting

it may be word vomit, but
> after all, i would rather suffer through 400 pages of olivie blake's word vomit rather than another author's

### pursuits, new and old

and so, feeling inspired, i've picked up a new hobby. a new workout regimen. new friends. more dates. and, the counter rolls back from 82 to 0.

in writing that, i feel the need to point out that whether "normal" or not, my life seemingly exists in extremes. when inspiration lacks, indolence prevails and my calendar experiences a total shutdown. but when it strikes, there is a sudden surge in bookings, friendships, learnings and spendings[^2].

[^2]: nobody said inspiration came cheaply.

perhaps the valleys make the peaks more meaningful. or perhaps i need a more consistent muse.

<p id="last">or maybe, i'm just too easily frustrated by the incessant blinking of this CAT...</p>

<style>
  #title::after, #last::after {
    content: "";
    width: 1.2px;
    height: 1.5rem;
    background: black;
    display: inline-block;
    animation: cursor-blink 1s steps(2) infinite;
  }

  @keyframes cursor-blink {
    0% {
      opacity: 0;
    }
  }
</style>

<script>
  const pages = [
    {% for page in site.notes %}
    "{{ page.url }}"
    {% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];

  function writePrompt() {
    const el = document.getElementById("title");
    const page = pages[Math.floor(Math.random() * pages.length)];
    
    fetch(page)
      .then(resp => {
        if(resp.ok) { return resp.text(); }
      })
      .then(dom => {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(dom, "text/html");
          const els = doc.querySelectorAll("h3");
          const text = els[Math.floor(Math.random() * els.length)].innerText + "...";

          let charIndex = 0;
          const interval = setInterval(() => {
            if(charIndex <= text.length) {
              el.innerText = text.slice(0, charIndex);
              charIndex++;
            } else {
              clearInterval(interval);

              setTimeout(() => {
                const interval = setInterval(() => {
                  if(charIndex >= 0) {
                    el.innerText = text.slice(0, charIndex);
                    charIndex--;
                  } else {
                    clearInterval(interval);
                    setTimeout(writePrompt, 5500);
                  }
                }, 38);
              }, 4000);
            }
          }, 38);
        } catch(err) { writePrompt(); }
      });
  }

  writePrompt();
</script>