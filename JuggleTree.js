//set main namespace
goog.provide('JuggleTree');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.RoundedRect');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.FadeTo');
goog.require('goog.events.KeyCodes');
goog.require('JuggleTree.BoxBuilder');
goog.require('JuggleTree.Listeners');
goog.require('JuggleTree.Debug');

// entrypoint
JuggleTree.start = function(debug){
			
			//Lime2D variables
	var 	director
		,	gameplayScene
		,	titleScene
		,	fruitLayer
		,	jugglerLayer
		,	buttonLayer
		,	backgroundLayer
		,	hudLayer
			//Box2d required includes
		,   b2Vec2 = Box2D.Common.Math.b2Vec2
		,	b2World = Box2D.Dynamics.b2World

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
		SetupDebug(screenWidth, screenHeight);
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
		var startButton = new lime.RoundedRect().setSize(200,50).setRadius(10).setFill('#c00');
		var startLbl = new lime.Label().setSize(160,50).setFontSize(30).setPosition(0,7).setText('Start Game');
		var titleLbl = new lime.Label().setSize(250,50).setFontSize(40).setFontColor('#3C3').setPosition(0,-100).setText('Juggle Tree');
		buttonLayer.appendChild(titleLbl);
		buttonLayer.appendChild(startButton);
		buttonLayer.appendChild(startLbl);
		
		//Listener for clicks
		goog.events.listen(startButton,['mousedown'],function(e){
			StartGame();
            
		});
	}
		
	function StartGame()
	{
		//initialize objects
		gameplayScene = new lime.Scene();
		fruitLayer = new lime.Layer();
		backgroundLayer = new lime.Layer();
		jugglerLayer = new lime.Layer();
		hudLayer = new lime.Layer();
		
		//set the background
		backgroundLayer.appendChild(new lime.Sprite().setFill('#afa').setSize(screenWidth*2,screenHeight*2));
		
		//Create the Heads Up Display
		scoreLbl = new lime.Label().setFontSize(15).setFontColor('#000').setAnchorPoint(0,0).setPosition(30,10).setText('Score: ');
		droppedLbl = new lime.Label().setFontSize(15).setFontColor('#000').setAnchorPoint(0,0).setPosition(30,30).setText('Dropped: ');
		hudLayer.appendChild(scoreLbl);
		hudLayer.appendChild(droppedLbl);
		
		//add the layers to the scene
		gameplayScene.appendChild(backgroundLayer);
		gameplayScene.appendChild(jugglerLayer);
		gameplayScene.appendChild(fruitLayer);
		gameplayScene.appendChild(hudLayer);
		director.replaceScene(gameplayScene);
		
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
			
		jugglerLayer.appendChild(juggler.GetUserData().texture);
		jugglerLayer.appendChild(rightHand.GetUserData().texture);
		jugglerLayer.appendChild(leftHand.GetUserData().texture);

		//Setup Listeners
		SetupKeyboardListener(gameplayScene, rightHand, leftHand, juggler);
		SetupCollisionListener(world);
		SetupMouseListener(world, gameplayScene);
		
		//generate the first fruit immediately
		GenerateFruit(world, fruitLayer);
		
		//Schedule a fruit to fall every 10 seconds
		lime.scheduleManager.scheduleWithDelay(function (dt){GenerateFruit(world, fruitLayer)}, null, 2000, 0)
		
		//Tell Box2d to update every frame
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
			
			//Update the HUD
			scoreLbl.setText('Score: ' + points);
			droppedLbl.setText('Dropped: ' + fruitsDropped);
			
		},this);
	}


}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('JuggleTree.start', JuggleTree.start);
