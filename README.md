# cc-caffeine ☕⚡

**Transform your 9-to-5 into 9:30-to-4:30.** Arrive 30min later, leave 30min earlier, while getting the same work done because **Claude Code stays powered in your backpack while commuting.**

Work smarter, not longer.

## 🌍 The Modern Developer's Freedom

Tired of your laptop going to sleep during that perfect coding session on the train? Frustrated when Claude Code disconnects mid-commute because your computer decided it was "idle"?

**cc-caffeine is your personal rebellion against screen timeout.** It keeps your machine awake so you can:

- 🚇 Code on the RER between Paris and suburbs
- ☕ Sip a latte at Starbucks during 3-hour debugging sessions
- 🚴‍♂️ Pedal to the coworking space while maintaining your active connection
- 📱 Respond to your girlfriend calls during work hours, without Claude Code interruptions

## 🎯 Installation

```bash
/plugin marketplace add samber/cc
/plugin install cc-caffeine@samber
```

## 🌟 The Nomad Developer Manifesto

> "I'll never choose between coding and traveling again. With cc-caffeine, I can do both. My laptop will never sleep while I traverse cities in 5G, my Claude Code will stay connected in my backpack, and my productivity will soar. The future of mobile development is here, and it smells like coffee."

## ✨ Why It's Pure Magic

**Automatic Intelligence**: cc-caffeine knows when Claude Code is working and prevents your computer from sleeping. Period.

**System Tray Chic**: A tiny ☕️ icon in your status bar to know instantly if you're protected.

**Perfect Sessions**: Multiple simultaneous Claude Code sessions? No problem.

**Zero Configuration**: Install, run, forget. It's like coffee, but for your computer.

## 🎯 Use Cases That Will Change Your Life

### ☕ **The Coffee Shop Marathon**
- 3 hours of focus without ever losing your connection
- No more waking your screen every 5 minutes
- Baristas will recognize you as "the developer who never sleeps"
- Your productivity increases proportionally to your caffeine consumption

### 🏠 **Flexible Remote Work**
- Transform your balcony into an outdoor office
- Code from the terrace in fresh air
- No more choosing between "work" and "enjoy the sunshine"
- Your boss will think you're working 24/7 (that's an advantage, right?)

## 🛠️ Technical Features (With Style)

- **🎯 Session-Based Management**: Intelligently manages multiple simultaneous Claude Code sessions
- **🔄 Auto-Cleanup**: Forget to disable - sessions automatically expire after 15 minutes without tool call or user input
- **🚀 Headless**: Just an elegant discreet system tray icon
- **⚡ Native Sleep Prevention**: Electron's power management - cross-platform sleep prevention
- **🍎 Cross-Platform**: Works on macOS, Linux, and Windows (yes, even Windows!)

## 🎭 Claude Code Integration

Hooks will be configured automatically if you import the project as a Claude Code plugin.

Otherwise, configure your Claude Code hooks for a seamless experience:

```json
{
  "UserPromptSubmit": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "npx cc-caffeine caffeinate"
        }
      ]
    }
  ],
  "PreToolUse": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "npx cc-caffeine caffeinate"
        }
      ]
    }
  ],
  "PostToolUse": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "npx cc-caffeine caffeinate"
        }
      ]
    }
  ],
  "Notification": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "npx cc-caffeine uncaffeinate"
        }
      ]
    }
  ],
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "npx cc-caffeine uncaffeinate"
        }
      ]
    }
  ],
  "SessionEnd": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "npx cc-caffeine uncaffeinate"
        }
      ]
    }
  ]
}
```

## 💡 The Secret Sauce

cc-caffeine uses an intelligent client-server approach:

1. **Lightweight Client** (`caffeinate`/`uncaffeinate`) - No Electron loading, just fast JSON writes
2. **System Server** (`server`) - Headless Electron app that monitors sessions and manages power
3. **Communication** - JSON file with atomic locking for perfect coordination

## 📋 Requirements

- Node.js >= 14.0.0 (your coffee of choice)
- Electron (included automatically, like sugar in your espresso)
- A burning desire to code everywhere, all the time

## 🚀 Run without Claude Code

```bash
# Start server + system tray
# (optional - will be started automatically)
npx cc-caffeine server

claude -p 'Write 10 pages of "lorem ipsum"'

npx cc-caffeine status
```

Manual switch:

```bash
# Activate caffeine for your coding session
echo '{"session_id": "session-abcd"}' | npx cc-caffeine caffeinate

# Your session is now protected!
# Claude can keep working while you sip coffee

# When you're done (or after 15 minutes of auto-cleanup)
echo '{"session_id": "session-abcd"}' | npx cc-caffeine uncaffeinate
```

## 💫 Fuel the Revolution

⭐️ **Star this repo** - Your star powers the caffeine engine!
☕️ **Buy me a coffee** - I'll literally use it to build more features while drinking actual coffee
🚀 **Sponsor the revolution** - Help me defeat screen timeouts worldwide!

[![💖 GitHub Sponsors](https://img.shields.io/github/sponsors/samber?style=for-the-badge)](https://github.com/sponsors/samber)

*Every sponsor gets a virtual high-five and the knowledge that somewhere, a developer is "coding" from a ski track because of you.* ✨

**PS**: If you encounter bugs, remember that even the best coffee has some grounds sometimes. But most of the time, it works like thunder. ⚡☕

## 📄 License

MIT - Use it, modify it, share it. Like good coffee, it's meant to be shared.
