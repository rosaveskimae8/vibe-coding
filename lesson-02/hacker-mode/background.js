// По нажатию на значок вставляем hacker.js в открытую вкладку.
// Сам hacker.js понимает, включить режим или выключить.
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting
    .executeScript({ target: { tabId: tab.id }, files: ["hacker.js"] })
    .catch(() => {}); // на страницах chrome:// расширения не работают
});
