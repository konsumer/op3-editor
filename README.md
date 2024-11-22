This is a simple web-based OPL3 manager that uses [opljs](https://github.com/Malvineous/opljs).

You can upload/download imf files, and play with the params.

The purpose of this is to setup presets for use with real chips, and eventually I will hopefully have a way to download them directly to a synth (chip, connected to a real chip, using USB, midi sysex, or something else.)


## TODO

- how does editing work? I am thinking I will need a full-on tracker. 
- show register values on player-seek. [this](https://youtu.be/GmcqKUefY8w) is inspirational.
- upgrade to [opl_plr](http://software.kvee.cz/) which can decode more formats. Port all the file-handling to C as well (so I can use in game-engine and web demos by just handing the functions bytes-pointer.) should support IMF, WLF, RAW, DRO, VGM, VGZ.