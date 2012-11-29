goog.provide('JuggleTree.Popups');

goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');

var layer;

function SetupPopupManager(layer)
{
	this.layer = layer;
}

function CreatePopup(text, x, y, opt_color)
{
	if (opt_color != null)
		popup = new lime.Label().setFontSize(12).setFontColor(opt_color).setPosition(x,y).setText(text);
	else
		popup = new lime.Label().setFontSize(12).setFontColor('#22F').setPosition(x,y).setText(text);
	
	layer.appendChild(popup);

	popup.runAction(new lime.animation.Spawn(
		new lime.animation.FadeTo(0).setDuration(1),
		new lime.animation.ScaleTo(3).setDuration(1),
		new lime.animation.MoveTo(x,y-10).setDuration(1)
	));
	
	lime.scheduleManager.callAfter(function (dt){RemovePopup(layer, popup);}, layer, 1000)
}

function RemovePopup(popup)
{
	layer.removeChild(popup);
}