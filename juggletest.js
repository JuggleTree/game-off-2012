//set main namespace
goog.provide('juggletest');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('goog.events.KeyCodes');
goog.require('juggletest.FruitBuilder');

// entrypoint
juggletest.start = function(){
			
			//Lime2D variables
	var 	director = new lime.Director(document.body,600,400)
	    ,	scene = new lime.Scene()
	    ,	layer = new lime.Layer().setPosition(0,0)
			//Box2d required includes
	    ,   b2Vec2 = Box2D.Common.Math.b2Vec2
		,   b2AABB = Box2D.Collision.b2AABB
		,	b2BodyDef = Box2D.Dynamics.b2BodyDef
		,	b2Body = Box2D.Dynamics.b2Body
		,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
		,	b2Fixture = Box2D.Dynamics.b2Fixture
		,	b2World = Box2D.Dynamics.b2World
		,	b2MassData = Box2D.Collision.Shapes.b2MassData
		,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
		,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
		,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
		,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
		,	b2ContactListener = Box2D.Dynamics.b2ContactListener
			//objects for the game
		,	objectsToRemove = new Array()
		,	mouseX = 300
		,	mouseY = 200
		;

    //add layer and title to the scene
    scene.appendChild(layer);

	director.makeMobileWebAppCapable();

		
	//initialize the world
	var world = new b2World
	(
		new b2Vec2(0, 5),    //gravity
		true                 //allow sleep
	);
	
	//create the listener which runs when 2 thinks collide
	contactListener = new b2ContactListener();
	contactListener.BeginContact = function(contact)
	{
		//Get the 2 objects that collided
		var objectAname = contact.GetFixtureA().GetBody().GetUserData(),
			objectBname = contact.GetFixtureB().GetBody().GetUserData(),
			objectA = contact.GetFixtureA().GetBody(),
			objectB = contact.GetFixtureB().GetBody();
			
		//Check for collision between wall and apple
		if (objectAname == "wall" && objectBname == "apple")
		{
			objectsToRemove.push(objectB);
		}
		if (objectAname == "apple" && objectBname == "wall")
		{
			objectsToRemove.push(objectA);
		}
		
		//Check for collision between hand and apple
		if (objectAname == "hand" && objectBname == "apple")
		{
			calculateTrajectory(objectB);
		}
		if (objectAname == "apple" && objectBname == "hand")
		{
			calculateTrajectory(objectA);
		}
	}
	world.SetContactListener(contactListener);
	
	function calculateTrajectory(object)
	{
		//calculate the initial vertical velocity required to reach the apex
		var height = mouseY - object.GetPosition().y;
		if (height < 0) {height = -height;}
		var gravity = world.GetGravity()
		var velocityY = -Math.sqrt(2*gravity.y*height);
		
		//calculate the time to reach the apex
		var time = -velocityY / gravity.y;
		
		//calculate the initial horizontal velocity required to hit the apex
		var width = mouseX - object.GetPosition().x;
		var velocityX = width / time;
		
		object.SetLinearVelocity(new b2Vec2(velocityX, velocityY));
	}
	
	function createBoundries()
	{
		var wall;
		var fixDef = new b2FixtureDef;
		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.2;
	 
		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_staticBody;
		fixDef.shape = new b2PolygonShape;
		
		fixDef.shape.SetAsBox(20, 2);
		bodyDef.position.Set(10, 400 / 30 + 1.8);
		wall = world.CreateBody(bodyDef)
		wall.CreateFixture(fixDef);
		wall.SetUserData("wall");
		
		bodyDef.position.Set(10, -1.8);
		wall = world.CreateBody(bodyDef)
		wall.CreateFixture(fixDef);
		wall.SetUserData("wall");
		
		fixDef.shape.SetAsBox(2, 14);
		bodyDef.position.Set(-1.8, 13);
		wall = world.CreateBody(bodyDef)
		wall.CreateFixture(fixDef);
		wall.SetUserData("wall");
		
		bodyDef.position.Set(21.8, 13);
		wall = world.CreateBody(bodyDef)
		wall.CreateFixture(fixDef);
		wall.SetUserData("wall");
	}
	
	function createHand(x, y)
	{
		//Create the Body
		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_kinematicBody;
		bodyDef.position.Set(x,y);
		
		var hand = world.CreateBody(bodyDef);
		hand.SetUserData("hand");
		hand.SetSleepingAllowed(false);
		
		//Create the Shape
		var fixDef = new b2FixtureDef;
		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 1;
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(1,0.1);
		hand.CreateFixture(fixDef);
		
		//Return the hand as a reference so the player can move it
		return hand;
	}
	
	function setupDebugWindow()
	{
		var debugDraw = new b2DebugDraw();
			debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
			debugDraw.SetDrawScale(30.0);
			debugDraw.SetFillAlpha(0.5);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			world.SetDebugDraw(debugDraw);
		 
		window.setInterval(update, 1000 / 60);
	}
	 
	function update() 
	{
		world.Step(1 / 60, 10, 10);
		world.DrawDebugData();
		world.ClearForces();
		
		//Remove objects
		for (i=0;i<objectsToRemove.length;i++)
			{world.DestroyBody(objectsToRemove.pop());}
	};
	
	
	//Setup the game
	createBoundries();
	//createApple(5,5,2,world);
	
	var rightHand = createHand(11, 12),
		leftHand = createHand(7, 12);

	setupDebugWindow();
	
	function GenerateApple()
	{
		var x = Math.random() * 17 + 1;
		var y = Math.random() * 3 + 1;
		var size = Math.random() * 2 + 0.4;
		createApple(x,y,size,world);
	}
	
	//Spawn one initial apple
	GenerateApple();
	//Schedule an apple to fall every 5 seconds
	lime.scheduleManager.scheduleWithDelay(function (dt){GenerateApple()}, null, 1000, 0)
	
	//controls
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
		 
	// set current scene active
	director.replaceScene(scene);

	
	//debug stuff
	lime.scheduleManager.schedule(function (dt){PrintDebug()}, null);	
	function PrintDebug()
	{
		document.getElementById("mouseX").innerHTML="Mouse X: " + mouseX;
		document.getElementById("mouseY").innerHTML="Mouse Y: " + mouseY;
	}
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('juggletest.start', juggletest.start);
