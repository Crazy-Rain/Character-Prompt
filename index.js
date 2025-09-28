(function() {
    'use strict';
    
    const extensionName = 'character-prompt';
    const defaultSettings = {
        enabled: true,
        characterSheet: '',
        injectionTarget: 'chat_completion_preset', // 'chat_completion_preset', 'authors_note', 'user_persona'
        injectionPosition: 'end' // 'start', 'end'
    };

    // Extension settings
    let settings = {};

    /**
     * Load settings from the extension settings
     */
    function loadSettings() {
        // Check if extension_settings is available
        if (typeof extension_settings === 'undefined') {
            console.warn('Character Prompt: extension_settings not available, deferring settings load');
            return;
        }
        
        if (!extension_settings[extensionName]) {
            extension_settings[extensionName] = { ...defaultSettings };
        }
        settings = extension_settings[extensionName];
        
        // Update UI elements if they exist
        if ($('#character_prompt_enabled').length) {
            $('#character_prompt_enabled').prop('checked', settings.enabled);
            $('#character_prompt_text').val(settings.characterSheet);
            $('#character_prompt_target').val(settings.injectionTarget);
            $('#character_prompt_position').val(settings.injectionPosition);
        }
    }

    /**
     * Save settings to the extension settings
     */
    function saveExtensionSettings() {
        settings.enabled = $('#character_prompt_enabled').prop('checked');
        settings.characterSheet = $('#character_prompt_text').val();
        settings.injectionTarget = $('#character_prompt_target').val();
        settings.injectionPosition = $('#character_prompt_position').val();
        
        if (typeof extension_settings !== 'undefined') {
            extension_settings[extensionName] = settings;
            
            // Use saveSettingsDebounced if available, otherwise save immediately
            if (typeof saveSettingsDebounced === 'function') {
                saveSettingsDebounced();
            } else if (typeof saveSettings === 'function') {
                saveSettings();
            }
        }
    }

    /**
     * Inject character sheet into the appropriate target
     */
    function injectCharacterSheet() {
        if (!settings.enabled || !settings.characterSheet.trim()) {
            return;
        }

        const characterSheet = settings.characterSheet.trim();
        
        switch (settings.injectionTarget) {
            case 'chat_completion_preset':
                injectToChatCompletionPreset(characterSheet);
                break;
            case 'authors_note':
                injectToAuthorsNote(characterSheet);
                break;
            case 'user_persona':
                injectToUserPersona(characterSheet);
                break;
        }
    }

    /**
     * Inject to Chat Completion Preset
     */
    function injectToChatCompletionPreset(characterSheet) {
        try {
            // Check if the necessary functions are available
            if (typeof getContext === 'function' && typeof addExtensionPrompt === 'function') {
                const context = getContext();
                if (context) {
                    const promptText = `[Character Sheet]\n${characterSheet}\n[/Character Sheet]`;
                    addExtensionPrompt(extensionName, promptText, settings.injectionPosition === 'start' ? 0 : 1000, false);
                    return true;
                }
            }
            
            console.warn('Character Prompt: getContext or addExtensionPrompt not available');
            return false;
        } catch (error) {
            console.warn('Character Prompt: Unable to inject to chat completion preset:', error);
            return false;
        }
    }

    /**
     * Inject to Author's Note
     */
    function injectToAuthorsNote(characterSheet) {
        try {
            const authorsNoteTextarea = $('#extension_floating_prompt');
            if (authorsNoteTextarea.length) {
                const currentValue = authorsNoteTextarea.val() || '';
                const characterPrompt = `[Character Sheet]\n${characterSheet}\n[/Character Sheet]`;
                
                let newValue;
                if (settings.injectionPosition === 'start') {
                    newValue = characterPrompt + '\n\n' + currentValue;
                } else {
                    newValue = currentValue + '\n\n' + characterPrompt;
                }
                
                authorsNoteTextarea.val(newValue.trim());
            }
        } catch (error) {
            console.warn('Character Prompt: Unable to inject to authors note:', error);
        }
    }

    /**
     * Inject to User Persona
     */
    function injectToUserPersona(characterSheet) {
        try {
            const userPersonaTextarea = $('#persona_description');
            if (userPersonaTextarea.length) {
                const currentValue = userPersonaTextarea.val() || '';
                const characterPrompt = `[Character Sheet]\n${characterSheet}\n[/Character Sheet]`;
                
                let newValue;
                if (settings.injectionPosition === 'start') {
                    newValue = characterPrompt + '\n\n' + currentValue;
                } else {
                    newValue = currentValue + '\n\n' + characterPrompt;
                }
                
                userPersonaTextarea.val(newValue.trim());
            }
        } catch (error) {
            console.warn('Character Prompt: Unable to inject to user persona:', error);
        }
    }

    /**
     * Create the extension UI
     */
    function createUI() {
        const html = `
            <div id="character_prompt_container" class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>Character Prompt</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <div class="character-prompt-settings">
                        <label class="checkbox_label" for="character_prompt_enabled">
                            <input type="checkbox" id="character_prompt_enabled" />
                            <span>Enable Character Prompt</span>
                        </label>
                        
                        <div class="character-prompt-group">
                            <label for="character_prompt_target">Injection Target:</label>
                            <select id="character_prompt_target" class="text_pole">
                                <option value="chat_completion_preset">Chat Completion Preset</option>
                                <option value="authors_note">Author's Note</option>
                                <option value="user_persona">User Persona</option>
                            </select>
                        </div>
                        
                        <div class="character-prompt-group">
                            <label for="character_prompt_position">Injection Position:</label>
                            <select id="character_prompt_position" class="text_pole">
                                <option value="start">Beginning</option>
                                <option value="end">End</option>
                            </select>
                        </div>
                        
                        <div class="character-prompt-group">
                            <label for="character_prompt_text">Character Sheet:</label>
                            <textarea id="character_prompt_text" class="text_pole textarea_compact" 
                                      placeholder="Enter your character sheet information here...&#10;&#10;Example:&#10;Name: John Doe&#10;Age: 25&#10;Occupation: Detective&#10;Personality: Analytical, determined, empathetic"
                                      rows="8"></textarea>
                        </div>
                        
                        <div class="character-prompt-actions">
                            <button id="character_prompt_inject" class="menu_button" type="button">
                                <i class="fa-solid fa-arrow-right"></i>
                                Inject Now
                            </button>
                            <button id="character_prompt_clear" class="menu_button" type="button">
                                <i class="fa-solid fa-trash"></i>
                                Clear Sheet
                            </button>
                        </div>
                        
                        <small class="character-prompt-help">
                            This character sheet will be injected into the selected target location to provide context to the LLM.
                            Use "Inject Now" to manually apply, or enable auto-injection for new messages.
                        </small>
                    </div>
                </div>
            </div>
        `;
        
        $('#extensions_settings2').append(html);
        
        // Add event listeners
        $('#character_prompt_enabled').on('change', saveExtensionSettings);
        $('#character_prompt_text').on('input', saveExtensionSettings);
        $('#character_prompt_target').on('change', saveExtensionSettings);
        $('#character_prompt_position').on('change', saveExtensionSettings);
        
        // Manual injection button
        $('#character_prompt_inject').on('click', function() {
            injectCharacterSheet();
            toastr.success('Character sheet injected successfully!', 'Character Prompt');
        });
        
        // Clear button
        $('#character_prompt_clear').on('click', function() {
            $('#character_prompt_text').val('').trigger('input');
            toastr.info('Character sheet cleared', 'Character Prompt');
        });
    }

    /**
     * Initialize the extension
     */
    function init() {
        console.log('Character Prompt extension starting initialization');
        
        // Ensure default settings exist
        settings = { ...defaultSettings };
        
        // Load settings first
        loadSettings();
        
        // Create UI
        createUI();
        
        // Hook into message generation events if available
        if (typeof eventSource !== 'undefined' && typeof event_types !== 'undefined') {
            eventSource.on(event_types.CHAT_CHANGED, () => {
                if (settings.enabled) {
                    injectCharacterSheet();
                }
            });
            
            eventSource.on(event_types.MESSAGE_SENT, () => {
                if (settings.enabled) {
                    injectCharacterSheet();
                }
            });
        }
        
        // Load settings again once UI is created
        setTimeout(loadSettings, 100);
        
        console.log('Character Prompt extension loaded successfully');
    }

    /**
     * Wait for SillyTavern to be ready, then initialize
     */
    function waitForSillyTavern() {
        // Check if essential SillyTavern globals are available
        if (typeof $ !== 'undefined' && typeof extension_settings !== 'undefined' && $('#extensions_settings2').length > 0) {
            init();
        } else {
            // Wait and try again
            console.log('Character Prompt: Waiting for SillyTavern to be ready...');
            setTimeout(waitForSillyTavern, 500);
        }
    }

    // Start the initialization process
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForSillyTavern);
    } else {
        waitForSillyTavern();
    }

})();