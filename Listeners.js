//set main namespace
goog.provide('JuggleTree.Listeners');

//get requirements
goog.require('goog.events.KeyCodes');
goog.require('JuggleTree.FruitFunctions');

var		b2Vec2 = Box2D.Common.Math.b2Vec2
	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
	,	b2Body = Box2D.Dynamics.b2Body
	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	,	b2Fixture = Box2D.Dynamics.b2Fixture
	,	b2ContactListener = Box2D.Dynamics.b2ContactListener
	,	b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef
	,	mouseX = 8.5
	,	mouseY = 6
	,	fruitsDropped = 0
	,	movementSpeed = 9
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
		if (objectA.GetUserData().type == "wall" && objectA.GetUserData().name == "bottom" && objectB.GetUserData().type == "fruit")
		{
			fruitsDropped++;
			RemoveFruit(objectB);
		}
		if (objectA.GetUserData().type == "fruit" && objectB.GetUserData().type == "wall"  && objectB.GetUserData().name == "bottom" )
		{
			fruitsDropped++;
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
		
		//2 fruits collide
		if (objectA.GetUserData().type == "fruit" && objectB.GetUserData().type == "fruit")
		{
			//the fruits are the same
			if (objectA.GetUserData().name == objectB.GetUserData().name)
			{
				if (!objectA.GetUserData().collide || !objectB.GetUserData().collide)
					{MergeFruits(world, objectA, objectB);}
			}
			//the fruits are different
			if (objectA.GetUserData().name != objectB.GetUserData().name)
			{
				CheckForDrop(objectA, objectB);
				//ForkFruits(world, objectA, objectB);
			}
		}

		//fruit and basket collide
		if (objectA.GetUserData().type == "fruit" && objectB.GetUserData().type == "basket" && objectB.GetUserData().name == "floor")
		{
			FruitCaughtInBasket(world, objectA, objectB, objectB.GetUserData().name);
		}
		if (objectA.GetUserData().type == "basket" && objectA.GetUserData().name == "floor" && objectB.GetUserData().type == "fruit")
		{
			FruitCaughtInBasket(world, objectB, objectA, objectA.GetUserData().name);
		}
	}
	world.SetContactListener(contactListener);
}
	
function SetupKeyboardListener(scene, rightHand, leftHand, juggler, director)
{
	goog.events.listen(scene, ['keydown'], function(e){
		if ((e.event.keyCode == goog.events.KeyCodes.LEFT 
			|| e.event.keyCode == goog.events.KeyCodes.A)
			&& leftHand.GetPosition().x > 3.7)
		{
			//var x = leftHand.GetPosition().x;
			rightHand.SetLinearVelocity(new b2Vec2(-movementSpeed, 0));
			leftHand.SetLinearVelocity(new b2Vec2(-movementSpeed, 0));
			juggler.SetLinearVelocity(new b2Vec2(-movementSpeed, 0));
		}
		if ((e.event.keyCode == goog.events.KeyCodes.RIGHT
			 || e.event.keyCode == goog.events.KeyCodes.E
			  || e.event.keyCode == goog.events.KeyCodes.D)
			  && rightHand.GetPosition().x < 16.2)
		{
			rightHand.SetLinearVelocity(new b2Vec2(movementSpeed, 0));
			leftHand.SetLinearVelocity(new b2Vec2(movementSpeed, 0));
			juggler.SetLinearVelocity(new b2Vec2(movementSpeed, 0));
		}
	});
	
	goog.events.listen(scene, ['keyup'], function(e){
		var velocity = leftHand.GetLinearVelocity().x;
		if ((e.event.keyCode == goog.events.KeyCodes.LEFT
			|| e.event.keyCode == goog.events.KeyCodes.A
			&& velocity < 0)
			|| (e.event.keyCode == goog.events.KeyCodes.RIGHT
			|| e.event.keyCode == goog.events.KeyCodes.E
			|| e.event.keyCode == goog.events.KeyCodes.D
			&& velocity > 0))
		{
			rightHand.SetLinearVelocity(new b2Vec2(0, 0));
			leftHand.SetLinearVelocity(new b2Vec2(0, 0));
			juggler.SetLinearVelocity(new b2Vec2(0, 0));
		}
	});
}
	
function SetupMouseListener(world, scene)
{
	var canvasPosition = getElementPosition(document.body);

	goog.events.listen(scene, ['mousemove'], function(e)
	{
		var position = e.position;
		mouseX = position.x/30;
		mouseY = position.y/30;
	});
	
	goog.events.listen(scene, ['click'], function(e){ThrowFruit(world)});
}

function SetupDebugMouseListener(world, scene)
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

