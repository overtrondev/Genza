// Блокировка iframe-запросов
browser.webRequest.onBeforeRequest.addListener(
  details => ({ cancel: true }),
  { urls: ["<all_urls>"], types: ["sub_frame"] },
  ["blocking"]
);

// Проверка обновлений
browser.runtime.onUpdateAvailable.addListener(() => {
  browser.notifications.create({
    type: 'basic',
    title: 'Genza Update',
    message: 'Доступна новая версия расширения'
  });
});

// Защита от анализа трафика
browser.webRequest.onHeadersReceived.addListener(
  details => {
    const headers = details.responseHeaders.map(header => {
      if (header.name.toLowerCase() === 'x-frame-options') {
        header.value = 'DENY';
      }
      return header;
    });
    return { responseHeaders: headers };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "responseHeaders"]
);