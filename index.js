(() => {
    'use strict';

    // Extension configuration
    const extensionName = 'character-prompt';
    const settingsKey = 'character_prompt_settings';
    
    // Default settings
    const defaultSettings = {
        enabled: true,
        characterSheet: '',
        injectionTarget: 'chat_completion_preset',
        injectionPosition: 'end',
        collapsed: false
    };

    let settings = { ...defaultSettings };

    // Load settings from localStorage
    function loadSettings() {
        try {
            const saved = localStorage.getItem(settingsKey);
            if (saved) {
                settings = { ...defaultSettings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('[Character Prompt] Error loading settings:', error);
        }
    }

    // Save settings to localStorage
    function saveSettings() {
        try {
            localStorage.setItem(settingsKey, JSON.stringify(settings));
        } catch (error) {
            console.error('[Character Prompt] Error saving settings:', error);
        }
    }

    // Create the extension UI
    function createUI() {
        const container = document.createElement('div');
        container.className = `character-prompt-container inline-drawer ${settings.collapsed ? 'collapsed' : ''}`;
        container.innerHTML = `
            <div class="inline-drawer-toggle inline-drawer-header character-prompt-header">
                <div class="character-prompt-title">
                    <button class="character-prompt-collapse-btn" id="character-prompt-collapse">
                        <span class="collapse-icon">${settings.collapsed ? '▶' : '▼'}</span>
                    </button>
                    <b>Character Prompt</b>
                </div>
                <div class="character-prompt-toggle">
                    <label for="character-prompt-enabled">Enabled:</label>
                    <input type="checkbox" id="character-prompt-enabled" ${settings.enabled ? 'checked' : ''}>
                </div>
            </div>
            <div class="inline-drawer-content character-prompt-content" ${settings.collapsed ? 'style="display: none;"' : ''}>
                <div class="character-prompt-settings">
                    <div class="character-prompt-row">
                        <label for="character-prompt-target">Injection Target:</label>
                        <select id="character-prompt-target" class="text_pole">
                            <option value="chat_completion_preset" ${settings.injectionTarget === 'chat_completion_preset' ? 'selected' : ''}>Chat Completion Preset</option>
                            <option value="authors_note" ${settings.injectionTarget === 'authors_note' ? 'selected' : ''}>Author's Note</option>
                            <option value="user_persona" ${settings.injectionTarget === 'user_persona' ? 'selected' : ''}>User Persona</option>
                        </select>
                    </div>
                    <div class="character-prompt-row">
                        <label for="character-prompt-position">Injection Position:</label>
                        <select id="character-prompt-position" class="text_pole">
                            <option value="start" ${settings.injectionPosition === 'start' ? 'selected' : ''}>Beginning</option>
                            <option value="end" ${settings.injectionPosition === 'end' ? 'selected' : ''}>End</option>
                        </select>
                    </div>
                </div>
                <textarea 
                    id="character-prompt-textarea" 
                    class="character-prompt-textarea text_pole textarea_compact" 
                    placeholder="Enter your character sheet information here...

Example:
Name: Detective Sarah Chen
Age: 32
Occupation: Homicide Detective
Personality: Analytical, determined, empathetic but guarded"
                    rows="8"
                >${settings.characterSheet}</textarea>
                <div class="character-prompt-actions">
                    <button id="character-prompt-inject" class="menu_button">
                        <i class="fa-solid fa-arrow-right"></i>
                        Inject Now
                    </button>
                    <button id="character-prompt-clear" class="menu_button">
                        <i class="fa-solid fa-trash"></i>
                        Clear Sheet
                    </button>
                </div>
                <div class="character-prompt-info">
                    <span id="character-prompt-status">Ready</span> • 
                    <span id="character-prompt-count">0 characters</span>
                </div>
                <small class="character-prompt-help">
                    This character sheet will be injected into the selected target location to provide context to the LLM.
                    Use "Inject Now" to manually apply, or enable auto-injection for new messages.
                </small>
            </div>
        `;

        return container;
    }

    // Update settings when UI changes
    function bindUIEvents() {
        const enableToggle = document.getElementById('character-prompt-enabled');
        const sheetTextarea = document.getElementById('character-prompt-textarea');
        const targetSelect = document.getElementById('character-prompt-target');
        const positionSelect = document.getElementById('character-prompt-position');
        const statusElement = document.getElementById('character-prompt-status');
        const countElement = document.getElementById('character-prompt-count');
        const collapseButton = document.getElementById('character-prompt-collapse');
        const contentArea = document.querySelector('.character-prompt-content');
        const container = document.querySelector('.character-prompt-container');
        const injectButton = document.getElementById('character-prompt-inject');
        const clearButton = document.getElementById('character-prompt-clear');

        // Update character count
        const updateCount = () => {
            if (countElement && sheetTextarea) {
                const count = sheetTextarea.value.length;
                countElement.textContent = `${count} characters`;
            }
        };

        // Update status
        const updateStatus = () => {
            if (statusElement) {
                const hasContent = settings.characterSheet.trim().length > 0;
                const status = settings.enabled 
                    ? (hasContent ? 'Active' : 'Enabled (no content)')
                    : 'Disabled';
                statusElement.textContent = status;
                statusElement.style.color = settings.enabled && hasContent ? '#4CAF50' : 
                                          settings.enabled ? '#FF9800' : '#666';
            }
        };

        // Handle collapse/expand
        if (collapseButton && contentArea && container) {
            collapseButton.addEventListener('click', (e) => {
                e.preventDefault();
                settings.collapsed = !settings.collapsed;
                saveSettings();
                
                // Update UI
                if (settings.collapsed) {
                    contentArea.style.display = 'none';
                    container.classList.add('collapsed');
                    collapseButton.querySelector('.collapse-icon').textContent = '▶';
                } else {
                    contentArea.style.display = 'block';
                    container.classList.remove('collapsed');
                    collapseButton.querySelector('.collapse-icon').textContent = '▼';
                }
                
                console.log(`[Character Prompt] Extension ${settings.collapsed ? 'collapsed' : 'expanded'}`);
            });
        }

        if (enableToggle) {
            enableToggle.addEventListener('change', (e) => {
                settings.enabled = e.target.checked;
                saveSettings();
                updateStatus();
                console.log(`[Character Prompt] Extension ${settings.enabled ? 'enabled' : 'disabled'}`);
            });
        }

        if (sheetTextarea) {
            sheetTextarea.addEventListener('input', (e) => {
                settings.characterSheet = e.target.value;
                saveSettings();
                updateCount();
                updateStatus();
            });
            
            // Initial updates
            updateCount();
        }

        if (targetSelect) {
            targetSelect.addEventListener('change', (e) => {
                settings.injectionTarget = e.target.value;
                saveSettings();
                console.log(`[Character Prompt] Injection target changed to: ${settings.injectionTarget}`);
            });
        }

        if (positionSelect) {
            positionSelect.addEventListener('change', (e) => {
                settings.injectionPosition = e.target.value;
                saveSettings();
                console.log(`[Character Prompt] Injection position changed to: ${settings.injectionPosition}`);
            });
        }

        if (injectButton) {
            injectButton.addEventListener('click', (e) => {
                e.preventDefault();
                injectCharacterSheet();
                if (typeof toastr !== 'undefined') {
                    toastr.success('Character sheet injected successfully!', 'Character Prompt');
                } else {
                    console.log('[Character Prompt] Character sheet injected successfully!');
                }
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (sheetTextarea) {
                    sheetTextarea.value = '';
                    settings.characterSheet = '';
                    saveSettings();
                    updateCount();
                    updateStatus();
                }
                if (typeof toastr !== 'undefined') {
                    toastr.info('Character sheet cleared', 'Character Prompt');
                } else {
                    console.log('[Character Prompt] Character sheet cleared');
                }
            });
        }
        
        updateStatus();
    }

    // Inject character sheet into the appropriate target
    function injectCharacterSheet() {
        if (!settings.enabled || !settings.characterSheet.trim()) {
            console.log('[Character Prompt] Extension disabled or no content to inject');
            return;
        }

        const characterSheet = settings.characterSheet.trim();
        const characterPrompt = `[Character Sheet]\n${characterSheet}\n[/Character Sheet]`;
        
        switch (settings.injectionTarget) {
            case 'chat_completion_preset':
                injectToChatCompletionPreset(characterPrompt);
                break;
            case 'authors_note':
                injectToAuthorsNote(characterPrompt);
                break;
            case 'user_persona':
                injectToUserPersona(characterPrompt);
                break;
            default:
                console.warn('[Character Prompt] Unknown injection target:', settings.injectionTarget);
        }
    }

    // Inject to Chat Completion Preset using SillyTavern's extension prompt system
    function injectToChatCompletionPreset(characterPrompt) {
        try {
            // Check if the necessary functions are available
            if (typeof getContext === 'function' && typeof addExtensionPrompt === 'function') {
                const context = getContext();
                if (context) {
                    const priority = settings.injectionPosition === 'start' ? 0 : 1000;
                    addExtensionPrompt(extensionName, characterPrompt, priority, false);
                    console.log('[Character Prompt] Injected to chat completion preset');
                    return true;
                }
            }
            
            console.warn('[Character Prompt] getContext or addExtensionPrompt not available');
            return false;
        } catch (error) {
            console.warn('[Character Prompt] Unable to inject to chat completion preset:', error);
            return false;
        }
    }

    // Inject to Author's Note
    function injectToAuthorsNote(characterPrompt) {
        try {
            const authorsNoteTextarea = document.getElementById('extension_floating_prompt') || 
                                      document.querySelector('#extension_floating_prompt') ||
                                      document.querySelector('.floating_prompt_text');
            if (authorsNoteTextarea) {
                const currentValue = authorsNoteTextarea.value || '';
                
                let newValue;
                if (settings.injectionPosition === 'start') {
                    newValue = characterPrompt + '\n\n' + currentValue;
                } else {
                    newValue = currentValue + '\n\n' + characterPrompt;
                }
                
                authorsNoteTextarea.value = newValue.trim();
                console.log('[Character Prompt] Injected to author\'s note');
            } else {
                console.warn('[Character Prompt] Author\'s note textarea not found');
            }
        } catch (error) {
            console.warn('[Character Prompt] Unable to inject to author\'s note:', error);
        }
    }

    // Inject to User Persona
    function injectToUserPersona(characterPrompt) {
        try {
            const userPersonaTextarea = document.getElementById('persona_description') ||
                                      document.querySelector('#persona_description') ||
                                      document.querySelector('.persona_description');
            if (userPersonaTextarea) {
                const currentValue = userPersonaTextarea.value || '';
                
                let newValue;
                if (settings.injectionPosition === 'start') {
                    newValue = characterPrompt + '\n\n' + currentValue;
                } else {
                    newValue = currentValue + '\n\n' + characterPrompt;
                }
                
                userPersonaTextarea.value = newValue.trim();
                console.log('[Character Prompt] Injected to user persona');
            } else {
                console.warn('[Character Prompt] User persona textarea not found');
            }
        } catch (error) {
            console.warn('[Character Prompt] Unable to inject to user persona:', error);
        }
    }

    // Initialize the extension
    function init() {
        console.log('[Character Prompt] Extension initializing...');
        
        loadSettings();
        
        // Find the best place to add our UI
        const findUILocation = () => {
            // Try to find extensions settings area
            let targetElement = document.querySelector('#extensions_settings') ||
                              document.querySelector('#extensions_settings2') ||
                              document.querySelector('.extensions_settings') ||
                              document.querySelector('#third-party-extensions') ||
                              document.querySelector('.third-party-extensions');
            
            // If no extensions area, try right panel areas
            if (!targetElement) {
                targetElement = document.querySelector('#right-nav-panel') ||
                              document.querySelector('#rightSendForm') ||
                              document.querySelector('.drawer-content');
            }
            
            return targetElement;
        };

        // Try to add UI
        const addUI = () => {
            const targetElement = findUILocation();
            if (targetElement && !document.querySelector('.character-prompt-container')) {
                const ui = createUI();
                targetElement.appendChild(ui);
                bindUIEvents();
                console.log('[Character Prompt] UI added successfully');
                return true;
            }
            return false;
        };

        // Try immediately
        if (addUI()) {
            console.log('[Character Prompt] Extension initialized successfully');
            return;
        }

        // If immediate attempt failed, try with delays
        const retryInit = () => {
            let attempts = 0;
            const maxAttempts = 10;
            
            const tryAgain = () => {
                attempts++;
                if (addUI()) {
                    console.log(`[Character Prompt] Extension initialized successfully after ${attempts} attempts`);
                } else if (attempts < maxAttempts) {
                    setTimeout(tryAgain, 2000);
                } else {
                    console.warn('[Character Prompt] Failed to initialize after maximum attempts');
                }
            };
            
            setTimeout(tryAgain, 1000);
        };

        retryInit();
    }

    // Wait for DOM to be ready, then initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 2000);
        });
    } else {
        // If document is already loaded, wait a bit for SillyTavern to initialize
        setTimeout(init, 2000);
    }

    // Alternative initialization approach for jQuery compatibility
    if (typeof jQuery !== 'undefined') {
        jQuery(document).ready(() => {
            setTimeout(init, 3000);
        });
    }
})();