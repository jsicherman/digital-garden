---
title: text adventure
---

### would you like to play a game?

open the console and indulge me a minute. the whole map was written by gpt3.5 with very little guidance from myself.

<script>
  const __bold = "font-weight: bold";
  const __normal = "font-weight: normal";
  const __italic = "font-style: italic";
  const __invalid = "Invalid command. Type 'help' for help.";
  const __prompt = "What would you like to do?";
  const _log = console.log;

  ["help", "yes", "no", "forward", "backward", "forwards", "backwards", "left", "right", "interact", "take", "leave", "where", "use"].forEach((x) => {
    _gen(x, "_" + x);
  });
  
  function _gen(trigger, fn) {
    Object.defineProperty(window, trigger, {
      get: function() {
        return window[fn]();
      }
    });
  }

  function _help() {
    _log("%cforward: %cMove forwards", __bold, __normal);
    _log("%cbackward: %cMove backwards", __bold, __normal);
    _log("%cleft: %cMove left", __bold, __normal);
    _log("%cright: %cMove right", __bold, __normal);
    _log("%cinteract: %cInteract with an entity", __bold, __normal);
    _log("%cuse: %cUse an item from your inventory", __bold, __normal);
    _log("%ctake: %cTake an item from the ground", __bold, __normal);
    _log("%cleave %cExit a conversation", __bold, __normal);
    _log("%cwhere %cDescribe your surroundings", __bold, __normal);
  }

  function _yes() {
    if(!player.location) {
      setDarkTheme();
      addFog();
      return _move("entrance");
    } else {
      const actor = actors.find((x) => x.location === player.location);
      if(actor) {
        const interaction = actor.interact[player.conversation];
        if(interaction && interaction.yes) {
          player.conversation = interaction.yes;

          _log("%c%s%c\n\n\"%s\"", __italic, actor.interact[interaction.yes].action, __normal, actor.interact[interaction.yes].quote);
          return _interact_responses(actor, actor.interact[interaction.yes]);
        }
      }
      return __invalid;
    }
  }

  function _no() {
    if(!player.location) {
      setTimeout(() => history.back(), 2000);
      return "Fine then. Be that way :(";
    } else {
      const actor = actors.find((x) => x.location === player.location);
      if(actor) {
        const interaction = actor.interact[player.conversation];
        if(interaction && interaction.no) {
          player.conversation = interaction.no;

          _log("%c%s%c\n\n\"%s\"", __italic, actor.interact[interaction.no].action, __normal, actor.interact[interaction.no].quote);
          return _interact_responses(actor, actor.interact[interaction.no]);
        }
      }
      return __invalid;
    }
  }

  function _try_move(dir) {
    if(!player.location) { _log("You are not playing (yet)"); return "Would you like to play a game? (yes/no)"; }

    const target = map[player.location].exits.find((x) => x.direction == dir);
    if(!target) {
      _log("Your way is blocked.");
      return __prompt;
    }

    const dest = map[target.room];
    if(dest.requires) {
      if(!player.inventory.includes(dest.requires)) {
        _log(dest.lacks_requirements);
        return __prompt;
      }
    }

    return _move(target.room);
  }

  function _forward() { return _try_move("forward"); }
  function _forwards() { return _forward(); }

  function _backward() { return _try_move("backward"); }
  function _backwards() { return _backward(); }
  
  function _left() { return _try_move("left"); }
  function _right() { return _try_move("right"); }

  function _use() {
    if(!player.location) { _log("You are not playing (yet)"); return "Would you like to play a game? (yes/no)"; }

    if(player.inventory.length === 0) {
      _log("You have nothing to use.");
    } else {
      const usable = player.inventory.filter((x) => !player.used.includes(x)).find((x) => items.find((y) => y.id == x).use_at === player.location);
      if(usable) {
        const it = items.find((y) => y.id == usable);
        player.used.push(usable);
        if(it.use_grants) {
          player.inventory.push(it.use_grants);
          
          const added = items.find((x) => x.id === it.use_grants);
          if(added.triggers) { _trigger(added.triggers); }
        }

        _log(it.use);
      } else { _log("You do not see a use for anything you're currently carrying."); }
    }

    return __prompt;
  }

  function _move(to) {
    console.clear();
    if(to != player.location) { player.conversation = null; }

    player.location = to;
    var loc = map[to];

    _log("%cCurrent location: %c%s", __bold, __normal, loc.name);

    const found = items.filter((x) => x.location === player.location && !player.inventory.includes(x.id));
    if(found.length > 0) {
      _log("%s\n\n%c%s", loc.description, __italic, loc.items);
    } else {
      _log(loc.description);
    }

    const format_str = loc.exits.map((_) => "%c%s: %c%s").join("\n\n");
    const varargs = loc.exits.flatMap((x) => [__italic, x.direction, __normal, x.description]);
    _log(format_str, ...varargs);

    const actor = actors.find((x) => x.location === to);
    if(actor) {
      _log("%c%s%c\n\n%s", __bold, actor.encountered, __normal, actor.description);
    }

    return __prompt;
  }

  function _take() {
    if(!player.location) { _log("You are not playing (yet)"); return "Would you like to play a game? (yes/no)"; }

    const found = items.filter((x) => x.location === player.location && !player.inventory.includes(x.id));
    if(found.length === 0) {
      _log("There is nothing here to take. Type 'help' for help.");
      return __prompt;
    }

    found.forEach((x) => {
      player.inventory.push(x.id);
      if(x.triggers) { _trigger(x.triggers); }
      _log(x.take);
    })

    return __prompt;
  }

  function addFog() {
    var wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.height = "100vh";
    wrapper.style.width = "100vw";
    wrapper.style.top = 0;
    wrapper.style.left = 0;

    for(let i = 1; i <= 3; i++) {
      var container = document.createElement("div");
      container.id = "foglayer_0" + i;
      container.classList.add("fog");
      for(let j = 1; j <= 2; j++) {
        var child = document.createElement("div");
        child.classList.add("image0" + j);
        container.appendChild(child);
      }
      wrapper.appendChild(container);
    }

    document.querySelector("body").appendChild(wrapper);
  }

  function _trigger(png) {
    var img = document.createElement("img");
    img.src = "assets/" + png;
    img.style.position = "fixed";
    img.style.top = "20%";
    img.style.left = "50%";
    img.classList.add("flip");
    document.querySelector("article").appendChild(img);
    setTimeout(() => img.remove(), 3000);
  }

  function _leave() {
    if(!player.location) { _log("You are not playing (yet)"); return "Would you like to play a game? (yes/no)"; }

    if(player.conversation === null) {
      _log("You aren't speaking to anyone. Type 'help' for help.");
      return __prompt;
    }

    player.conversation = null;
    return _move(player.location);
  }

  function _where() {
    if(!player.location) { _log("You are not playing (yet)"); return "Would you like to play a game? (yes/no)"; }

    return _move(player.location);
  }

  function _interact() {
    if(!player.location) { _log("You are not playing (yet)"); return "Would you like to play a game? (yes/no)"; }

    const actor = actors.find((x) => x.location === player.location);
    if(!actor) {
      _log("You look around, but do not see anyone to speak with. Type 'help' for help.");
      return __prompt;
    }

    var state = player.conversation === null ? "initial" : actor.interact[player.conversation].next;
    player.conversation = state;

    if(!state) {
      _log("%c%s%c seems to have no interest in speaking with you.", __italic, actor.name, __normal);
      return __prompt;
    }

    _log("%c%s%c\n\n\"%s\"", __italic, actor.interact[state].action, __normal, actor.interact[state].quote);

    return _interact_responses(actor, actor.interact[state]);
  }

  function _interact_responses(actor, state) {
    var responses = [];
    if(state.yes) { responses.push("yes"); }
    if(state.no) { responses.push("no"); }
    if(state.next) { responses.push("interact"); }
    responses.push("leave");

    return "How would you like to respond? (" + responses.join("/") + ")";
  }

  var player = {
    "inventory": [],
    "used": [],
    "location": null,
    "conversation": null
  };

  const actors = [
    {
      "id": "mysterious_figure",
      "name": "Mysterious Figure",
      "location": "courtyard",
      "encountered": "You hear a twig crack in the bushes...",
      "description": "A mysterious figure, cloaked in tattered robes, stands by the crumbling statue, seemingly lost in thought. They might have information to share if you approach them.",
      "interact": {
        "initial": {
          "action": "The cloaked figure turns slowly to face you, their eyes hidden beneath the shadow of their hood. A whisper of a voice escapes their lips.",
          "quote": "Greetings, traveler. You have stumbled upon a place long forgotten by the world.",
          "next": "final"
        },
        "final": {
          "action": "The figure's hooded head tilts slightly, as if considering.",
          "quote": "Curiosity, a common trait among newcomers. Few ever return from the depths of this castle, but if you must press on, do so with caution. The past clings to these walls, and not all secrets are meant to be uncovered."
        }
      }
    },
    {
      "id": "ghostly_cat",
      "name": "Gertrude",
      "location": "kitchen",
      "encountered": "You look down and see a figure, shimmering and translucent grey.",
      "description": "A ghostly cat, its form faint and ethereal, prowls silently among the ruins of the kitchen. Its eyes shimmer with an otherworldly light, and it occasionally emits a soft, mournful meow.",
      "interact": {
        "initial": {
          "action": "As you focus your thoughts on the spectral cat, you feel a gentle, ghostly presence entering your mind.",
          "quote": "Welcome, traveler. You have a kindred spirit, for you can see beyond the veil of the living. I am Gertrude, bound to this castle by secrets and unfinished business. Do you seek the relics that hold the castle's secrets, traveler?",
          "yes": "1", "no": "2", "next": "pet"
        },
        "pet": {
          "action": "As you reach down to pet the ethereal creature, your hand passes directly through.",
          "quote": "A kind gesture, traveler, but I exist beyond the realm of touch. I am but a whisper of the past, bound by spectral chains to this place. Continue your exploration, and be careful, for this place is full of mysteries."
        },
        "1": {
          "action": "Gertrude's ethereal presence lingers in your mind, and it asks,",
          "quote": "Ah, a seeker of the relics, I see. There have been many before you, and I hope you do not share their misfortune."
        },
        "2": {
          "action": "Gertrude's spectral presence seems to accept your answer, and it continues,",
          "quote": "I see that your journey may follow a different path, one not bound to the relics and secrets of this castle. Be mindful of the choices you make, for this place has many mysteries, and not all may be revealed to those who do not seek them."
        }
      }
    }
  ];

  const items = [
    {
      "id": "rusty_key",
      "location": "courtyard",
      "take": "Amidst the overgrown bushes, you notice a glimmer of metal – it's a rusty key partially buried in the soil. You put the rusty key in your pocket, and it leaves a slight tinge of red on your fingers."
    },
    {
      "id": "torch",
      "location": "entrance",
      "take": "You reach up and remove a torch from its position on the wall. It casts flickering shadows on the ground ahead of you."
    },
    {
      "id": "ancient_diary",
      "location": "courtyard",
      "take": "A tattered, ancient diary lies beneath the shadow of the twisted tree. As you pick up the diary, a page falls out. You add the page to your pocket and discard the tattered remains of the book."
    },
    {
      "id": "sealed_letter",
      "location": "study",
      "description": "",
      "take": "Among the scattered scrolls on the desk, you notice a sealed letter with a mysterious wax seal, seemingly untouched for centuries. It is a delicate and aged piece of parchment, slightly yellowed, and it bears a wax seal in the shape of a stylized castle tower, a symbol of importance and authority. The wax is now brittle, and tiny cracks have formed with age."
    },
    {
      "id": "tattered_map",
      "location": "study",
      "take": "On a bookshelf, a tattered map is tucked between the pages of an old book. You pick up the map and study it. It depicts a detailed layout of the castle and its surrounding grounds. The lines are drawn in faded ink, and certain areas of the map are smudged, making it challenging to decipher. Nonetheless, you manage to decipher a trail of dotted lines leading from the castle's main hall to an area labeled \"Treasury\"."
    },
    {
      "id": "dusty_book",
      "location": "library",
      "take": "You notice a peculiar, dust-covered book on a lectern near the fireplace, seemingly distinct from the rest. Its title is written in ornate, calligraphic script: \"Chronicles of the Castle.\" As you carefully blow off the layers of dust and open the book, you discover it contains the following passage:\n\n\"In the year 1782, during the reign of King Arthur IV, this castle was abandoned for reasons unknown. The last residents, the Carmichael family, vanished without a trace. Legends speak of hidden chambers, unclaimed treasures, and an underground labyrinth said to house the castle's deepest secrets. As the years passed, the castle fell into disrepair, and tales of hauntings and unexplained phenomena grew.\n\nIt is said that the key to unlocking the castle's mysteries lies within a set of four ancient relics: the Serpent's Medallion, the Silver Chalice, the Ebon Dagger, and the Moonstone Amulet. These relics are believed to be scattered throughout the castle and must be united to uncover the truth that has been concealed for centuries.\""
    },
    {
      "id": "crypt_key",
      "location": "library",
      "take": "A hidden compartment within one of the bookshelves reveals a curious, ancient-looking key. The key is heavy and feels substantial in your hand. Its bow is ornately designed with intricate patterns of twisting vines and leaves. Despite the passage of time, the key is remarkably well-preserved. As you turn it over, you notice a small inscription on the side of the bow. The letters are faded but still legible. They read: \"Crypt Key\".",
      "use_at": "hidden_compartment",
      "use": "You insert the crypt key into the chest and it turns with a pleasing click. As you sift through the contents, your fingers brush against something cold and unyielding. You carefully pull it from the chest, revealing a magnificent Ebon Dagger. Its hilt is fashioned from dark obsidian, inlaid with intricate silver patterns.",
      "use_grants": "ebon_dagger"
    },
    {
      "id": "serpent_medallion",
      "location": "chamber",
      "take": "The Serpent's Medallion is a breathtaking and enigmatic artifact. It's crafted from a lustrous, dark green gemstone, which glistens with an otherworldly sheen. The gem is expertly carved into the form of a serpent coiled around a circular base, its eyes formed from glistening, pale emeralds.\n\nThe surface of the medallion seems to ripple with an ethereal energy, and a faint, melodious hum emanates from it, a sound that's both eerie and captivating. As you hold it in your hand, you can feel a subtle vibration, as if it's resonating with the mysteries of the castle.",
      "triggers": "serpent_medallion.png",
      "use_at": "treasury",
      "use": "You approach the four pedestals in the hidden treasury, the Serpent's Medallion clutched in your hand. As you carefully place the medallion on its designated pedestal, a resonant vibration fills the chamber, causing the walls to reverberate with an otherworldly energy. The voices you heard earlier in the Chamber of Whispers return, their murmurs now clearer and more focused. They seem to speak in unison, though their words remain cryptic.\n\nThe previously dimly lit treasury suddenly bathes in a haunting, spectral radiance. The ghostly light from the medallion spreads, illuminating the entire chamber with an eerie, yet mesmerizing glow and exposing a previously unnoticed passage in the wall leading deeper into the heart of the castle."
    },
    {
      "id": "ebon_dagger",
      "location": "hidden",
      "triggers": "ebon_dagger.png",
      "use_at": "treasury",
      "use": "You approach the four pedestals in the hidden treasury, the Ebon Dagger gripped firmly in your hand. The moment the dagger touches the pedestal, it becomes enveloped in an eerie, silvery mist, as if the blade is absorbing the very essence of the chamber. As the spectral mist dissipates, a section of the wall behind the pedestals begins to shift and rotate, revealing a hidden mural. The mural depicts a series of cryptic scenes, possibly hinting at the locations of the remaining relics."
    }
  ];

  const map = {
    "entrance": {
      "name": "Entrance",
      "description": "You find yourself at the entrance of a mysterious and long-forgotten castle. The towering, weathered stone walls stretch high above you, cloaked in shadows that seem to dance with secrets of the past. The floor is uneven cobblestone, worn smooth by centuries of footprints. Dim torches in iron sconces line the walls, casting a feeble, flickering light that barely pierces the gloom. An eerie silence hangs in the air, broken only by the distant echoes of your own footsteps.",
      "items": "It looks like you could retrieve a torch from one of the wall sconces if you wanted.",
      "exits": [
        {
          "direction": "left",
          "room": "courtyard",
          "description": "A massive, heavy wooden door to your left leads to the castle's courtyard, where an overgrown garden awaits exploration."
        },
        {
          "direction": "forward",
          "room": "main_hall",
          "description": "Directly ahead, a grand archway leads deeper into the castle's main hall, where more mysteries await."
        },
        {
          "direction": "right",
          "room": "cellar",
          "description": "To your right, a narrow stone staircase descends into the murky depths of the castle's cellar, a place where forgotten secrets might be hidden."
        }
      ]
    },
    "courtyard": {
      "name": "Courtyard",
      "description": "As you push open the heavy wooden door, you step into a once-grand courtyard now overgrown with wild foliage. The courtyard's stone pathway is cracked and partly concealed by encroaching vines and unruly bushes. A twisted, ancient tree stands at the center, its branches reaching out like gnarled fingers, casting eerie shadows on the ground. To your left, a crumbling statue of an unknown figure is nearly engulfed by ivy. The air is thick with the earthy scent of damp soil and the distant sound of birdsong.",
      "items": "Something catches your eye amongst the foliage.",
      "exits": [
        {
          "direction": "backward",
          "room": "entrance",
          "description": "Behind you is the castle's entrance, the only visible way back inside."
        },
        {
          "direction": "left",
          "room": "shed",
          "description": "On the far side of the courtyard, there's a small, weather-beaten shed that might hold tools or hidden treasures."
        },
        {
          "direction": "right",
          "room": "main_hall",
          "description": "A cracked path leads to the entrance of the castle's main hall, hinting at further exploration."
        }
      ]
    },
    "main_hall": {
      "name": "Main Hall",
      "description": "You pass through the grand archway and find yourself in the castle's imposing main hall. Enormous stone pillars rise up to support a towering, vaulted ceiling, while faded tapestries, once vibrant with color, hang in tatters from the walls. Dim light filters in through grimy, leaded glass windows, casting eerie patterns on the cold, stone floor. An overpowering sense of history and foreboding fills the air.",
      "exits": [
        {
          "direction": "left",
          "room": "courtyard",
          "description": "To your left, a cracked path leads back to the overgrown courtyard, where nature has started to reclaim its space."
        },
        {
          "direction": "right",
          "room": "library",
          "description": "Across the hall, a heavy wooden door stands slightly ajar, revealing the entrance to the castle's forgotten library."
        },
        {
          "direction": "forward",
          "room": "dining_hall",
          "description": "An ornate set of double doors at the far end of the hall beckons you toward the castle's grand dining hall."
        }
      ]
    },
    "wine_cellar": {
      "name": "Wine Cellar",
      "description": "Pushing open the heavy wooden door, you enter the wine cellar, a dimly lit chamber filled with the intoxicating scent of aged wine. Rows of wooden wine racks line the walls, each bearing bottles of varying shapes and sizes covered in a thick layer of dust. The soft glow of your torch illuminates the labels on some of the bottles, hinting at rare vintages from long ago. A heavy, musty air hangs in the room, and the temperature is noticeably cooler here.",
      "exits": [
        {
          "direction": "backward",
          "room": "cellar",
          "description": "The heavy door behind you leads back into the general cellar area."
        },
        {
          "direction": "forward",
          "room": "main_hall",
          "description": "Returning to the main hall is possible through a set of wooden stairs leading upward."
        }
      ]
    },
    "dining_hall": {
      "name": "Dining Hall",
      "description": "You open the grand double doors and enter the castle's dining hall, a vast and opulent space that once hosted extravagant feasts. A long, weathered wooden table stretches the length of the room, adorned with tarnished silverware and fine china, long past its prime. Tattered tapestries hang on the stone walls, depicting scenes of a forgotten era, and a massive crystal chandelier hangs from the vaulted ceiling, now dim and lifeless. The room is filled with an eerie stillness, and the faint echo of your footsteps is the only sound that breaks the silence.",
      "exits": [
        {
          "direction": "backward",
          "room": "main_hall",
          "description": "The grand double doors behind you provide an exit back into the main hall."
        },
        {
          "direction": "left",
          "room": "kitchen",
          "description": "A door to your left leads to the castle's abandoned kitchen, a place where you may discover remnants of culinary secrets."
        },
        {
          "direction": "right",
          "room": "library",
          "description": "A set of ornate doors to your right beckons you to explore the castle's library, with the promise of hidden knowledge."
        }
      ]
    },
    "cellar": {
      "name": "Cellar",
      "description": "You descend the narrow stone staircase into the castle's dark and musty cellar. The air grows colder and damp, and the flickering light of your torch casts eerie shadows on the uneven stone walls. The cellar is divided into sections, with various barrels, crates, and dusty bottles stacked haphazardly. It's clear that this space was once used for storage, but it's now filled with cobwebs and an eerie silence.",
      "exits": [
        {
          "direction": "backward",
          "room": "entrance",
          "description": "The stone staircase leads back up to the entrance of the castle, your escape route."
        },
        {
          "direction": "forward",
          "room": "wine_cellar",
          "description": "A heavy wooden door on the far wall appears to lead to a more specialized wine storage area."
        },
        {
          "direction": "left",
          "room": "secret_passage",
          "description": "A narrow corridor to your left seems to disappear into darkness, hinting at the possibility of a hidden passage."
        },
      ]
    },
    "library": {
      "name": "Library",
      "description": "As you push open the heavy wooden doors, you step into the castle's library, a room brimming with the aura of forgotten knowledge. Tall, dusty bookshelves line the walls, their wooden frames covered in cobwebs and the shelves themselves holding countless ancient tomes. Faded, worn rugs cover the stone floor, muffling your footsteps as you explore. A large, ornate fireplace stands along one wall, its hearth long cold and covered in soot. The room is bathed in a dim, otherworldly light filtering in through leaded glass windows. The air is heavy with the scent of old paper and leather bindings.",
      "items": "Scattered amongst the books are a variety of useful looking items.",
      "exits": [
        {
          "direction": "backward",
          "room": "dining_hall",
          "description": "You can return to the dining hall through the ornate doors behind you."
        },
        {
          "direction": "forward",
          "room": "study",
          "description": "A small, unassuming door at the far end of the library leads to a secluded study, a place where you may uncover more intimate secrets."
        },
        {
          "direction": "right",
          "room": "main_hall",
          "description": "The library connects to the main hall through a wide stone archway."
        }
      ]
    },
    "shed": {
      "name": "Garden Shed",
      "description": "You open the creaking wooden door and step into the castle's garden shed, a small, dimly lit space filled with a musty, earthy scent. Cobwebs cling to the corners, and the room is cluttered with gardening tools and long-forgotten equipment. Shelves hold an assortment of cracked clay pots and gardening gloves, and a rusty spade leans against the wall. The floor is covered with fallen leaves and dirt, suggesting it hasn't been used in a very long time.",
      "exits": [
        {
          "direction": "backward",
          "room": "courtyard",
          "description": "The weather-beaten wooden door behind you leads back to the overgrown courtyard."
        },
        {
          "direction": "forward",
          "room": "loft",
          "description": "A narrow, rickety ladder leads up to a loft space overhead, promising potential discoveries."
        }
      ]
    },
    "secret_passage": {
      "name": "Secret Passage",
      "requires": "torch",
      "lacks_requirements": "You step into the passageway, but find that it is too dark to navigate. If only you had a light source...",
      "description": "You enter the narrow, hidden passage: an eerie, subterranean world hidden beneath the castle. The passage is hewn from rough stone and winds its way through a labyrinthine network of tunnels. Faint, ominous whispers seem to echo in the distance, creating a sense of foreboding. The air is damp and cool, and the walls are slick with moisture.",
      "exits": [
        {
          "direction": "backward",
          "room": "cellar",
          "description": "The passage leads back to the castle's cellar, allowing you to return to familiar surroundings."
        },
        {
          "direction": "forward",
          "room": "chamber",
          "description": "Ahead of you lies a winding path. You can hear the unsettling sound of ghostly whispers coming from it."
        },
        {
          "direction": "left",
          "room": "treasury",
          "description": "A stone door to your left beckons you further into the depths, promising potential treasures."
        }
      ]
    },
    "treasury": {
      "name": "Hidden Treasury",
      "requires": "tattered_map",
      "lacks_requirements": "You push past the door into a maze of dark passageways. Your footsteps echo loudly, hinting at the expansiveness of the depths. After a few minutes, you emerge back at the same stone door you started at. Perhaps something in the castle will help you navigate these tunnels.",
      "description": "You enter the hidden treasury, a chamber steeped in mystery and opulence. The walls are lined with sturdy iron safes and vault doors, each covered in intricate, time-worn engravings. A faint, ghostly light emanates from the treasure within. The air is thick with the scent of old wealth and the echo of past riches.\n\nIn the center of the chamber, you see four pedestals, each awaiting one of the relics you've been seeking. Around them, gold coins, precious gems, and valuable artifacts glint in the dim light. It's clear that the relics were once part of this impressive collection.",
      "exits": [
        {
          "direction": "backward",
          "room": "secret_passage",
          "description": "The secret passage through which you entered is the only known exit from this room."
        }
      ]
    },
    "study": {
      "name": "Study",
      "description": "You open the door to the study, revealing a small, secluded chamber filled with the scent of old parchment and leather. Wooden bookshelves line the walls, their shelves filled with ancient tomes and manuscripts. A large mahogany desk sits at the center of the room, piled high with disorganized scrolls, inkwells, and quills. The flickering light of a torch casts eerie shadows on the walls, adding to the room's mysterious ambiance. A faded portrait of an enigmatic figure hangs above the fireplace.",
      "items": "You're certain that you can find a use for something here.",
      "exits": [
        {
          "direction": "backward",
          "room": "library",
          "description": "The study connects to the library through the door you entered from."
        },
        {
          "direction": "forward",
          "room": "hidden_compartment",
          "description": "A narrow door at the back of the room appears to lead to a hidden compartment, possibly hiding valuable secrets."
        },
        {
          "direction": "right",
          "room": "main_hall",
          "description": "Returning to the main hall is possible through a small hallway to your right."
        }
      ]
    },
    "kitchen": {
      "name": "Kitchen",
      "description": "You enter the castle's abandoned kitchen, a room filled with remnants of the past. Dusty pots and pans hang from hooks on the walls, and long-forgotten utensils and dishes sit on wooden countertops. The hearth, once a place of bustling activity, now lies cold and dark. Broken windows let in a faint, chilling breeze, and the cobwebs that drape across the room glisten with traces of forgotten moisture.",
      "exits": [
        {
          "direction": "backward",
          "room": "dining_hall",
          "description": "The door you entered from leads back to the dining hall, where you can continue your exploration of the castle."
        },
        {
          "direction": "right",
          "room": "cellar",
          "description": "A hidden doorway beneath the kitchen sink hints at a passage leading to the castle's cellar."
        }
      ]
    },
    "loft": {
      "name": "Storage Loft",
      "description": "You ascend the rickety ladder, which creaks with each step, and reach the storage loft, a cramped and dusty space filled with forgotten items. The loft's wooden beams and floorboards groan under the weight of long-neglected trunks, crates, and dusty old furniture. Shafts of feeble light seep in through gaps in the roof, casting dim, irregular patterns on the room's contents.",
      "exits": [
        {
          "direction": "backward",
          "room": "shed",
          "description": "The ladder you climbed leads back down to the shed."
        }
      ]
    },
    "chamber": {
      "name": "Chamber of Whispers",
      "description": "You enter the Chamber of Whispers, a mysterious, cavernous space beneath the castle filled with a palpable sense of unease. The air is thick with an unnatural chill, and the walls are adorned with eerie, ancient runes and symbols. Faint, ghostly voices seem to reverberate through the chamber, their words indistinct and disquieting.",
      "items": "In the center of the room stands a pedestal, upon which rests a peculiar, glowing artifact – the Serpent's Medallion, one of the relics you've been seeking. It radiates an otherworldly light, casting an eerie glow that dances across the walls and floor.",
      "exits": [
        {
          "direction": "backward",
          "room": "secret_passage",
          "description": "The entrance to the Chamber of Whispers serves as the only known exit."
        }
      ]
    },
    "hidden_compartment": {
      "name": "Hidden Compartment",
      "description": "You open the small door at the back of the study, revealing a concealed space within the castle. The hidden compartment is a modest, candlelit chamber, filled with old scrolls, dusty tomes, and forgotten relics. The air carries the scent of ancient paper, and the flickering candlelight casts dancing shadows on the room's contents.\n\nA large, ornate chest is situated at the far end of the compartment. Its brass fittings and intricate carvings suggest that it may contain something of great value. The walls are lined with shelves, upon which rest a collection of intriguing, time-worn items.",
      "exits": [
        {
          "direction": "backward",
          "room": "study",
          "description": "The door you entered from connects the hidden compartment to the study."
        }
      ]
    }
  }

  /*
    "": {
      "name": "",
      "description": "",
      "exits": [
        {
          "direction": "",
          "room": "",
          "description": ""
        }
      ]
    },
    */

  _log("Would you like to play a game? (yes/no)");
</script>