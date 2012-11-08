//set main namespace
goog.provide('juggletest.Listeners');

//get requirements
goog.require('goog.events.KeyCodes');
goog.require('juggletest.FruitFunctions');

var		b2Vec2 = Box2D.Common.Math.b2Vec2
	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
	,	b2Body = Box2D.Dynamics.b2Body
	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	,	b2Fixture = Box2D.Dynamics.b2Fixture
	,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
	,	b2ContactListener = Box2D.Dynamics.b2ContactListener
	,	b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
	,	mouseX = 8.5
	,	mouseY = 6
	;
	
//create the listener which runs when 2 thinks collide
function SetupCollisionListener(world)
{
	contactListener = new b2ContactListener();
	contactListener.BeginContact = function(contact)
	{
		//Get the 2 objects that collided
		var objectA = contact.GetFixtureA().GetBody(),
			objectB = contact.GetFixtureB().GetBody();
			
		//boundries and fruit collide
		if (objectA.GetUserData().type == "wall" && objectB.GetUserData().type == "fruit")
		{
			RemoveFruit(objectB);
		}
		if (objectA.GetUserData().type == "fruit" && objectB.GetUserData().type == "wall")
		{
			RemoveFruit(objectA);
		}
		
		//hand and fruit collide
		if (objectA.GetUserData().type == "fruit" && objectB.GetUserData().type == "hand")
		{
			CatchFruit(world, objectA, objectB, objectB.GetUserData().name);
		}
		if (objectA.GetUserData().type == "hand" && objectB.GetUserData().type == "fruit")
		{
			CatchFruit(world, objectB, objectA, objectA.GetUserData().name);
		}
	}
	world.SetContactListener(contactListener);
}
	
function SetupKeyboardListener(scene, rightHand, leftHand)
{
	goog.events.listen(scene, ['keydown'], function(e){
		if (e.event.keyCode == goog.events.KeyCodes.LEFT)
		{
			rightHand.SetLinearVelocity(new b2Vec2(-7, 0));
			leftHand.SetLinearVelocity(new b2Vec2(-7, 0));
		}
		if (e.event.keyCode == goog.events.KeyCodes.RIGHT)
		{
			rightHand.SetLinearVelocity(new b2Vec2(7, 0));
			leftHand.SetLinearVelocity(new b2Vec2(7, 0));
		}
	});
	
	goog.events.listen(scene, ['keyup'], function(e){
		var velocity = leftHand.GetLinearVelocity().x;
		if ((e.event.keyCode == goog.events.KeyCodes.LEFT
			&& velocity < 0)
			|| (e.event.keyCode == goog.events.KeyCodes.RIGHT
			&& velocity > 0))
		{
			rightHand.SetLinearVelocity(new b2Vec2(0, 0));
			leftHand.SetLinearVelocity(new b2Vec2(0, 0));
		}
	});
}
	
function SetupMouseListener(world, scene)
{	
	//track where the mouse is on screen and lock to screen boundries
	document.addEventListener(['mousemove'], function(e){
		var canvasPosition = getElementPosition(document.getElementById("canvas"));
		mouseX = e.clientX - canvasPosition.x;
        mouseY = e.clientY - canvasPosition.y;
		if (mouseX > 600) {mouseX = 600;}
		if (mouseY > 400) {mouseY = 400;}
		mouseX = mouseX/30;
		mouseY = mouseY/30;
	},true);
	
	goog.events.listen(scene, ['click'], function(e){ThrowFruit(world)});
}	
	 
	 //mouse helper function to determine where the screen is located
	 //http://js-tut.aardon.de/js-tut/tutorial/position.html
	 function getElementPosition(element) {
		var elem=element, tagname="", x=0, y=0;
	   
		while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
		   y += elem.offsetTop;
		   x += elem.offsetLeft;
		   tagname = elem.tagName.toUpperCase();

		   if(tagname == "BODY")
			  elem=0;

		   if(typeof(elem) == "object") {
			  if(typeof(elem.offsetParent) == "object")
				 elem = elem.offsetParent;
		   }
		}

		return {x: x, y: y};
	 }

