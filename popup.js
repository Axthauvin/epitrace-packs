const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function addMessageOnButton(id) {
  document.getElementById(id).addEventListener("click", () => {
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      browserAPI.tabs.sendMessage(activeTab.id, {
        action: id,
      });
    });
  });
}

addMessageOnButton("unlock");
addMessageOnButton("repack");
