// Когда нажимают на значок расширения — вставляем confetti.js в открытую вкладку.
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting
    .executeScript({ target: { tabId: tab.id }, files: ["confetti.js"] })
    .catch(() => {
      // На служебных страницах Chrome (chrome://...) расширения работать не могут — просто ничего не делаем.
    });
});
