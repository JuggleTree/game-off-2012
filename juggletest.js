//set main namespace
goog.provide('juggletest');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.RoundedRect');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.FadeTo');
goog.require('goog.events.KeyCodes');
goog.require('juggletest.BoxBuilder');
goog.require('juggletest.Listeners');

// entrypoint
juggletest.start = function(debug){
			
			//Lime2D variables
	var 	director
		,	gameplayScene = new lime.Scene()
		,	titleScene
		,	fruitLayer
		,	buttonLayer
		,	backgroundLayer
			//Box2d required includes
		,   b2Vec2 = Box2D.Common.Math.b2Vec2
		,	b2World = Box2D.Dynamics.b2World
		,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
		,	b2Body = Box2D.Dynamics.b2Body
			//objects for the game
		,	points = 0
		,	fruitsDropped = 0
		,	world
		,	screenWidth = 600
		,	screenHeight = 400
		;

	if (debug)
	{
		director = new lime.Director(document.getElementById("canvas"),screenWidth,screenHeight);
		director.replaceScene(gameplayScene);
		lime.scheduleManager.schedule(function (dt){PrintDebug()}, null);
		StartGame();
	}
	else
	{
		director = new lime.Director(document.body,screenWidth,screenHeight);
		SetupTitleScreen(titleScene);
		director.replaceScene(titleScene);
	}
	
	function SetupTitleScreen()
	{
		titleScene = new lime.Scene();
		buttonLayer = new lime.Layer();
		titleScene.appendChild(buttonLayer);
		buttonLayer.setPosition(screenWidth/2, screenHeight/2);
		var button = new lime.RoundedRect().setSize(200,50).setRadius(10).setFill('#c00');
		var lbl = new lime.Label().setSize(160,50).setFontSize(30).setText('Start Game');
		buttonLayer.appendChild(button);
		buttonLayer.appendChild(lbl);
		
		//Listener for clicks
		goog.events.listen(buttonLayer,['mousedown'],function(e){
			StartGame();
			
			//buttonLayer.runAction(new lime.animation.FadeTo(.5).setDuration(.2));
			
			//e.swallow(['mouseup'],function()
			//{
				//buttonLayer.runAction(new lime.animation.FadeTo(1).setDuration(.2));
			//});
            
		});
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
		 
	//This function is only used for Box2d debugging	 
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
		gameplayScene = new lime.Scene();
		fruitLayer = new lime.Layer();
		backgroundLayer = new lime.Layer();
		backgroundLayer.appendChild(new lime.Sprite().setFill('#afa').setSize(screenWidth*2,screenHeight*2));
		gameplayScene.appendChild(backgroundLayer);
		gameplayScene.appendChild(fruitLayer);
		director.replaceScene(gameplayScene);
		//initialize the world
	world = new b2World
	(
		new b2Vec2(0, 2),    //gravity
		true                 //allow sleep
	);
		createBoundries(world);
		
		var rightHand = createHand(world, 11, 12, "right"),
			leftHand = createHand(world, 7, 12, "left");
		fruitLayer.appendChild(rightHand.GetUserData().texture);
		fruitLayer.appendChild(leftHand.GetUserData().texture);

		SetupKeyboardListener(gameplayScene, rightHand, leftHand);
		SetupCollisionListener(world);
		SetupMouseListener(debug, world, gameplayScene);
		if (debug)
			{setupDebugWindow();}
		
		//generate the first fruit immediately
		GenerateFruit(world, fruitLayer);
		//Schedule a fruit to fall every 10 seconds
		lime.scheduleManager.scheduleWithDelay(function (dt){GenerateFruit(world, fruitLayer)}, null, 5000, 0)
		//Tell Box2d to update every frame
		if (!debug)
		{
			lime.scheduleManager.schedule(function(dt) {
				world.Step(dt / 1000, 8, 3);
				world.ClearForces();
			
				//Remove objects
				for (i=0;i<fruitToRemove.length;i++)
					{
						fruitsDropped++;
						var fruit = fruitToRemove.pop();
						fruitLayer.removeChild(fruit.GetUserData().texture);
						world.DestroyBody(fruit);
					}
					
				//Draw limeJS objects
				for (var b = world.GetBodyList(); b.GetNext()!=null; b = b.GetNext())
				{
					var position = b.GetPosition();
					b.GetUserData().texture.setRotation(-b.GetAngle()/Math.PI*180);
					b.GetUserData().texture.setPosition(position.x*30, position.y*30);
				}
			},this);
		}
	}

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
