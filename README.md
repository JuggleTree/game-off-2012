## Juggle Tree

![http://juggletree.github.com/game-off-2012/](https://raw.github.com/JuggleTree/game-off-2012/master/Raw%20Images/Title.png)

Little Sticky put on his favorite smiley shirt one morning and had a vision. It showed him a magical tree which grew all sorts of different fruit. Sticky was tasked with collecting as many fruits as possible before his vision ended.

Play the game at [http://juggletree.github.com/game-off-2012/](http://juggletree.github.com/game-off-2012/)

### Gameplay

The fruit tree grows various fruit from it's **branches** and eventually fall. The player must control Sticky to catch the fruit. He can throw two fruit together to have them **merge** and increase in point value. If there are too many fruit for Sticky to handle, he can toss a few in the basket to lighten the load. Dropping fruit will make his shirt angry! Sticky will return to the real world when his vision ends after 2 and a half minutes, or if he drops too many fruits!

### Controls

Use 'A' and 'D' or 'Left' and 'Right' to move Sticky left and right.

Use the mouse to aim and 'Click' to throw a fruit up to that location.

### Building From Source

**Requirements**

* [LimeJS](http://www.limejs.com/)
* [Python 2.6+](http://www.python.org/)
* [Git](http://git-scm.com/download)

Once LimeJS is installed, grab our source code and stick it in the LimeJS 'bin' folder. Edit the JuggleTree.html file and point the Google Closure base to the LimeJS installation of Google Closure. In my case it's 'c:/limejs-232d784/closure/closure/goog/base.js'. Fire up the command prompt and run 'lime.py update' to update all the dependencies. Finally, open up JuggleTree.html in Chrome or Firefox.

### Bugs
There appears to be a bug with a few graphic cards and Chrome. The game is perfectly playable but the background and tree may not show up during gameplay. If this happens please let me know! In the meantime, try Firefox.

### Screenshots

The Title Screen

![JuggleTree](https://raw.github.com/JuggleTree/game-off-2012/master/Raw%20Images/TitleScreen.jpg)

Some Gameplay

![JuggleTree](https://raw.github.com/JuggleTree/game-off-2012/master/Raw%20Images/GamePlay.jpg)

### Credits
* Lead Developer - Jonathan Slabaugh
* Developer - Steven McCarthy
* Artist - Edgar Frank
* Music - Jake Hobrath

### Libraries and Tools
* [LimeJS](http://www.limejs.com/)
* [Google Closure](https://developers.google.com/closure/)
* [Box2d Web](http://code.google.com/p/box2dweb/)
* [TexturePacker](http://www.codeandweb.com/texturepacker)
* [Physics Body Editor](http://code.google.com/p/box2d-editor/)