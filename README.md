# Arma Addon Helper

## Description

This VS Code extension provides reusable commands and snippets to streamline the development process of Arma addons.

Over time the documentation will be extended, naturally, when more commands are added. However, at this time there is only one command available.

## Commands

### CBA: Generate XEH PREP

The following command will automatically generate an `XEH_PREP.hpp` file for each addon in the addons folder, as long as there are functions within that addon. This uses the workspace folder as the root directory to search from.

Functions must follow a naming convention of `fnc_functionName.sqf`. Functions can reside in a subdirectory of the specific addon folder, such as `/addons/myAddon/functions/fnc_doSomething.sqf`, or they can reside at the root addon folder, such as `/addons/myAddon/fnc_doSomething.sqf`.

For the following directory structure,

```
/addons
/addons/main
/addons/myAddon
/addons/myAddon/fnc_doSomething.sqf
```

the extension will generate an `XEH_PREP.hpp` for the `myAddon` folder, `/addons/myAddon/XEH_PREP.hpp`, with the following contents
```cpp
PREP(doSomething);
```
