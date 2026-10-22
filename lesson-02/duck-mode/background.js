// По нажатию на значок вставляем duck.js во вкладку — он выпускает или убирает утку.
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting
    .executeScript({ target: { tabId: tab.id }, files: ["duck.js"] })
    .catch(() => {}); // на страницах chrome:// расширения не работают
});
