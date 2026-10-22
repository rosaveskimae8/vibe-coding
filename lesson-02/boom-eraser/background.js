// По нажатию на значок вставляем boom.js во вкладку — он включает или выключает режим взрыва.
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting
    .executeScript({ target: { tabId: tab.id }, files: ["boom.js"] })
    .catch(() => {}); // на страницах chrome:// расширения не работают
});
