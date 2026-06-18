(function () {
    var STORAGE_KEY = 'portfolio-lang';
    var DEFAULT_LANG = 'en';

    function getData() {
        var el = document.getElementById('i18n-data');
        if (!el) {
            return {};
        }
        try {
            return JSON.parse(el.textContent);
        } catch (e) {
            return {};
        }
    }

    function getNested(obj, key) {
        return key.split('.').reduce(function (current, part) {
            return current && current[part];
        }, obj);
    }

    function getLang() {
        var stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'it' || stored === 'en' ? stored : DEFAULT_LANG;
    }

    function getCategoryLabel(lang, category) {
        if (category === 'Game Development') {
            return getNested(getData(), lang + '.categories.game_development') || category;
        }
        return category;
    }

    function getClientLabel(lang, client) {
        if (client === 'Academy project') {
            return getNested(getData(), lang + '.clients.academy') || client;
        }
        return client;
    }

    function formatDescription(desc) {
        return desc
            .replace(/\.Role:/g, '.\n\nRole:')
            .replace(/\.Ruolo:/g, '.\n\nRuolo:');
    }

    function applyTranslations(lang) {
        var strings = getData()[lang] || getData().en || {};

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var value = getNested(strings, el.getAttribute('data-i18n'));
            if (value) {
                el.textContent = value;
            }
        });

        var ariaKey = document.getElementById('lang-toggle');
        if (ariaKey) {
            var ariaLabel = getNested(strings, ariaKey.getAttribute('data-i18n-aria'));
            if (ariaLabel) {
                ariaKey.setAttribute('aria-label', ariaLabel);
            }
        }

        document.querySelectorAll('[data-desc-en]').forEach(function (el) {
            var desc = lang === 'it'
                ? el.getAttribute('data-desc-it') || el.getAttribute('data-desc-en')
                : el.getAttribute('data-desc-en');
            if (desc) {
                el.textContent = formatDescription(desc);
            }
        });

        document.querySelectorAll('[data-client]').forEach(function (el) {
            var client = el.getAttribute('data-client');
            if (client) {
                el.textContent = getClientLabel(lang, client);
            }
        });

        document.querySelectorAll('[data-category]').forEach(function (el) {
            var category = el.getAttribute('data-category');
            if (category) {
                el.textContent = getCategoryLabel(lang, category);
            }
        });

        document.documentElement.lang = lang;
        updateToggleUI(lang);
    }

    function updateToggleUI(lang) {
        var toggle = document.getElementById('lang-toggle');
        if (!toggle) {
            return;
        }

        toggle.querySelectorAll('.lang-option').forEach(function (option) {
            var isActive = option.getAttribute('data-lang') === lang;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function setLang(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
        applyTranslations(lang);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('lang-toggle');
        if (toggle) {
            toggle.addEventListener('click', function (event) {
                var target = event.target.closest('[data-lang]');
                if (!target) {
                    return;
                }
                setLang(target.getAttribute('data-lang'));
            });
        }

        applyTranslations(getLang());
    });
})();
