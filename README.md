# esc-interrupts

A Claude Code mod that makes Esc behave the same way every time: it interrupts the turn.

Normally, pressing Esc before Claude has produced any output un-sends your message and puts it back in the prompt box. With this mod, the message stays sent: Claude Code still cancels the request, but the mod clears the prompt box and adds your message to the conversation with `[Request interrupted by user]`, just as an interrupt after output would. A dim line in the transcript shows the message that was kept.

Limits: messages with images attached, slash commands, and messages queued while Claude is working are left alone. The kept message is drawn as a dim log line rather than a normal prompt row, since mods can't add rows that look typed.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install esc-interrupts --marketplace 01-1/claude-esc-interrupts
```

From a shell:

```
claude plugin install esc-interrupts --marketplace 01-1/claude-esc-interrupts
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `01-1/claude-esc-interrupts`, then Add plugin.
