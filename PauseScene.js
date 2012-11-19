goog.provide('JuggleTree.PauseScene');

goog.require('lime.Label');
goog.require('lime.Scene');
goog.require('lime.Sprite');
 
/**
 * PauseScene. This scene overrides the default pause screne.
 * @constructor
 * @extends lime.Scene
 */
lime.helper.PauseScene = function() {
    lime.Scene.call(this);

    this.domElement.style.cssText = 'background:rgba(255,255,255,0.5)';

    //WTF this label doesn't show up
    var label = new lime.Label().setText('Paused').setPosition(100,100);
    this.appendChild(label);
	
	//listener to unpause the screen
	goog.events.listen(this, ['keydown'], function(e){
		if (e.event.keyCode == goog.events.KeyCodes.ENTER)
		{
			this.getDirector().setPaused(false);
		}
	});
    
};
goog.inherits(lime.helper.PauseScene, lime.Scene); 