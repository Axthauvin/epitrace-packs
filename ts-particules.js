function make_confetis() {
  const confetis_div = document.createElement("div");
  confetis_div.className = "pyro";
  confetis_div.style.display = "block";
  confetis_div.innerHTML = `
    <div class="before"></div>
    <div class="after"></div>`;

  document.body.appendChild(confetis_div);

  confetis_div.style.display = "block";
  setTimeout(() => {
    confetis_div.style.display = "none";
  }, 10000);
}
