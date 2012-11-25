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
goog.require('JuggleTree.Popups');
goog.require('JuggleTree.PauseScene');

// entrypoint
JuggleTree.start = function(debug){
			
			//Lime2D variables
	var 	director
		,	gameplayScene
		,	titleScene
		,	gameOverScene
		,	fruitLayer
		,	jugglerLayer
		,	buttonLayer
		,	backgroundLayer
		,	hudLayer
			//Schedule Manager Functions
		,	updateFunction
		,	generateFruitFunction
			//Box2d required includes
		,   b2Vec2 = Box2D.Common.Math.b2Vec2
		,	b2World = Box2D.Dynamics.b2World
		,	b2Body = Box2D.Dynamics.b2Body
			//objects for the game
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
	}
	
	function SetupTitleScreen()
	{
		titleScene = new lime.Scene();
		buttonLayer = new lime.Layer();
		backgroundLayer = new lime.Layer();
		titleScene.appendChild(backgroundLayer);
		titleScene.appendChild(buttonLayer);
		
		//set the background
		backgroundLayer.appendChild(new lime.Sprite().setFill('assets/Background.png').setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		backgroundLayer.appendChild(new lime.Sprite().setFill('assets/ForegroundTree.png').setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		
		//set the button layer
		buttonLayer.setPosition(screenWidth/2, screenHeight/2);
		var startButton = new lime.Sprite().setSize(127,46).setPosition(0,25).setFill('assets/Start1.png');
		var title = new lime.Sprite().setSize(270,167).setPosition(0,-100).setFill('assets/Title.png');
		buttonLayer.appendChild(title);
		buttonLayer.appendChild(startButton);
		
		//Button listeners
		goog.events.listen(startButton, ['mouseover'], function(e)
		{
			startButton.setFill('assets/Start2.png');
		});
		
		goog.events.listen(titleScene, ['mouseout'], function(e)
		{
			startButton.setFill('assets/Start1.png');
		});
		
		goog.events.listen(startButton,['mousedown'],function(e){
			StartGame();
		});
		
		director.replaceScene(titleScene);
	}
		
	function StartGame()
	{
		//initialize objects
		gameplayScene = new lime.Scene();
		fruitLayer = new lime.Layer();
		jugglerLayer = new lime.Layer();
		hudLayer = new lime.Layer();
		
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
		
		//initialize the world
		world = new b2World
		(
			new b2Vec2(0, 1),    //gravity
			true                 //allow sleep
		);
		createBoundries(world);
		
		//Create the juggler
		var rightHand = createHand(world, 11, 11.5, "right")
			, leftHand = createHand(world, 7, 11.5, "left")
			, juggler = createJuggler(world, 9,11.5)
			, rightBasket = createBasket(world, 19, 12.5, "rightBasket") 
			, leftBasket = createBasket(world, 1, 12.5, "leftBasket")
			;

		jugglerLayer.appendChild(juggler.GetUserData().texture);
		jugglerLayer.appendChild(rightHand.GetUserData().texture);
		jugglerLayer.appendChild(leftHand.GetUserData().texture);
    jugglerLayer.appendChild(rightBasket.GetUserData().texture);
    jugglerLayer.appendChild(leftBasket.GetUserData().texture);

		//Setup Listeners
		SetupKeyboardListener(gameplayScene, rightHand, leftHand, juggler, director);
		SetupCollisionListener(world);
		SetupMouseListener(world, gameplayScene);
		
		//SetupPopups
		SetupPopupManager(hudLayer);
		
		//Schedule a fruit to fall every 10 seconds
		lime.scheduleManager.scheduleWithDelay(generateFruitFunction = function (dt){
				GenerateFruit(world);
		}, director, 2000, 0);
		
		//This is the Update Loop
		lime.scheduleManager.schedule(updateFunction = function(dt) 
		{
			//Update box2d
			world.Step(dt / 1000, 8, 3);
			world.ClearForces();
		
			//Remove old fruits
			for (i=0;i<fruitToRemove.length;i)
			{
				var fruit = fruitToRemove.pop();
				fruitLayer.removeChild(fruit.GetUserData().texture);
				world.DestroyBody(fruit);
			}
			
			//Add new fruits
			for (i=0;i<fruitToAdd.length;i++)
			{
				var fruit = fruitToAdd.pop();
				fruitLayer.appendChild(fruit.GetUserData().texture);
			}
			
			//See if fruits should fall from the tree
			DropFruit();
			
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
			
			//Check for game over
			if (fruitsDropped >= 5)
				GameOver();
		},director);
		
		director.replaceScene(gameplayScene);
	}
	
	function GameOver()
	{
		//Remove the scheduled tasks
		lime.scheduleManager.unschedule(updateFunction,director);
		lime.scheduleManager.unschedule(generateFruitFunction,director);
		
		//Set up the game over screen
		gameOverScene = new lime.Scene();
		gameOverScene.appendChild(backgroundLayer);
		
		var gameoverLbl = new lime.Label().setFontSize(30).setPosition(screenWidth/2,screenHeight/2 - 25).setText('Game Over');
		var scoreLbl = new lime.Label().setFontSize(30).setPosition(screenWidth/2,screenHeight/2 + 25).setText('Your Score: ' + points);
		var startButton = new lime.Sprite().setSize(127,46).setPosition(screenWidth/2,screenHeight/2 + 75).setFill('assets/Start1.png');
		
		
		gameOverScene.appendChild(gameoverLbl);
		gameOverScene.appendChild(scoreLbl);
		gameOverScene.appendChild(startButton);
		
		goog.events.listen(startButton,['mousedown'],function(e){
			//Restart the game
			fruitsDropped = 0;
			points = 0;
			SetupTitleScreen();
		});
		
		director.replaceScene(gameOverScene);
	}
	
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('JuggleTree.start', JuggleTree.start);
