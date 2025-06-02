const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Function to add the current hash to a database
function addHashToDB(hash) {
  browserAPI.storage.local.get({ hashes: [] }).then((result) => {
    let hashes = result.hashes;
    if (!hashes.includes(hash)) {
      hashes.push(hash);
      browserAPI.storage.local.set({ hashes: hashes });
    }
  });
}

// Function to check if the database contains the hash
async function isHashInDB(hash) {
  //   return false; // add this line for debbugging purpose
  let result = await browserAPI.storage.local.get({ hashes: [] });
  return result.hashes.includes(hash);
}

// Function to get the database from the local storage
async function getDB() {
  let result = await browserAPI.storage.local.get({ hashes: [] });
  return result.hashes;
}

function animateReveal(finalScore, pack, pack_text, duration = 3000) {
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);

    // easing (ex: easeOutCubic)
    const eased = 1 - Math.pow(1 - t, 3);
    const currentScore = Math.floor(eased * finalScore);

    pack_text.textContent = Math.floor(currentScore);
    pack_text.style.color = get_color(get_image(currentScore));
    pack.style.backgroundImage = `url(${get_url(currentScore)})`;

    if (t < 1) {
      requestAnimationFrame(update);
    } else {
      pack_text.textContent = Math.floor(finalScore);
      pack_text.style.color = get_color(get_image(finalScore));
      pack.style.backgroundImage = `url(${get_url(currentScore)})`;

      if (finalScore == 0) {
        pack.style.backgroundImage = `url(${browserAPI.runtime.getURL(
          "img/rip_bozo.jpg"
        )})`;

        pack.style.width = "744px";
        pack.style.height = "609px";
        pack_text.style.display = "none";
      } else if (finalScore == 100) {
        // GG btw
        make_confetis();
      }
    }
  }

  requestAnimationFrame(update);
}

function get_image(percentage) {
  if (percentage == 100) return "icon";
  if (percentage >= 90) return "rare_gold";
  if (percentage >= 80) return "gold";
  if (percentage >= 60) return "silver";
  if (percentage >= 40) return "rare_bronze";
  if (percentage >= 1) return "bronze";
  return "icon"; // im a troller eheheh
}

function get_color(image) {
  if (image == "rare_gold") return "#F6DB7B";
  return "#1e252a";
}
