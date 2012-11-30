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
		,	howToPlayScene1
		,	howToPlayScene2
		,	howToPlayScene3
		,	pauseScene
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
		SetupHowToPlayScenes();
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
		var buttonLayer = new lime.Layer();
		titleBackgroundLayer = new lime.Layer();
		
		//set the background
		titleBackgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('Background.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		titleBackgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('ForegroundTree.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		titleScene.appendChild(titleBackgroundLayer);
		
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
		SetupMouseOver(startButton, 'Start', titleScene);
		SetupMouseOver(highScoresButton, 'HighScore', titleScene);
		SetupMouseOver(howToPlayButton, 'HTP', titleScene);
		
		goog.events.listen(startButton,['mousedown'],function(e){
			StartGame();
		});
		
		goog.events.listen(highScoresButton,['mousedown'],function(e){
			director.replaceScene(highScoreScene, lime.transitions.Dissolve,transitionSpeed);;
		});
		
		goog.events.listen(howToPlayButton,['mousedown'],function(e){
			director.replaceScene(howToPlayScene1, lime.transitions.SlideInRight,transitionSpeed);
		});
		
		director.replaceScene(titleScene, lime.transitions.Dissolve,transitionSpeed);
		
		SetupHighScoreScene();
	}
	
	function SetupHighScoreScene()
	{
		//I shouldn't have to create another background layer but using the one above doesn't work
		scoreBackgroundLayer = new lime.Layer();
		scoreBackgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('Background.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		scoreBackgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('ForegroundTree.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
	
		highScoreScene = new lime.Scene();
		var highScoreLayer = new lime.Layer().setPosition(screenWidth/2, 0);
		var title = new lime.Sprite().setSize(196,50).setPosition(0,100).setFill(spriteSheet.getFrame('HighScore1.png'));
		var returnButton = new lime.Sprite().setSize(87,38).setPosition(0,340).setFill(spriteSheet.getFrame('Back1.png'));
		var scoreSheet = new lime.RoundedRect().setSize(100,200).setPosition(0,220).setFill('#FFF').setOpacity(0.5);
		
		highScoreScene.appendChild(scoreBackgroundLayer);
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
		
		SetupMouseOver(returnButton, 'Back', highScoreScene);
		
		goog.events.listen(returnButton,['mousedown'],function(e){
			director.replaceScene(titleScene, lime.transitions.Dissolve,transitionSpeed);
		});
	}

	function SetupMouseOver(button, buttonName, scene)
	{
		goog.events.listen(button, ['mouseover'], function(e)
		{
			button.setFill(spriteSheet.getFrame(buttonName + '2.png'));
		});
		
		goog.events.listen(scene, ['mouseout'], function(e)
		{
			button.setFill(spriteSheet.getFrame(buttonName + '1.png'));
		});	
	}
	
	function SetupHowToPlayScenes()
	{
		howToPlayScene1 = new lime.Scene();
		howToPlayScene2 = new lime.Scene();
		howToPlayScene3 = new lime.Scene();
		
		var htp1 = new lime.Sprite().setFill(spriteSheet.getFrame('HowToPlay1.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0);
		var htp2 = new lime.Sprite().setFill(spriteSheet.getFrame('HowToPlay2.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0);
		var htp3 = new lime.Sprite().setFill(spriteSheet.getFrame('HowToPlay3.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0);
		var leftArrow = new lime.Sprite().setFill(spriteSheet.getFrame('LeftArrow1.png')).setSize(29,56).setAnchorPoint(0,0).setPosition(0,screenHeight/2-25);
		var rightArrow = new lime.Sprite().setFill(spriteSheet.getFrame('RightArrow1.png')).setSize(29,56).setAnchorPoint(0,0).setPosition(screenWidth-50,screenHeight/2-25);

		howToPlayScene1.appendChild(htp1);
		howToPlayScene1.appendChild(leftArrow);
		howToPlayScene1.appendChild(rightArrow);
		
		howToPlayScene2.appendChild(htp2);
		howToPlayScene3.appendChild(htp3);
		
		var howToPlay = new Array(howToPlayScene1, howToPlayScene2, howToPlayScene3);
		var currentIndex = 0;

		
		goog.events.listen(leftArrow,['mousedown'],function(e){
			var newIndex = currentIndex-1;
			if (newIndex >= 0)
			{
				director.replaceScene(howToPlay[newIndex], lime.transitions.SlideInLeft, transitionSpeed);
				howToPlay[newIndex].appendChild(leftArrow);
				howToPlay[newIndex].appendChild(rightArrow);
				currentIndex = newIndex;
			}
			else
			{
				director.replaceScene(titleScene, lime.transitions.SlideInLeft, transitionSpeed);
				howToPlayScene1.appendChild(leftArrow);
				howToPlayScene1.appendChild(rightArrow);
				currentIndex = 0;
			}
		});
		
		goog.events.listen(rightArrow,['mousedown'],function(e){
			var newIndex = currentIndex+1;
			if (newIndex < 3)
			{
				director.replaceScene(howToPlay[newIndex], lime.transitions.SlideInRight, transitionSpeed);
				howToPlay[newIndex].appendChild(leftArrow);
				howToPlay[newIndex].appendChild(rightArrow);
				currentIndex = newIndex;
			}
			else
			{
				director.replaceScene(titleScene, lime.transitions.SlideInRight, transitionSpeed);
				howToPlayScene1.appendChild(leftArrow);
				howToPlayScene1.appendChild(rightArrow);
				currentIndex = 0;
			}
		});	
		
		SetupMouseOver(leftArrow, 'LeftArrow', howToPlayScene1);
		SetupMouseOver(rightArrow, 'RightArrow', howToPlayScene1);
		SetupMouseOver(leftArrow, 'LeftArrow', howToPlayScene2);
		SetupMouseOver(rightArrow, 'RightArrow', howToPlayScene2);
		SetupMouseOver(leftArrow, 'LeftArrow', howToPlayScene3);
		SetupMouseOver(rightArrow, 'RightArrow', howToPlayScene3);
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
				|| e.event.keyCode == goog.events.KeyCodes.L
				|| e.event.keyCode == goog.events.KeyCodes.ESC)
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
		var backgroundLayer = new lime.Layer();
		var fruitLayer = new lime.Layer();
		var jugglerLayer = new lime.Layer();
		var hudLayer = new lime.Layer();
		frontBasketLayer = new lime.Layer();
		
		//Create the Heads Up Display
		scoreLbl = new lime.Label().setFontSize(15).setFontColor('#000').setAnchorPoint(0,0).setPosition(30,10).setText(' points');
		pauseButton = new lime.Sprite().setSize(25, 25).setFill(spriteSheet.getFrame('pauseButton.png')).setAnchorPoint(0,0).setPosition(5,5);
		hudbg = new lime.RoundedRect().setSize(120,25).setAnchorPoint(0,0).setPosition(1,5).setFill('#FFF').setOpacity(0.3);
		hudLayer.appendChild(hudbg);
		hudLayer.appendChild(pauseButton);
		hudLayer.appendChild(scoreLbl);
		
		//set the background
		backgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('Background.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		backgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('ForegroundTree.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		
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
				|| e.event.keyCode == goog.events.KeyCodes.L
				|| e.event.keyCode == goog.events.KeyCodes.ESC)
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
		
		//Generate the first fruit
		GenerateFruit(world);
		
		//Schedule a fruit to grow every 2.5 seconds
		lime.scheduleManager.scheduleWithDelay(generateFruitFunction = function (dt){
				GenerateFruit(world);
		}, director, 1700, 0);
		
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
		gameOverScene = new lime.Scene().setRenderer(lime.Renderer.DOM);
		
		var gameOverBackgroundLayer = new lime.Layer();
		gameOverBackgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('Background.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		gameOverBackgroundLayer.appendChild(new lime.Sprite().setFill(spriteSheet.getFrame('ForegroundTree.png')).setSize(screenWidth,screenHeight).setAnchorPoint(0,0));
		gameOverScene.appendChild(gameOverBackgroundLayer);
		
		var gameoverText = new lime.Sprite().setSize(316,200).setPosition(screenWidth/2,screenHeight/2 - 100);
		var scoreLbl = new lime.Label().setFontSize(30).setPosition(screenWidth/2,screenHeight/2 + 25).setText('Your Score: ' + points);
		var restartButton = new lime.Sprite().setSize(147,37).setPosition(screenWidth/2,screenHeight/2 + 80).setFill(spriteSheet.getFrame('Continue1.png'));
		
		if (timeRemaining == 0)
			gameoverText.setFill(spriteSheet.getFrame('TimeUp.png'))
		else
			gameoverText.setFill(spriteSheet.getFrame('GameOver.png'))
		
		gameOverScene.appendChild(gameoverText);
		gameOverScene.appendChild(scoreLbl);
		gameOverScene.appendChild(restartButton);

		SetupMouseOver(restartButton, 'Continue', gameOverScene);

		goog.events.listen(restartButton,['mousedown'],function(e){
			//Restart the game
			fruitsDropped = 0;
			points = 0;
			fallingFruit = new Array();
			hangingFruit = new Array();
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
