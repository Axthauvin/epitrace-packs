const browserAPI = typeof browser !== "undefined" ? browser : chrome;

document.getElementById("unlocker").addEventListener("click", () => {
  console.log("clicked on unlocker");
  browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    browserAPI.tabs.sendMessage(activeTab.id, {
      action: "unlock",
    });
  });
});
