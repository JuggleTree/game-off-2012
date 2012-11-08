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
juggletest.start = function(debug){
			
			//Lime2D variables
	var 	director
		,	gameplayScene = new lime.Scene()
			//Box2d required includes
		,   b2Vec2 = Box2D.Common.Math.b2Vec2
		,	b2World = Box2D.Dynamics.b2World
		,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
			//objects for the game
		,	points = 0
		,	fruitsDropped = 0
		,	world
		;

	if (debug)
		{director = new lime.Director(document.getElementById("canvas"),600,400)}
	else
		{director = new lime.Director(document.body,600,400)}
		
	//Setup the game
	director.replaceScene(gameplayScene);
	StartGame();
	
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
		
	function StartGame()
	{
		//initialize the world
	world = new b2World
	(
		new b2Vec2(0, 2),    //gravity
		true                 //allow sleep
	);
		createBoundries(world);
		
		var rightHand = createHand(world, 11, 12, "right"),
			leftHand = createHand(world, 7, 12, "left");

		SetupKeyboardListener(gameplayScene, rightHand, leftHand);
		SetupCollisionListener(world);
		SetupMouseListener(debug, world, gameplayScene);
		if (debug)
			{setupDebugWindow();}
		
		//generate the first fruit immediately
		GenerateFruit(world);
		//Schedule a fruit to fall every 10 seconds
		lime.scheduleManager.scheduleWithDelay(function (dt){GenerateFruit(world)}, null, 10000, 0)
	}
		
	//Add debug info to the page
	if (debug)
	{lime.scheduleManager.schedule(function (dt){PrintDebug()}, null);}
	
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
