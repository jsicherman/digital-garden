---
title: another page
---

<style>
  body {
    padding-left: 0;
    padding-right: 0;
  }
  nav, footer {
    padding-left: 6vw;
    padding-right: 6vw;
  }
  article > div:nth-child(1) {
    padding-left: 6vw;
    padding-right: 6vw;
  }
  main > :not(article) {
    padding-left: 6vw;
    padding-right: 6vw;
  }
</style>

<script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.158.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.158.0/examples/jsm/"
    }
  }
</script>

<script src="/assets/three.min.js"></script>
<script type="module" src="/assets/multiwindow/main.js"></script>