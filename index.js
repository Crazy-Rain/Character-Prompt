import { saveSettingsDebounced } from '../../../script.js';
import { extension_settings, getContext } from '../../extensions.js';
import { eventSource, event_types } from '../../../script.js';

const extensionName = 'character-prompt';
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const defaultSettings = {
    enabled: true,
    characterSheet: '',
    injectionTarget: 'chat_completion_preset', // 'chat_completion_preset', 'authors_note', 'user_persona'
    injectionPosition: 'end' // 'start', 'end'
};

// Extension settings
let settings = extension_settings[extensionName] || {};

// Ensure default settings exist
Object.keys(defaultSettings).forEach(key => {
    if (settings[key] === undefined) {
        settings[key] = defaultSettings[key];
    }
});

extension_settings[extensionName] = settings;

/**
 * Load settings from the extension settings
 */
function loadSettings() {
    settings = extension_settings[extensionName] || defaultSettings;
    
    // Update UI elements
    $('#character_prompt_enabled').prop('checked', settings.enabled);
    $('#character_prompt_text').val(settings.characterSheet);
    $('#character_prompt_target').val(settings.injectionTarget);
    $('#character_prompt_position').val(settings.injectionPosition);
}

/**
 * Save settings to the extension settings
 */
function saveSettings() {
    settings.enabled = $('#character_prompt_enabled').prop('checked');
    settings.characterSheet = $('#character_prompt_text').val();
    settings.injectionTarget = $('#character_prompt_target').val();
    settings.injectionPosition = $('#character_prompt_position').val();
    
    extension_settings[extensionName] = settings;
    saveSettingsDebounced();
}

/**
 * Inject character sheet into the appropriate target
 */
function injectCharacterSheet() {
    if (!settings.enabled || !settings.characterSheet.trim()) {
        return;
    }

    const characterSheet = settings.characterSheet.trim();
    const context = getContext();
    
    switch (settings.injectionTarget) {
        case 'chat_completion_preset':
            injectToChatCompletionPreset(characterSheet, context);
            break;
        case 'authors_note':
            injectToAuthorsNote(characterSheet, context);
            break;
        case 'user_persona':
            injectToUserPersona(characterSheet, context);
            break;
    }
}

/**
 * Inject to Chat Completion Preset
 */
function injectToChatCompletionPreset(characterSheet, context) {
    try {
        // Access the chat completion preset system prompt
        if (context.chatCompletionPromptManager) {
            const promptPrefix = `[Character Sheet]\n${characterSheet}\n[/Character Sheet]\n\n`;
            
            // Add to the beginning or end of system prompt
            if (settings.injectionPosition === 'start') {
                context.chatCompletionPromptManager.systemPromptPrefix = promptPrefix + (context.chatCompletionPromptManager.systemPromptPrefix || '');
            } else {
                context.chatCompletionPromptManager.systemPromptSuffix = (context.chatCompletionPromptManager.systemPromptSuffix || '') + '\n\n' + promptPrefix;
            }
        }
    } catch (error) {
        console.warn('Character Prompt: Unable to inject to chat completion preset:', error);
    }
}

/**
 * Inject to Author's Note
 */
function injectToAuthorsNote(characterSheet, context) {
    try {
        const authorsNote = context.extensionPrompts?.find(p => p.identifier === 'authors_note');
        if (authorsNote) {
            const characterPrompt = `[Character Sheet]\n${characterSheet}\n[/Character Sheet]`;
            
            if (settings.injectionPosition === 'start') {
                authorsNote.value = characterPrompt + '\n\n' + (authorsNote.value || '');
            } else {
                authorsNote.value = (authorsNote.value || '') + '\n\n' + characterPrompt;
            }
        }
    } catch (error) {
        console.warn('Character Prompt: Unable to inject to authors note:', error);
    }
}

/**
 * Inject to User Persona
 */
function injectToUserPersona(characterSheet, context) {
    try {
        if (context.user && context.user.description !== undefined) {
            const characterPrompt = `[Character Sheet]\n${characterSheet}\n[/Character Sheet]`;
            
            if (settings.injectionPosition === 'start') {
                context.user.description = characterPrompt + '\n\n' + (context.user.description || '');
            } else {
                context.user.description = (context.user.description || '') + '\n\n' + characterPrompt;
            }
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
                    
                    <small class="character-prompt-help">
                        This character sheet will be injected into the selected target location to provide context to the LLM.
                    </small>
                </div>
            </div>
        </div>
    `;
    
    $('#extensions_settings2').append(html);
    
    // Add event listeners
    $('#character_prompt_enabled').on('change', saveSettings);
    $('#character_prompt_text').on('input', saveSettings);
    $('#character_prompt_target').on('change', saveSettings);
    $('#character_prompt_position').on('change', saveSettings);
}

/**
 * Initialize the extension
 */
jQuery(async () => {
    // Load settings
    loadSettings();
    
    // Create UI
    createUI();
    
    // Hook into message generation events
    eventSource.on(event_types.CHAT_CHANGED, injectCharacterSheet);
    eventSource.on(event_types.MESSAGE_SENT, injectCharacterSheet);
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, injectCharacterSheet);
    
    console.log('Character Prompt extension loaded');
});