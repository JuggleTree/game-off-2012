//set main namespace
goog.provide('JuggleTree.Debug');

//get requirements
goog.require('goog.events.KeyCodes');


var 	director
	,	debugScene = new lime.Scene()
	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	,	world
	;
	
	
function SetupDebug(screenWidth, screenHeight)
{
	director = new lime.Director(document.getElementById("canvas"),screenWidth,screenHeight);
	director.replaceScene(debugScene);
	lime.scheduleManager.schedule(function (dt){PrintDebug()}, null);
	StartDebug();
	setupDebugWindow();
}

function PrintDebug()
{
	document.getElementById("mouseX").innerHTML="Mouse X: " + mouseX;
	document.getElementById("mouseY").innerHTML="Mouse Y: " + mouseY;
	//document.getElementById("points").innerHTML="Points: " + points;
	//document.getElementById("fruits").innerHTML="Fruits Dropped: " + fruitsDropped;
}

//This function is only used for Box2d debugging
function update() 
{
	world.Step(1 / 60, 10, 10);
	world.DrawDebugData();
	world.ClearForces();
	
	//Remove objects
	for (i=0;i<fruitToRemove.length;i++)
		{
			//fruitsDropped++;
			world.DestroyBody(fruitToRemove.pop());
		}
};

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

function StartDebug()
{
	//initialize the world
	world = new b2World
	(
		new b2Vec2(0, 2),    //gravity
		true                 //allow sleep
	);
	createBoundries(world);
	
	//Create the juggler
	var rightHand = createHand(world, 11, 12, "right"),
		leftHand = createHand(world, 7, 12, "left"),
		juggler = createJuggler(world, 9,12);

	//Setup Listeners
	SetupKeyboardListener(debugScene, rightHand, leftHand, juggler);
	SetupCollisionListener(world);
	SetupDebugMouseListener(world, debugScene);
	
	var fruitLayer = new lime.Layer();
	//Schedule a fruit to fall every 10 seconds
	lime.scheduleManager.scheduleWithDelay(function (dt){GenerateFruit(world, fruitLayer)}, null, 2000, 0)
}
