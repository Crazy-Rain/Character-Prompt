# Character-Prompt

A SillyTavern extension that adds character sheet information directly to the LLM prompt instead of showing up in responses. This provides better context to the AI without cluttering the conversation.

## Features

- **Retractable UI Tab**: Clean interface in the Extensions Menu
- **Flexible Injection**: Choose where to inject your character sheet:
  - Chat Completion Preset (system prompt)
  - Author's Note
  - User Persona
- **Position Control**: Insert at the beginning or end of the selected target
- **Real-time Integration**: Automatically applies to new messages

## Installation

1. Download or clone this repository
2. Place the files in your SillyTavern extensions directory:
   ```
   SillyTavern/public/scripts/extensions/third-party/character-prompt/
   ```
3. Restart SillyTavern
4. Enable the extension in the Extensions menu

## Usage

1. Open SillyTavern and go to the Extensions menu
2. Find the "Character Prompt" section
3. Check "Enable Character Prompt" 
4. Enter your character sheet in the text area
5. Select your preferred injection target and position
6. The character sheet will automatically be included in your prompts

## Example Character Sheet

```
Name: Detective Sarah Chen
Age: 32
Occupation: Homicide Detective, Metro Police Department
Background: Former military intelligence officer
Personality: Analytical, determined, empathetic but guarded
Skills: Investigation, interrogation, firearms, hand-to-hand combat
Notable traits: Always carries a worn leather notebook, drinks black coffee
Current case: Serial killer targeting tech executives
```

## Injection Targets

- **Chat Completion Preset**: Adds to the system prompt used by the AI model
- **Author's Note**: Integrates with SillyTavern's Author's Note feature
- **User Persona**: Adds to your user character description

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
