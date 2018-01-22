import {
    e as resterEvents,
    settings,
    settingsLoaded
} from '../data/scripts/rester.js';

/**
 * @polymerMixin
 *
 * Makes RESTer theme available in property and attribute `theme`.
 */
const RESTerThemeMixin = superclass => class extends superclass {
    static get properties() {
        return {
            theme: {
                type: String,
                readOnly: true,
                reflectToAttribute: true
            }
        };
    }

    constructor() {
        super();
        this._onThemeSettingsChanged = this._onThemeSettingsChanged.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        settingsLoaded.then(() => {
            this._setThemeAndCallChangedListener(settings.theme);
        });
        resterEvents.addEventListener('settingsChange', this._onThemeSettingsChanged);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        resterEvents.removeEventListener('settingsChange', this._onThemeSettingsChanged);
    }

    _setThemeAndCallChangedListener(newTheme) {
        this._setTheme(newTheme);

        if (this._onThemeChanged) {
            this._onThemeChanged(this.theme);
        }
    }

    _onThemeSettingsChanged(changedSettings) {
        if (changedSettings.theme) {
            this._setThemeAndCallChangedListener(changedSettings.theme);
        }
    }
};

export default RESTerThemeMixin;