//set main namespace
goog.provide('juggletest');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('goog.events.KeyCodes');
goog.require('juggletest.BoxBuilder');
goog.require('juggletest.Listeners');

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
		,	points = 0
		,	fruitsDropped = 0
		;

    //add layer and title to the scene
    scene.appendChild(layer);
		
	//initialize the world
	var world = new b2World
	(
		new b2Vec2(0, 5),    //gravity
		true                 //allow sleep
	);

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
		for (i=0;i<fruitToRemove.length;i++)
			{
				fruitsDropped++;
				world.DestroyBody(fruitToRemove.pop());
			}
	};
	

	//Setup the game
	createBoundries(world);
	
	var rightHand = createHand(world, 11, 12, "right"),
		leftHand = createHand(world, 7, 12, "left");

	SetupKeyboardListener(scene, rightHand, leftHand);
	SetupCollisionListener(world);
	SetupMouseListener(world, scene);
	setupDebugWindow();
	
	//Schedule an apple to fall every 5 seconds
	lime.scheduleManager.scheduleWithDelay(function (dt){GenerateFruit(world)}, null, 1000, 0)
	
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
