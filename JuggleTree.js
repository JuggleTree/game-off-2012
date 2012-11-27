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
//goog.require('JuggleTree.Debug'); //uncomment this if you need to debug
goog.require('JuggleTree.Popups');

// entrypoint
//JuggleTree.start = function(debug){ //uncomment this if you need to debug
JuggleTree.start = function(){
			//Lime2D variables
	var 	director
		,	gameplayScene
		,	titleScene
		,	gameOverScene
		,	highScoreScene
		,	pauseScene
		,	fruitLayer
		,	jugglerLayer
		,	buttonLayer
		,	backgroundLayer
		,	hudLayer
			//Schedule Manager Functions
		,	updateFunction
		,	generateFruitFunction
		,	setTimeRemaining
			//Box2d required includes
		,   b2Vec2 = Box2D.Common.Math.b2Vec2
		,	b2World = Box2D.Dynamics.b2World
		,	b2Body = Box2D.Dynamics.b2Body
			//objects for the game
		,	world
		,	highScores
		,	screenWidth = 600
		,	screenHeight = 400
		,	timeRemaining
		;

	//if (debug)
	//{
		//SetupDebug(screenWidth, screenHeight); // uncomment this if you need to debug
	//}
	//else
	//{
		director = new lime.Director(document.body,screenWidth,screenHeight);
		SetupTitleScreen();
		SetupPauseScene();
	//}
	
	function SetupTitleScreen()
	{
		titleScene = new lime.Scene();
		buttonLayer = new lime.Layer();
		backgroundLayer = new lime.Layer();
		
		//set the background
		backgroundLayer.appendChild(new lime.Sprite().setFill('assets/Background.png').setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		backgroundLayer.appendChild(new lime.Sprite().setFill('assets/ForegroundTree.png').setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		titleScene.appendChild(backgroundLayer);
		
		//set the button layer
		buttonLayer.setPosition(screenWidth/2, screenHeight/2);
		var startButton = new lime.Sprite().setSize(127,46).setPosition(0,25).setFill('assets/Start1.png');
		var highScoresButton = new lime.Label().setText("High Scores").setPosition(0,75).setFontSize(30);
		var title = new lime.Sprite().setSize(270,167).setPosition(0,-100).setFill('assets/Title.png');
		buttonLayer.appendChild(title);
		buttonLayer.appendChild(startButton);
		buttonLayer.appendChild(highScoresButton);
		titleScene.appendChild(buttonLayer);
		
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
		
		goog.events.listen(highScoresButton,['mousedown'],function(e){
			director.replaceScene(highScoreScene);;
		});
		
		director.replaceScene(titleScene);
		
		SetupHighScoreScene();
	}
	
	function SetupHighScoreScene()
	{
		//I shouldn't have to create another background layer but using the one above doesn't work
		backgroundLayer = new lime.Layer();
		backgroundLayer.appendChild(new lime.Sprite().setFill('assets/Background.png').setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		backgroundLayer.appendChild(new lime.Sprite().setFill('assets/ForegroundTree.png').setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
	
		highScoreScene = new lime.Scene();
		var highScoreLayer = new lime.Layer().setPosition(screenWidth/2, 0);
		var title = new lime.Label().setText("High Scores").setPosition(0,75).setFontSize(20);
		var returnButton = new lime.Label().setText("Back").setPosition(0,300).setFontSize(20);
		
		highScoreScene.appendChild(backgroundLayer);
		highScoreScene.appendChild(highScoreLayer);
		highScoreLayer.appendChild(title);
		highScoreLayer.appendChild(returnButton);
		
		highScores = getCookie();
		if (highScores == null || highScores == "")
		{
			var defaultScores = ["0","0","0","0","0","0","0","0","0","0"];
			highScores = defaultScores;
			setCookie(defaultScores);
		}
		
		for (var i=0; i < 10; i++)
		{
			var score = new lime.Label().setText((i+1) + ": " + highScores[i] + " pts").setPosition(0,i*20+100).setFontSize(15);
			highScoreLayer.appendChild(score);
		}
		
		goog.events.listen(returnButton,['mousedown'],function(e){
			director.replaceScene(titleScene);
		});
	}
	
	function setCookie(value)
	{
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + 356);
		var c_value=value.toString() + "; expires="+exdate.toUTCString();
		document.cookie="highscores" + "=" + c_value;
	}
	
	function getCookie()
	{
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++)
		{
			x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
			y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
			x=x.replace(/^\s+|\s+$/g,"");
			if (x=="highscores")
			{
				var value = y.split(",");
				return value;
			}
		}
	}

	function SetupPauseScene()
	{
		pauseScene = new lime.Scene();

		var label = new lime.Label().setText('Paused').setPosition(screenWidth/2, screenHeight/2);
		pauseButton = new lime.Sprite().setSize(25, 25).setFill('assets/pause.png').setAnchorPoint(0,0).setPosition(5,5);
		pauseScene.appendChild(pauseButton);
		pauseScene.appendChild(label);
		
		//listeners to unpause the screen
		goog.events.listen(pauseScene, ['keydown'], function(e){
			if (e.event.keyCode == goog.events.KeyCodes.ENTER
				|| e.event.keyCode == goog.events.KeyCodes.P
				|| e.event.keyCode == goog.events.KeyCodes.L)
			{
				director.popScene();
				director.setPaused(false);
				
			}
		});
		goog.events.listen(pauseButton, ['mousedown'], function(e){
				director.popScene();
				director.setPaused(false);
		});
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
		pauseButton = new lime.Sprite().setSize(25, 25).setFill('assets/pause.png').setAnchorPoint(0,0).setPosition(5,5);
		hudLayer.appendChild(pauseButton);
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
			new b2Vec2(0, 2),    //gravity
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
									
		//listener to pause the screen
		goog.events.listen(gameplayScene, ['keydown'], function(e){
			if (e.event.keyCode == goog.events.KeyCodes.ENTER
				|| e.event.keyCode == goog.events.KeyCodes.P
				|| e.event.keyCode == goog.events.KeyCodes.L)
			{
				director.setPaused(true);
				director.pushScene(pauseScene);
			}
		});
		goog.events.listen(pauseButton, ['mousedown'], function(e){
				director.setPaused(true);
				director.pushScene(pauseScene);
		});
		
		//SetupPopups
		SetupPopupManager(hudLayer);
		
		//Create and schedule the timer
		timeRemaining = 150; //seconds
		var timeLabel = new lime.Label().setFontSize(15).setFontColor('#000').setAnchorPoint(0,0).setPosition(screenWidth - 40,10).setText(Math.floor((timeRemaining / 60)) + ':' + (timeRemaining%60));
		hudLayer.appendChild(timeLabel);
		lime.scheduleManager.scheduleWithDelay(setTimeRemaining = function (dt){
				timeRemaining--;
				if (timeRemaining%60 < 10)
					timeLabel.setText(Math.floor((timeRemaining / 60)) + ':0' + (timeRemaining%60));
				else
					timeLabel.setText(Math.floor((timeRemaining / 60)) + ':' + (timeRemaining%60));
				if (timeRemaining == 0)
					GameOver();
				
		}, director, 1000, 0);		
		
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
		lime.scheduleManager.unschedule(setTimeRemaining,director);
		
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
			fallingFruit = new Array();
			growingFruit = new Array();
			heldFruit = new Array();
			SetupTitleScreen();
		});
		
		director.replaceScene(gameOverScene);
		
		//Add the new highscore
		highScores.push(points)
		highScores.sort(function(a,b){return b-a});
		if (highScores.length > 10)
			highScores.pop();
		setCookie(highScores);
	}
	
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('JuggleTree.start', JuggleTree.start);
