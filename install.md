# Installation Guide

## Method 1: Manual Installation

1. Download all files from this repository:
   - `manifest.json`
   - `index.js`
   - `style.css`

2. Navigate to your SillyTavern installation directory and create the extension folder:
   ```
   SillyTavern/public/scripts/extensions/third-party/character-prompt/
   ```

3. Copy all downloaded files into this folder.

4. Restart SillyTavern.

5. Go to Extensions → Manage Extensions and enable "Character Prompt".

## Method 2: Git Clone

1. Navigate to your SillyTavern extensions directory:
   ```bash
   cd SillyTavern/public/scripts/extensions/third-party/
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/Crazy-Rain/Character-Prompt.git character-prompt
   ```

3. Restart SillyTavern.

4. Enable the extension from the Extensions menu.

## Verification

After installation, you should see:
- "Character Prompt" section in the Extensions menu
- A retractable drawer with configuration options
- Text area for entering character sheet information
- Dropdown menus for injection target and position

## Troubleshooting

If the extension doesn't appear:
1. Check that files are in the correct directory structure
2. Verify SillyTavern was restarted after installation
3. Check the browser console for any JavaScript errors
4. Ensure all files are present (manifest.json, index.js, style.css)

## Directory Structure

Your final directory structure should look like:
```
SillyTavern/
└── public/
    └── scripts/
        └── extensions/
            └── third-party/
                └── character-prompt/
                    ├── manifest.json
                    ├── index.js
                    ├── style.css
                    ├── README.md
                    └── install.md
```