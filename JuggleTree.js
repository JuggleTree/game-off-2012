//set main namespace
goog.provide('JuggleTree');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.RoundedRect');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.audio.Audio');
goog.require('lime.animation.FadeTo');
goog.require('lime.transitions.Dissolve');
goog.require('lime.transitions.SlideInRight');
goog.require('lime.transitions.SlideInLeft');
goog.require('goog.events.KeyCodes');
goog.require('lime.SpriteSheet');
goog.require('lime.parser.JSON');
goog.require('lime.ASSETS.JuggleTextures.json');
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
		,	isPaused
		,	transitionSpeed = 0.5
			//assets
		,	spriteSheet
		,	bgm
		,	throwSFX
		,	basketSFX
		,	catchSFX
		,	mergeSFX
		,	fallSFX
		;

	//if (debug)
	//{
	//	SetupDebug(screenWidth, screenHeight); // uncomment this if you need to debug
	//}
	//else
	//{
		director = new lime.Director(document.body,screenWidth,screenHeight);
		LoadAssets();
		SetupSoundFX(throwSFX, basketSFX, catchSFX, mergeSFX, fallSFX);
		SetupAnimation();
		SetupTitleScreen();
		SetupPauseScene();		
	//}
	
	function LoadAssets()
	{
		bgm = new lime.audio.Audio('assets/JugglingMusic.ogg');
		spriteSheet = new lime.SpriteSheet('JuggleTextures.png',lime.ASSETS.JuggleTextures.json,lime.parser.JSON);
		throwSFX = new lime.audio.Audio('assets/fruitthrow.ogg');
		basketSFX = new lime.audio.Audio('assets/fruitbasket.ogg');
		catchSFX = new lime.audio.Audio('assets/fruitcatch.ogg');
		mergeSFX = new lime.audio.Audio('assets/fruitmerge.ogg');
		fallSFX = new lime.audio.Audio('assets/fruitfall.ogg');
		setSpriteSheet(spriteSheet);
	}
	
	function SetupTitleScreen()
	{
		titleScene = new lime.Scene();
		buttonLayer = new lime.Layer();
		backgroundLayer = new lime.Layer();
		
		//set the background
		backgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('Background.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		backgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('ForegroundTree.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		titleScene.appendChild(backgroundLayer);
		
		//set the button layer
		buttonLayer.setPosition(screenWidth/2, screenHeight/2);
		var startButton = new lime.Sprite().setSize(127,46).setPosition(0,25).setFill(spriteSheet.getFrame('Start1.png'));
		var highScoresButton = new lime.Sprite().setSize(196,50).setPosition(0,75).setFill(spriteSheet.getFrame('HighScore1.png'));
		var howToPlayButton = new lime.Sprite().setSize(240.5,59.5).setPosition(0,130).setFill(spriteSheet.getFrame('HTP1.png'));
		var title = new lime.Sprite().setSize(270,167).setPosition(0,-100).setFill(spriteSheet.getFrame('Title.png'));
		buttonLayer.appendChild(title);
		buttonLayer.appendChild(startButton);
		buttonLayer.appendChild(highScoresButton);
		buttonLayer.appendChild(howToPlayButton);
		titleScene.appendChild(buttonLayer);
		
		//Button listeners
		goog.events.listen(startButton, ['mouseover'], function(e)
		{
			startButton.setFill(spriteSheet.getFrame('Start2.png'));
		});
		
		goog.events.listen(titleScene, ['mouseout'], function(e)
		{
			startButton.setFill(spriteSheet.getFrame('Start1.png'));
		});
		
		goog.events.listen(startButton,['mousedown'],function(e){
			StartGame();
		});
		
		goog.events.listen(highScoresButton, ['mouseover'], function(e)
		{
			highScoresButton.setFill(spriteSheet.getFrame('HighScore2.png'));
		});
		
		goog.events.listen(titleScene, ['mouseout'], function(e)
		{
			highScoresButton.setFill(spriteSheet.getFrame('HighScore1.png'));
		});
		
		goog.events.listen(highScoresButton,['mousedown'],function(e){
			director.replaceScene(highScoreScene, lime.transitions.Dissolve,transitionSpeed);;
		});
		
		goog.events.listen(howToPlayButton, ['mouseover'], function(e)
		{
			howToPlayButton.setFill(spriteSheet.getFrame('HTP2.png'));
		});
		
		goog.events.listen(titleScene, ['mouseout'], function(e)
		{
			howToPlayButton.setFill(spriteSheet.getFrame('HTP1.png'));
		});
		
		goog.events.listen(howToPlayButton,['mousedown'],function(e){
			//director.replaceScene(howToPlayScene, lime.transitions.SlideInLeft);;
		});
		
		director.replaceScene(titleScene, lime.transitions.Dissolve,transitionSpeed);
		
		SetupHighScoreScene();
	}
	
	function SetupHighScoreScene()
	{
		//I shouldn't have to create another background layer but using the one above doesn't work
		backgroundLayer = new lime.Layer();
		backgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('Background.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		backgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('ForegroundTree.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
	
		highScoreScene = new lime.Scene();
		var highScoreLayer = new lime.Layer().setPosition(screenWidth/2, 0);
		var title = new lime.Sprite().setSize(196,50).setPosition(0,100).setFill(spriteSheet.getFrame('HighScore1.png'));
		var returnButton = new lime.Sprite().setSize(87,38).setPosition(0,340).setFill(spriteSheet.getFrame('Back1.png'));
		var scoreSheet = new lime.RoundedRect().setSize(100,200).setPosition(0,220).setFill('#FFF').setOpacity(0.5);
		
		highScoreScene.appendChild(backgroundLayer);
		highScoreScene.appendChild(highScoreLayer);
		highScoreLayer.appendChild(title);
		highScoreLayer.appendChild(returnButton);
		highScoreLayer.appendChild(scoreSheet);
		
		highScores = getCookie();
		if (highScores == null || highScores == "")
		{
			var defaultScores = ["0","0","0","0","0","0","0","0","0","0"];
			highScores = defaultScores;
			setCookie(defaultScores);
		}
		
		for (var i=0; i < 10; i++)
		{
			var score = new lime.Label().setText((i+1) + ": " + highScores[i] + " pts").setPosition(0,i*20+130).setFontSize(15);
			highScoreLayer.appendChild(score);
		}
		
		goog.events.listen(returnButton,['mousedown'],function(e){
			director.replaceScene(titleScene, lime.transitions.Dissolve,transitionSpeed);
		});
		
				goog.events.listen(returnButton, ['mouseover'], function(e)
		{
			returnButton.setFill(spriteSheet.getFrame('Back2.png'));
		});
		
		goog.events.listen(highScoreScene, ['mouseout'], function(e)
		{
			returnButton.setFill(spriteSheet.getFrame('Back1.png'));
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
		for (var i=0;i<ARRcookies.length;i++)
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
		var layer = new lime.Layer().setPosition(screenWidth/2, screenHeight/2);
		
		var pauseText = new lime.Sprite().setSize(192,74).setPosition(0,-75).setFill(spriteSheet.getFrame('Pause.png'));
		var continueButton = new lime.Sprite().setSize(147,37).setPosition(0,0).setFill(spriteSheet.getFrame('Continue1.png'));
		var quitButton = new lime.Sprite().setSize(73.5,39.5).setPosition(0,50).setFill(spriteSheet.getFrame('Quit1.png'));
		var pauseButton = new lime.Sprite().setSize(25, 25).setFill(spriteSheet.getFrame('pauseButton.png')).setAnchorPoint(0,0).setPosition(5,5);
		
		pauseScene.appendChild(layer);
		pauseScene.appendChild(pauseButton);
		
		layer.appendChild(pauseText);
		layer.appendChild(continueButton);
		layer.appendChild(quitButton);
		
		//button listeners
		goog.events.listen(continueButton, ['mouseover'], function(e)
		{
			continueButton.setFill(spriteSheet.getFrame('Continue2.png'));
			lime.updateDirtyObjects();
		});
		
		goog.events.listen(pauseScene, ['mouseout'], function(e)
		{
			continueButton.setFill(spriteSheet.getFrame('Continue1.png'));
			lime.updateDirtyObjects();
		});
		
		goog.events.listen(continueButton,['mousedown'],function(e){
			UnpauseGame();
		});
		
		goog.events.listen(quitButton, ['mouseover'], function(e)
		{
			quitButton.setFill(spriteSheet.getFrame('Quit2.png'));
			lime.updateDirtyObjects();
		});
		
		goog.events.listen(pauseScene, ['mouseout'], function(e)
		{
			quitButton.setFill(spriteSheet.getFrame('Quit1.png'));
			lime.updateDirtyObjects();
		});
		
		goog.events.listen(quitButton,['mousedown'],function(e){
			UnpauseGame();
			GameOver();
		});	

		
		//listeners to unpause the screen
		goog.events.listen(pauseScene, ['keydown'], function(e){
			if (e.event.keyCode == goog.events.KeyCodes.ENTER
				|| e.event.keyCode == goog.events.KeyCodes.P
				|| e.event.keyCode == goog.events.KeyCodes.L)
			{
				UnpauseGame();				
			}
		});
		goog.events.listen(pauseButton, ['mousedown'], function(e){
			UnpauseGame();
		});
	}
	
	function StartGame()
	{	
		//initialize objects
		gameplayScene = new lime.Scene().setRenderer(lime.Renderer.CANVAS);
		fruitLayer = new lime.Layer();
		jugglerLayer = new lime.Layer();
		hudLayer = new lime.Layer();
		frontBasketLayer = new lime.Layer();
		
		//Create the Heads Up Display
		scoreLbl = new lime.Label().setFontSize(15).setFontColor('#000').setAnchorPoint(0,0).setPosition(30,10).setText(' points');
		//droppedLbl = new lime.Label().setFontSize(15).setFontColor('#000').setAnchorPoint(0,0).setPosition(30,30).setText('Dropped: ');
		pauseButton = new lime.Sprite().setSize(25, 25).setFill(spriteSheet.getFrame('pauseButton.png')).setAnchorPoint(0,0).setPosition(5,5);
		hudbg = new lime.RoundedRect().setSize(120,25).setAnchorPoint(0,0).setPosition(1,5).setFill('#FFF').setOpacity(0.3);
		hudLayer.appendChild(hudbg);
		hudLayer.appendChild(pauseButton);
		hudLayer.appendChild(scoreLbl);
		//hudLayer.appendChild(droppedLbl);
		
		//add the layers to the scene
		gameplayScene.appendChild(backgroundLayer, 1);		
		gameplayScene.appendChild(jugglerLayer, 2);
		gameplayScene.appendChild(fruitLayer, 3);
		gameplayScene.appendChild(frontBasketLayer, 4);
		gameplayScene.appendChild(hudLayer, 5);

		
		//initialize the world
		world = new b2World
		(
			new b2Vec2(0, 2.5),    //gravity
			true                 //allow sleep
		);
		createBoundries(world);
		
		//Create the juggler
		var rightHand = createHand(world, 11, 11.5, "right", spriteSheet)
			, leftHand = createHand(world, 7, 11.5, "left", spriteSheet)
			, juggler = createJuggler(world, 9,11.5)
			, rightBasket = createBasket(world, 20, 13, "rightBasket") 
			, leftBasket = createBasket(world, 3, 13, "leftBasket")
			;

		jugglerLayer.appendChild(juggler.GetUserData().texture);
		jugglerLayer.appendChild(rightHand.GetUserData().texture);
		jugglerLayer.appendChild(leftHand.GetUserData().texture);
		jugglerLayer.appendChild(rightBasket.GetUserData().texture);
		jugglerLayer.appendChild(leftBasket.GetUserData().texture);

		frontBasketLeft = new lime.Sprite().setSize(90, 55.8).setAnchorPoint(0,0).setFill(spriteSheet.getFrame('BasketFront.png')).setPosition(0,390-55.8);
		frontBasketRight = new lime.Sprite().setSize(90, 55.8).setAnchorPoint(0,0).setFill(spriteSheet.getFrame('BasketFront.png')).setPosition(600-90,390-55.8);
		
		frontBasketLayer.appendChild(frontBasketLeft);
		frontBasketLayer.appendChild(frontBasketRight);
		
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
				PauseGame();
			}
		});
		goog.events.listen(pauseButton, ['mousedown'], function(e){
				PauseGame();
		});
		
		//SetupPopups
		SetupPopupManager(hudLayer);
		
		//Create and schedule the timer
		timeRemaining = 150; //seconds
		var timeLabel = new lime.Label().setFontSize(15).setFontColor('#000').setAnchorPoint(0,0).setPosition(screenWidth - 40,10).setText(Math.floor((timeRemaining / 60)) + ':' + (timeRemaining%60));
		clockbg = new lime.RoundedRect().setSize(33,18).setAnchorPoint(0,0).setPosition(screenWidth - 42,10).setFill('#FFF').setOpacity(0.3);
		hudLayer.appendChild(clockbg);
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
		
			//Check for movement boundries
			if (leftHand.GetPosition().x < 3.7 || rightHand.GetPosition().x > 16.2)
			{
				rightHand.SetLinearVelocity(new b2Vec2(0, 0));
				leftHand.SetLinearVelocity(new b2Vec2(0, 0));
				juggler.SetLinearVelocity(new b2Vec2(0, 0));			
			}
		
			//Remove old fruits
			for (var i=0;i<fruitToRemove.length;i)
			{
				var fruit = fruitToRemove.pop();
				fruitLayer.removeChild(fruit.GetUserData().texture);
				world.DestroyBody(fruit);
			}
			
			//Add new fruits
			for (var i=0;i<fruitToAdd.length;i++)
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
			scoreLbl.setText(points + ' points');
			//droppedLbl.setText('Dropped: ' + fruitsDropped);
			
			//Check for game over
			if (fruitsDropped >= 5)
				GameOver();
		},director);
		
		director.replaceScene(gameplayScene, lime.transitions.Dissolve,transitionSpeed);
		
		bgm.baseElement.currentTime = 0;
		bgm.baseElement.play();
	}
	
	function GameOver()
	{
		bgm.baseElement.pause();
		
		//Remove the scheduled tasks
		lime.scheduleManager.unschedule(updateFunction,director);
		lime.scheduleManager.unschedule(generateFruitFunction,director);
		lime.scheduleManager.unschedule(setTimeRemaining,director);
		
		//Set up the game over screen
		gameOverScene = new lime.Scene().setRenderer(lime.Renderer.CANVAS);
		gameOverScene.appendChild(backgroundLayer);
		
		var gameoverText = new lime.Sprite().setSize(316,175).setPosition(screenWidth/2,screenHeight/2 - 75).setFill(spriteSheet.getFrame('GameOver.png'));
		var scoreLbl = new lime.Label().setFontSize(30).setPosition(screenWidth/2,screenHeight/2 + 25).setText('Your Score: ' + points);
		var restartButton = new lime.Sprite().setSize(147,37).setPosition(screenWidth/2,screenHeight/2 + 80).setFill(spriteSheet.getFrame('Continue1.png'));
		
		
		gameOverScene.appendChild(gameoverText);
		gameOverScene.appendChild(scoreLbl);
		gameOverScene.appendChild(restartButton);

		goog.events.listen(restartButton, ['mouseover'], function(e)
		{
			restartButton.setFill(spriteSheet.getFrame('Continue2.png'));
			lime.updateDirtyObjects();
		});
		
		goog.events.listen(gameOverScene, ['mouseout'], function(e)
		{
			restartButton.setFill(spriteSheet.getFrame('Continue1.png'));
			lime.updateDirtyObjects();
		});		

		goog.events.listen(restartButton,['mousedown'],function(e){
			//Restart the game
			fruitsDropped = 0;
			points = 0;
			fallingFruit = new Array();
			growingFruit = new Array();
			heldFruit = new Array();
			SetupTitleScreen();
		});
		
		director.replaceScene(gameOverScene, lime.transitions.Dissolve,transitionSpeed);
		
		//Add the new highscore
		highScores.push(points)
		highScores.sort(function(a,b){return b-a});
		if (highScores.length > 10)
			highScores.pop();
		setCookie(highScores);
	}

		window.addEventListener("blur", function(event) { 
			if (!isPaused && director.getCurrentScene() == gameplayScene)
			{
				PauseGame();
			}
		}, true);
		
	function PauseGame()
	{
		director.setPaused(true);
		director.pushScene(pauseScene);
		bgm.baseElement.pause();
		lime.updateDirtyObjects();
		isPaused = true;
	}
	
	function UnpauseGame()
	{
		bgm.baseElement.play();
		director.popScene();
		director.setPaused(false);
		isPaused = false;
	}
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('JuggleTree.start', JuggleTree.start);
