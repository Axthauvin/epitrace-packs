const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Function to add the current hash to a database
async function addHashToDB(hash) {
  try {
    const { hashes = [] } = await browserAPI.storage.local.get("hashes");

    if (!hashes.includes(hash)) {
      hashes.push(hash);
      await browserAPI.storage.local.set({ hashes });
      console.log("Added hash to DB:", hash);
    } else {
      console.log("Hash already in DB:", hash);
    }
  } catch (error) {
    console.error("Failed to add hash to DB:", error);
  }
}

// Function to check if the database contains the hash
async function isHashInDB(hash) {
  // return false; // add this line for debbugging purpose
  const result = await browserAPI.storage.local.get({ hashes: [] });
  const storedHashes = result.hashes;

  // Exact match OR startsWith match
  return storedHashes.some(
    (storedHash) => hash === storedHash || hash.startsWith(storedHash)
  );
}

// Function to get the database from the local storage
async function getDB() {
  let result = await browserAPI.storage.local.get({ hashes: [] });
  return result.hashes;
}

async function removeHashFromDB(targetHash) {
  try {
    const { hashes = [] } = await browserAPI.storage.local.get("hashes");

    const filtered = hashes.filter(
      (storedHash) =>
        !(
          (
            storedHash === targetHash || // exact match
            storedHash.startsWith(targetHash + "/") || // is a subpath of target
            targetHash.startsWith(storedHash + "/")
          ) // is a parent of target
        )
    );

    await browserAPI.storage.local.set({ hashes: filtered });
  } catch (error) {
    console.error("❌ Failed to remove hashes:", error);
  }
}

function affiche_bozo(pack, pack_text) {
  pack.style.backgroundImage = `url(${browserAPI.runtime.getURL(
    "img/rip_bozo.jpg"
  )})`;
  pack.style.width = "744px";
  pack.style.height = "609px";
  pack_text.style.display = "none";
}

function animateReveal(finalScore, pack, pack_text, duration = 3000) {
  const start = performance.now();
  const shouldFakeDrop = finalScore < 20;

  function update(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);

    // easing (ex: easeOutCubic)
    const eased = 1 - Math.pow(1 - t, 3);

    // Soit on monte depuis 0, soit on descend depuis 100
    const currentScore = shouldFakeDrop
      ? Math.floor(100 - eased * (100 - finalScore))
      : Math.floor(eased * finalScore);

    pack_text.textContent = currentScore;
    pack_text.style.color = get_color(get_image(currentScore));
    pack.style.backgroundImage = `url(${get_url(currentScore)})`;

    if (currentScore == 0) {
      affiche_bozo(pack, pack_text);
    } else {
      pack.style.width = "400px";
      pack.style.height = "600px";
      pack_text.style.display = "block";
    }

    if (t < 1) {
      requestAnimationFrame(update);
    } else {
      // état final propre

      if (finalScore == 0) {
        affiche_bozo(pack, pack_text);
        return;
      } else if (finalScore == 100) {
        make_confetis();
      }

      pack_text.textContent = finalScore;
      pack_text.style.color = get_color(get_image(finalScore));
      pack.style.backgroundImage = `url(${get_url(finalScore)})`;
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
