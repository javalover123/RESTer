import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-collapse/iron-collapse.js';
import '../../../../node_modules/@polymer/iron-selector/iron-selector.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-item/paper-item-body.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-ripple/paper-ripple.js';
import '../../../../node_modules/@polymer/paper-styles/paper-styles.js';
import '../controls/rester-subheader.js';
import '../styles/rester-icons.js';
import resterPaperItemButtonStyle from '../styles/rester-paper-item-button.js';
import { debounce } from '../../../shared/util.js';

/**
 * @polymer
 * @customElement
 */
class RESTerNavigationListItem extends PolymerElement {
    static get template() {
        return html`
            ${resterPaperItemButtonStyle}

            <style>
                :host {
                    display: block;

                    --paper-item-body-two-line-min-height: 48px;
                    --paper-item-body-secondary: {
                        font-size: 12px;
                        line-height: 1em;
                    }
                }

                :host([subitem]) {
                    --paper-item-min-height: 36px;
                    --paper-item-body-two-line-min-height: 36px;
                }

                :host([active]) paper-item {
                    background-color: var(--divider-color);
                    color: var(--primary-color);
                    font-weight: bold;

                    --paper-item-body-secondary-color: var(--primary-color);
                    --paper-item-body-secondary: {
                        font-weight: bold;
                    }
                }

                :host([active]) paper-item-body [secondary] {
                    color: var(--primary-color);
                    font-weight: bold;
                }

                .subheader-title {
                    flex: 1;
                }

                .subheader-action,
                .item-secondary-action {
                    margin-right: -8px;
                }

                .divider {
                    border-top: 1px solid var(--divider-color);
                }

                paper-item[role='button'] {
                    line-height: 1.1em;
                }

                .toggle-icon {
                    transition: transform 0.25s ease;
                }

                .toggle-icon.expanded {
                    transform: rotate(-180deg);
                }

                .method {
                    text-align: center;
                    width: 50px;
                }
                .method-DEL, .method-DELETE {
                    background-color: red;
                }
                .method-GET {
                    background-color: #2392f7;
                }
                .method-POST {
                    background-color: #13c20f;
                    color: black;
                }
                .method-PUT, .method-PATCH {
                    background-color: #ff9000;
                    color: black;
                }
                .method-HEAD, .method-OPT, .method-OPTIONS {
                    background-color: #ccc;
                    color: black;
                }

                .status-200, .status-204 {
                    color: #0c0;
                }
                .status-400, .status-401, .status-403, .status-404, .status-405, .status-413, .status-414, .status-415 {
                    color: red;
                }
                .status-422, .status-500, .status-501, .status-502, .status-504 {
                    color: red;
                }

                .subtitle {
                    white-space: nowrap;
                }
            </style>

            <template is="dom-if" if="[[item.isSubheader]]">
                <rester-subheader>
                    <div class="subheader-title">[[item.title]]</div>
                    <template is="dom-if" if="[[item.action]]">
                        <paper-icon-button
                            class="subheader-action"
                            icon="[[item.action.icon]]"
                            on-tap="_invokeAction"
                        ></paper-icon-button>
                    </template>
                </rester-subheader>
            </template>

            <template is="dom-if" if="[[item.isItem]]">
                <paper-icon-item on-tap="_invokeAction" class="button">
                    <div class$="method method-[[item.method]]" slot="item-icon">[[item.method]]</div>
                    <paper-ripple></paper-ripple>
                    <paper-item-body
                        two-line
                        style$="padding-left: [[_getIndentionInPixel()]]px;"
                    >
                        <div><font class$="status-[[item.status]]">[[item.status]]</font> [[item.title]]</div>
                        <div class="subtitle" secondary>[[item.requestURI]]</div>
                    </paper-item-body>
                    <template is="dom-if" if="[[item.secondaryAction]]">
                        <paper-icon-button
                            class="item-secondary-action"
                            icon="[[item.secondaryAction.icon]]"
                            on-tap="_invokeSecondaryAction"
                        ></paper-icon-button>
                    </template>
                </paper-icon-item>
            </template>

            <template is="dom-if" if="[[item.isGroup]]">
                <paper-item on-tap="_toggleGroup" class="button">
                    <paper-ripple></paper-ripple>
                    <paper-item-body
                        style$="padding-left: [[_getIndentionInPixel()]]px;"
                    >
                        <div>[[item.title]]</div>
                    </paper-item-body>
                    <iron-icon
                        icon="expand-more"
                        class$="toggle-icon [[_getExpandedClass(item.isExpanded)]]"
                    ></iron-icon>
                </paper-item>
                <iron-collapse opened="[[item.isExpanded]]">
                    <template
                        is="dom-repeat"
                        items="[[item.items]]"
                        as="subitem"
                    >
                        <rester-navigation-list-item
                            item="[[subitem]]"
                            indent-level="[[_getIndentLevelForSubitems()]]"
                            route="[[route]]"
                            on-item-activated="_onSubitemActivated"
                            subitem
                        ></rester-navigation-list-item>
                    </template>
                </iron-collapse>
            </template>

            <template is="dom-if" if="[[item.isDivider]]">
                <div class="divider"></div>
            </template>
        `;
    }

    static get is() {
        return 'rester-navigation-list-item';
    }

    static get properties() {
        return {
            item: {
                type: Object,
                observer: '_notifyIfActive',
            },
            indentLevel: {
                type: Number,
                value: 0,
            },
            route: {
                type: Object,
                observer: '_onRouteChanged',
            },
            active: {
                type: Boolean,
                computed: '_computeActive(route)',
                observer: '_onActiveChanged',
                reflectToAttribute: true,
            },
        };
    }

    constructor() {
        super();
        this._notifyIfActive = this._notifyIfActive.bind(this);
    }

    _getIndentionInPixel() {
        return this.indentLevel * 24;
    }

    _getIndentLevelForSubitems() {
        return this.indentLevel + 1;
    }

    _toggleGroup() {
        this.set('item.isExpanded', !this.item.isExpanded);
    }

    _getExpandedClass() {
        return this.item.isExpanded ? 'expanded' : '';
    }

    _onSubitemActivated() {
        this.set('item.isExpanded', true);
    }

    _onRouteChanged() {
        this.set('item.isExpanded', false);
        debounce(this._notifyIfActive, 0);
    }

    _computeActive(route) {
        const url = this.item && this.item.action && this.item.action.url;
        if (!url) {
            return false;
        }

        const activePath = route.path.split('/');
        const path = url.substr(1).split('/');

        return path.every((part, i) => part === activePath[i]);
    }

    _onActiveChanged() {
        debounce(this._notifyIfActive, 0);
    }

    _notifyIfActive() {
        setTimeout(() => {
            if (this.active) {
                this.dispatchEvent(
                    new CustomEvent('item-activated', {
                        bubbles: true,
                        composed: true,
                    })
                );
            }
        });
    }

    _invokeAction() {
        const action = this.item.action;
        if (action.url) {
            window.location = action.url;
        } else if (action.handler) {
            action.handler();
        }
    }

    _invokeSecondaryAction(e) {
        e.stopPropagation();

        const action = this.item.secondaryAction;
        action.handler();
    }
}

customElements.define(RESTerNavigationListItem.is, RESTerNavigationListItem);
