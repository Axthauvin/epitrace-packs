// content.js

function find_a(el) {
  if (el.tagName == "A") return el;
  return find_a(el.parentElement);
}

let confettiWrapper = document.createElement("div");
confettiWrapper.classList.add("confetti-wrapper");
confettiWrapper.style.zIndex = "9999";
document.body.appendChild(confettiWrapper);

function add_pack_display() {
  if (!document.getElementById("pack-displayer")) {
    let packDisplayer = document.createElement("div");
    packDisplayer.id = "pack-displayer";
    packDisplayer.style.position = "absolute";
    packDisplayer.style.top = "0";
    packDisplayer.style.left = "0";
    packDisplayer.style.width = "100%";
    packDisplayer.style.height = "100%";
    packDisplayer.style.display = "none";
    packDisplayer.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Dark background with opacity
    document.body.appendChild(packDisplayer);
  }
}

function addPackToDisplay(pack) {
  let packDisplayer = document.getElementById("pack-displayer");
  if (packDisplayer) {
    packDisplayer.innerHTML = ""; // Clear previous pack if exists
    packDisplayer.appendChild(pack);
    packDisplayer.style.display = "flex";
    packDisplayer.addEventListener("click", closePackDisplay);
  }
}

function closePackDisplay() {
  let packDisplayer = document.getElementById("pack-displayer");
  if (packDisplayer) {
    packDisplayer.style.display = "none";
    packDisplayer.innerHTML = ""; // Clear the display
    document.location.reload(); // Reload the page to reset the display
  }
}

async function add_open_pack_button(traceSymbol) {
  if (
    traceSymbol.getAttribute("errorstatus") != "" ||
    traceSymbol.getAttribute("status") != "SUCCEEDED"
  )
    return; // Skip error status

  a_tag = find_a(traceSymbol);
  var link = a_tag.href;

  if ((await isHashInDB(link)) == true) return; // Skip if already processed

  let percentage = traceSymbol.getAttribute("successpercent");
  let button = document.createElement("button");
  button.textContent = "Open EpiPack";
  button.style.background = "#007BFF";
  button.style.color = "white";
  button.style.border = "none";
  button.style.padding = "5px 10px";
  button.style.cursor = "pointer";
  button.style.margin = "5px";

  traceSymbol.setAttribute("data-processed", "true"); // Prevent duplicate processing
  traceSymbol.style.display = "none";
  traceSymbol.parentNode.insertBefore(button, traceSymbol);

  a_tag.href = "#";

  traceSymbol.setAttribute("link", link);

  a_tag.addEventListener("click", function () {
    openPackAnimation(button, percentage);
  });

  button.addEventListener("click", function () {
    openPackAnimation(button, percentage);
  });
}

async function replaceTraceSymbols() {
  if (document.body.dataset.replaceTraceSymbolsExecuted) {
    return;
  }

  document.body.dataset.replaceTraceSymbolsExecuted = true;

  add_pack_display();
  var alls = document.querySelectorAll("trace-symbol:not([data-processed])");
  for (let i = 0; i < alls.length; i++) {
    await add_open_pack_button(alls[i]);
  }

  if (document.getElementsByClassName("list").length == 0) return;

  const lists = document.getElementsByClassName("list");
  var all_in_list = lists[lists.length - 1].children;

  var hashes = await getDB();

  for (let i = 0; i < all_in_list.length; i++) {
    var href = all_in_list[i].href;
    var is_inside = false;
    for (let j = 0; j < hashes.length; j++) {
      // Ne contient pas, donc je mets la classe en normal + j'enlève l'indicateur
      is_inside = await isHashInDB(href);
    }

    if (!is_inside) {
      all_in_list[i].classList.remove("list__item__secondary");
      const items_inside =
        all_in_list[i].getElementsByClassName("list__item__right")[0];
      var checkMark = items_inside.children[0];

      if (items_inside.getElementsByTagName("trace-symbol").length != 0)
        checkMark = items_inside.getElementsByTagName("trace-symbol")[0];
      // we remove trailing /
      const url = window.location.href.replace(/\/$/, "").split("/");
      // console.log(url);
      if (
        checkMark &&
        (url[url.length - 1] == "root" ||
          checkMark.getAttribute("status") == "SUCCEEDED")
      )
        checkMark.style.display = "none";
      // checkMark.style.display = "none";
      all_in_list[i].classList.add("old_list__item__secondary");
    }
  }
}

// Use MutationObserver to track dynamically loaded content
const observer = new MutationObserver(replaceTraceSymbols);
observer.observe(document.body, { childList: true, subtree: true });

replaceTraceSymbols(); // Initial replacement in case elements are already present

function get_url(percentage) {
  return browserAPI.runtime.getURL("img/" + get_image(percentage) + ".png");
}

let href = "";

async function openPackAnimation(button, inputPercentage) {
  function main_pack() {
    return browserAPI.runtime.getURL("img/pack.png");
  }

  let pack = document.createElement("div");
  pack.classList.add("pack");
  pack.style.backgroundImage = `url(${main_pack()})`;
  let pack_text = document.createElement("span");
  pack_text.classList.add("text-pack");
  pack.appendChild(pack_text);

  addPackToDisplay(pack);
  //button.parentNode.insertBefore(pack, button);
  pack.classList.add("spinning");

  href = button.parentElement
    .getElementsByTagName("trace-symbol")[0]
    .getAttribute("link");

  setTimeout(() => {
    animateReveal(inputPercentage, pack, pack_text);
    pack.style.cursor = "pointer";

    let span = document.createElement("span");
    span.textContent = "Click on the card to see your trace";
    span.style.color = "white";
    span.style.position = "absolute";
    span.style.bottom = "10px";
    span.style.left = "50%";
    span.style.transform = "translateX(-50%)";
    span.style.fontSize = "20px";
    span.style.fontWeight = "bold";
    document.getElementById("pack-displayer").appendChild(span);

    addHashToDB(href);

    pack.addEventListener("click", function (event) {
      event.stopPropagation(); // Empêche le parent de recevoir l'événement
      window.location.href = href;
    });
  }, 1000);
}

browserAPI.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    if (request.action === "unlock") {
      // console.log("popup asked unlock all");
      var alls = document.querySelectorAll("trace-symbol");
      for (let traceSymbol of alls) {
        var hash = traceSymbol.getAttribute("link");
        // console.log(hash);
        addHashToDB(hash);
      }

      var containers = document.querySelectorAll(".old_list__item__secondary");
      for (let a of containers) {
        await addHashToDB(a.href);
      }
    }

    if (request.action === "repack") {
      var alls = document.querySelectorAll("trace-symbol");
      for (let traceSymbol of alls) {
        var hash = find_a(traceSymbol);
        // console.log(hash);
        await removeHashFromDB(hash.href);
      }

      var containers = document.querySelectorAll(".list__item__secondary");
      for (let a of containers) {
        await removeHashFromDB(a.href);
      }
    }

    document.location.reload();

    return false;
  }
);
