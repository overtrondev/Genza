document.addEventListener('DOMContentLoaded', async () => {
  if (window !== window.top) {
    window.close();
    return;
  }
  const elements = {
    infoIcon: document.querySelector('.info-icon'),
    settingsToggle: document.getElementById('settings-toggle'),
    settingsModal: document.querySelector('.settings-modal'),
    infoModal: document.querySelector('.info-modal'),
    changelogBtn: document.getElementById('changelog-btn'),
    changelogModal: document.querySelector('.changelog-modal'),
    languageSelect: document.getElementById('language-select'),
    themeSelect: document.getElementById('theme-select'),
    lengthInput: document.getElementById('length'),
    lengthValue: document.getElementById('length-value'),
    generateBtn: document.getElementById('generate'),
    copyBtn: document.getElementById('copy'),
    passwordField: document.getElementById('password'),
    modalCloses: document.querySelectorAll('.modal-close')
  };
  const encryptionKey = ''; // ← ЗАМЕНИТЕ НА РЕАЛЬНЫЙ КЛЮЧ!
  const translations = {
    ru: {
      version: "Genza v{version}",
      length: "Длина пароля:",
      generate: "Сгенерировать",
      copy: "📋",
      language: "Язык:",
      theme: "Тема:",
      themeLight: "☀️ Светлая",
      themeDark: "🌙 Тёмная",
      themeSunset: "🌅 Закат",
      themeOcean: "🌊 Океан",
      settings: "Настройки",
      developer: "Разработчик: overtron",
      contact: "Связь:",
      copy_error: "Ошибка копирования!",
      languageRu: "🇷🇺 Русский",
      languageEn: "🇬🇧 Английский",
      changelog: "История изменений"
    },
    en: {
      version: "Genza v{version}",
      length: "Password length:",
      generate: "Generate",
      copy: "📋",
      language: "Language:",
      theme: "Theme:",
      themeLight: "☀️ Light",
      themeDark: "🌙 Dark",
      themeSunset: "🌅 Sunset",
      themeOcean: "🌊 Ocean",
      settings: "Settings",
      developer: "Developer: Your Name",
      contact: "Contact",
      copy_error: "Copy error!",
      languageRu: "🇷🇺 Russian",
      languageEn: "🇬🇧 English",
      changelog: "Changelog"
    }
  };
  let currentLang = 'ru';

  async function getVersion() {
    return browser.runtime.getManifest().version;
  }

  async function loadSettings() {
    try {
      const data = await browser.storage.local.get('secureData');
      if (data.secureData) {
        const settings = decrypt(data.secureData);
        currentLang = settings.lang;
        elements.languageSelect.value = settings.lang;
        elements.themeSelect.value = settings.theme || 'light';
        elements.lengthInput.value = settings.length || 12;
        elements.lengthValue.textContent = settings.length || 12;
      }
    } catch (e) {
      console.error('Ошибка загрузки настроек:', e);
    }
  }

  async function saveSettings() {
    const settings = {
      lang: currentLang,
      theme: elements.themeSelect.value,
      length: elements.lengthInput.value
    };
    const encrypted = encrypt(settings);
    await browser.storage.local.set({ secureData: encrypted });
  }

  function encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
  }

  function decrypt(ciphertext) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      return {};
    }
  }

  function updateTheme() {
    document.body.setAttribute('data-theme', elements.themeSelect.value);
  }

  async function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(async el => {
      const key = el.getAttribute('data-i18n');
      if (key === 'version') {
        const version = await getVersion();
        el.textContent = translations[currentLang][key].replace('{version}', version);
      } else {
        el.textContent = translations[currentLang][key];
      }
    });
    [elements.languageSelect, elements.themeSelect].forEach(select => {
      Array.from(select.options).forEach(option => {
        const key = option.getAttribute('data-i18n');
        if (key) {
          option.textContent = translations[currentLang][key];
        }
      });
    });
  }

  async function generatePassword() {
    const length = elements.lengthInput.value;
    const charset = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      number: '0123456789',
      symbol: '!@#$%^&*()_+~`|}{[]\\:;?><,./-='
    };
    let password;
    let attempts = 0;
    do {
      password = [];
      const allChars = Object.values(charset).join('');
      const randomValues = new Uint32Array(Number(length));
      crypto.getRandomValues(randomValues);
      randomValues.forEach(n => {
        const group = Object.values(charset)[n % 4];
        password.push(group[n % group.length]);
      });
      password = password.sort(() => Math.random() - 0.5).join('');
      attempts++;
    } while (
      !(/[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^a-zA-Z0-9]/.test(password)) &&
      attempts < 10
    );
    if (attempts >= 10) {
      password = [
        getRandomChar(charset.lower),
        getRandomChar(charset.upper),
        getRandomChar(charset.number),
        getRandomChar(charset.symbol),
        ...Array.from({ length: length - 4 }, () =>
          getRandomChar(Object.values(charset).join(''))
        )
      ].sort(() => Math.random() - 0.5).join('');
    }
    elements.passwordField.value = password;
    await saveSettings();
  }

  function getRandomChar(charset) {
    return charset[crypto.getRandomValues(new Uint32Array(1))[0] % charset.length];
  }

  function setupEventListeners() {
    elements.infoIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.infoModal.style.display = 'block';
      setTimeout(() => elements.infoModal.classList.add('show'), 10);
    });

    elements.settingsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.settingsModal.style.display = 'block';
      setTimeout(() => elements.settingsModal.classList.add('show'), 10);
    });

    elements.modalCloses.forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        closeModal(modal);
      });
    });

    elements.languageSelect.addEventListener('change', async (e) => {
      currentLang = e.target.value;
      await saveSettings();
      await updateTranslations();
    });

    elements.themeSelect.addEventListener('change', async (e) => {
      await saveSettings();
      updateTheme();
    });

    elements.lengthInput.addEventListener('input', async function() {
      elements.lengthValue.textContent = this.value;
      await saveSettings();
    });

    elements.generateBtn.addEventListener('click', generatePassword);

    elements.copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(elements.passwordField.value);
        elements.copyBtn.textContent = '✅';
        setTimeout(() => {
          elements.copyBtn.textContent = translations[currentLang].copy;
        }, 2000);
      } catch (err) {
        alert(translations[currentLang].copy_error);
      }
    });

    elements.changelogBtn.addEventListener('click', () => {
      elements.changelogModal.style.display = 'block';
      setTimeout(() => elements.changelogModal.classList.add('show'), 10);
    });
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 300);
    }
  }

  async function loadChangelogFromFile() {
    try {
      const response = await fetch(browser.runtime.getURL('changelog.md'));
      const markdown = await response.text();
      const container = parseMarkdown(markdown);
      document.getElementById('changelog-content').appendChild(container);
    } catch (error) {
      console.error('Ошибка загрузки changelog:', error);
      document.getElementById('changelog-content').textContent = 'Не удалось загрузить историю изменений';
    }
  }

  function parseMarkdown(markdown) {
    const container = document.createElement('div');
    const lines = markdown.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        const header = document.createElement('h4');
        header.textContent = line.slice(3);
        container.appendChild(header);
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        const listItem = document.createElement('li');
        listItem.textContent = line.slice(2);
        container.appendChild(listItem);
      } else if (line.trim() !== '') {
        const paragraph = document.createElement('p');
        paragraph.textContent = line;
        container.appendChild(paragraph);
      }
    });
    
    return container;
  }

  async function init() {
    await loadSettings();
    setupEventListeners();
    await updateTranslations();
    updateTheme();
    loadChangelogFromFile();
  }
  init();
});