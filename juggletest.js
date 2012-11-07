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
		,	b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
			//objects for the game
		,	objectsToRemove = new Array()
		,	mouseX = 8.5
		,	mouseY = 6
		,	points = 0
		,	fruitsDropped = 0
		,	leftHandJoint = "empty"
		,	rightHandJoint = "empty"
		;

    //add layer and title to the scene
    scene.appendChild(layer);

	director.makeMobileWebAppCapable();

	function gameObject(type, name)
	{
		this.type=type; //ex: fruit, hand, powerup
		this.name=name; //ex: apple, orange, watermelon
	}
		
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
		var objectA = contact.GetFixtureA().GetBody(),
			objectB = contact.GetFixtureB().GetBody();
			
		//Check for collision between wall and apple
		if (objectA.GetUserData().type == "wall" && objectB.GetUserData().type == "fruit")
		{
			objectsToRemove.push(objectB);
		}
		if (objectA.GetUserData().type == "fruit" && objectB.GetUserData().type == "wall")
		{
			objectsToRemove.push(objectA);
		}
		
		//Check for collision between hand and apple
		if (objectA.GetUserData().type == "fruit" && objectB.GetUserData().type == "hand")
		{
			points++;
			if (objectB.GetUserData().name == "left" && leftHandJoint == "empty")
			{
				jointDef = new b2DistanceJointDef();
				jointDef.Initialize(objectA, objectB, objectA.GetPosition(), objectB.GetPosition());
				jointDef.collideConnected = true;
				leftHandJoint = world.CreateJoint(jointDef);
			}
			if (objectB.GetUserData().name == "right" && rightHandJoint == "empty")
			{
				jointDef = new b2DistanceJointDef();
				jointDef.Initialize(objectA, objectB, objectA.GetPosition(), objectB.GetPosition());
				jointDef.collideConnected = true;
				rightHandJoint = world.CreateJoint(jointDef);
			}
		}
		if (objectA.GetUserData().type == "hand" && objectB.GetUserData().type == "fruit")
		{
			points++;
			if (objectB.GetUserData().name == "left" && leftHandJoint == "empty")
			{
				jointDef = new b2DistanceJointDef();
				jointDef.Initialize(objectA, objectB, objectA.GetPosition(), objectB.GetPosition());
				jointDef.collideConnected = true;
				leftHandJoint = world.CreateJoint(jointDef);
			}
			if (objectB.GetUserData().name == "right" && rightHandJoint == "empty")
			{
				jointDef = new b2DistanceJointDef();
				jointDef.Initialize(objectA, objectB, objectA.GetPosition(), objectB.GetPosition());
				jointDef.collideConnected = true;
				rightHandJoint = world.CreateJoint(jointDef);
			}
		}
	}
	world.SetContactListener(contactListener);
	
	function throwObject(object)
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
		wall.SetUserData(new gameObject("wall","bottom"));
		
		bodyDef.position.Set(10, -1.8);
		wall = world.CreateBody(bodyDef)
		wall.CreateFixture(fixDef);
		wall.SetUserData(new gameObject("wall","top"));
		
		fixDef.shape.SetAsBox(2, 14);
		bodyDef.position.Set(-1.8, 13);
		wall = world.CreateBody(bodyDef)
		wall.CreateFixture(fixDef);
		wall.SetUserData(new gameObject("wall","left"));
		
		bodyDef.position.Set(21.8, 13);
		wall = world.CreateBody(bodyDef)
		wall.CreateFixture(fixDef);
		wall.SetUserData(new gameObject("wall","right"));
	}
	
	function createHand(x, y, name)
	{
		//Create the Body
		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_kinematicBody;
		bodyDef.position.Set(x,y);
		
		var hand = world.CreateBody(bodyDef);
		hand.SetUserData(new gameObject("hand",name));
		hand.SetSleepingAllowed(false);
		
		//Create the Shape
		var fixDef = new b2FixtureDef;
		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0;
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(1,0.1);
		hand.CreateFixture(fixDef);
		
		//Return the hand as a reference so the player can move it
		return hand;
	}
	
	function createApple(x, y, size)
	{
		//Create the Body
		var bodyDef = new b2BodyDef;
		bodyDef.position.Set(x,y);
		bodyDef.type = b2Body.b2_dynamicBody;
		
		var apple = world.CreateBody(bodyDef)
		apple.SetUserData(new gameObject("fruit","apple"));
		apple.SetAngle(Math.PI);
		
		//Create the Polygons
		var fixDef = new b2FixtureDef;
		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.2;

		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsArray([new b2Vec2(0*size,-0.32*size),new b2Vec2(0.24*size,-0.34*size),new b2Vec2(0.5*size,-0.1*size),new b2Vec2(0.48*size,0.2*size)],4);
		apple.CreateFixture(fixDef);

		fixDef.shape.SetAsArray([new b2Vec2(0.48*size,0.2*size),new b2Vec2(-0.1*size,0.24*size),new b2Vec2(-0.3*size,0.24*size),new b2Vec2(-0.5*size,0.1*size),new b2Vec2(-0.5*size,-0.08*size)],5);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(-0.5*size,-0.08*size),new b2Vec2(-0.28*size,-0.34*size),new b2Vec2(-0.18*size,-0.4*size),new b2Vec2(-0.1*size,-0.4*size),new b2Vec2(0*size,-0.32*size),new b2Vec2(0.48*size,0.2*size)],6);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(0.16*size,0.32*size),new b2Vec2(0.2*size,0.4*size),new b2Vec2(-0.04*size,0.3*size)],3);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(-0.04*size,0.3*size),new b2Vec2(-0.1*size,0.42*size),new b2Vec2(-0.2*size,0.36*size),new b2Vec2(-0.1*size,0.24*size)],4);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(-0.1*size,0.24*size),new b2Vec2(0.48*size,0.2*size),new b2Vec2(0.3*size,0.32*size),new b2Vec2(0.16*size,0.32*size),new b2Vec2(-0.04*size,0.3*size)],5);
		apple.CreateFixture(fixDef);
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
			{
				fruitsDropped++;
				world.DestroyBody(objectsToRemove.pop());
			}
	};
	
	
	//Setup the game
	createBoundries();
	
	var rightHand = createHand(11, 12, "right"),
		leftHand = createHand(7, 12, "left");

	setupDebugWindow();
	
	function GenerateApple()
	{
		var x = Math.random() * 17 + 1;
		var y = Math.random() * 3 + 1;
		var size = Math.random() * 2 + 0.4;
		createApple(x,y,size);
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
	
		goog.events.listen(scene, ['click'], function(e){
		if (rightHandJoint != "empty")
		{
			if (rightHandJoint.GetBodyA().GetUserData().type == "fruit")
			{
				var object = rightHandJoint.GetBodyA();
				world.DestroyJoint(rightHandJoint);
				throwObject(object);
				rightHandJoint = "empty";
			}
			else if (rightHandJoint.GetBodyB().GetUserData().type == "fruit")
			{
				var object = rightHandJoint.GetBodyB();
				world.DestroyJoint(rightHandJoint);
				throwObject(object);
				rightHandJoint = "empty";
			}
		}
		else if (leftHandJoint != "empty")
		{
			if (leftHandJoint.GetBodyA().GetUserData().type == "fruit")
			{
				var object = leftHandJoint.GetBodyA();
				world.DestroyJoint(leftHandJoint);
				throwObject(object);
				leftHandJoint = "empty";
			}
			else if (leftHandJoint.GetBodyB().GetUserData().type == "fruit")
			{
				var object = leftHandJoint.GetBodyB();
				world.DestroyJoint(leftHandJoint);
				throwObject(object);
				leftHandJoint = "empty";
			}
		}
	});
	
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
		document.getElementById("points").innerHTML="Points: " + points;
		document.getElementById("fruits").innerHTML="Fruits Dropped: " + fruitsDropped;
	}
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('juggletest.start', juggletest.start);
