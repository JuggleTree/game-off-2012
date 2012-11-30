goog.provide('JuggleTree.FruitFunctions');

goog.require('JuggleTree.Popups');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Loop');
goog.require('lime.animation.Sequence');

var     b2Vec2 = Box2D.Common.Math.b2Vec2	
	,	fruitToRemove = new Array()
	,	fruitToAdd = new Array()
	,	leftHandJoint = "empty"
	,	rightHandJoint = "empty"
	,	heldFruit = new Array()
	,	hangingFruit = new Array()
	,	fallingFruit = new Array()
	,	points = 0
	,	shouldFall = true
	,	throwSFX
	,	basketSFX
	,	catchSFX
	,	mergeSFX
	,	fallSFX
	,	nextFruitAnimation
	;

function SetupAnimation()
{
	nextFruitAnimation = new lime.animation.Loop(
				new lime.animation.Sequence(
					new lime.animation.FadeTo(0.5).setDuration(0.35),
					new lime.animation.FadeTo(1).setDuration(0.35)
				));
				
	
}
	
function SetupSoundFX(t, b, c, m, f)
{
	throwSFX = t;
	basketSFX = b;
	catchSFX = c;
	mergeSFX = m;
	fallSFX = f;
}
	
function GenerateFruit(world)
{
	if (hangingFruit.length < 10)
	{
		//Get a random, even number between 4 and 16
		var x = (Math.floor((Math.random() * 7) + 2))*2;
		//Get a random number 1.5 or 2.5
		var y = (Math.floor((Math.random() * 2)+1))+0.5;
		if (y == 2.5)
			x++;
		var generate = true;
		//Check if a fruit already exists at that location
		for (var i = 0; i < hangingFruit.length; i++)
		{
			var newx = hangingFruit[i].GetPosition().x;
			if (hangingFruit[i].GetPosition().x == x &&
				hangingFruit[i].GetPosition().y == y)
				generate = false;
		}
		//Generate the fruit
		if (generate)
		{
			var size = getRandomInt(4, 9)/10 + 0.3;
			var type = Math.floor((Math.random()*11));
			var initialVelocity = new b2Vec2(0, 0);
			var body;
			switch(type)
			{
				case 0:
					body = createStrawberry(world,x,y,size*0.5,initialVelocity);
					break;
				case 1:
					body = createApple(world,x,y,size,initialVelocity,true);
					break;
				case 2:
					body = createBanana(world,x,y,size,initialVelocity);
					break;
				case 3:
					body = createCherry(world,x,y,size*0.3,initialVelocity);
					break;
				case 4:
					body = createGrape(world,x,y,size*0.8,initialVelocity);
					break;
				case 5:
					body = createLemon(world,x,y,size*.9,initialVelocity);
					break;
				case 6:
					body = createOrange(world,x,y,size*0.8,initialVelocity);
					break;
				case 7:
					body = createPear(world,x,y,size*0.7,initialVelocity);
					break;
				case 8:
					body = createPineapple(world,x,y,size*.8,initialVelocity);
					break;
				case 9:
					body = createPlum(world,x,y,size*.7,initialVelocity);
					break;
				case 10:
					body = createWatermelon(world,x,y,size*1.3,initialVelocity);
					break;
			}
			AddFruit(body);
			GrowFruit(body);
		}
	}
}

function GrowFruit(fruit)
{
	//Set up the animation
	fruit.GetUserData().texture.setScale(0.1);	
	var growingAnimation = new lime.animation.ScaleTo(1).setDuration(1.5);
	fruit.GetUserData().texture.runAction(growingAnimation);
	
	//When the animation is finished add it to the hanging fruit array
	goog.events.listen(growingAnimation,lime.animation.Event.STOP,function(){
		hangingFruit.push(fruit);
	})
}

function DropFruit()
{
	if (fallingFruit.length < 3 && hangingFruit.length > 0 && shouldFall)
	{
		var fruit = hangingFruit.shift();
		fruit.SetType(b2Body.b2_dynamicBody);
		fallingFruit.push(fruit);
		//fallSFX.stop();
		//fallSFX.play();
	}
}

function CheckForDrop(fruitA, fruitB)
{
	var indexA = hangingFruit.lastIndexOf(fruitA);
	var indexB = hangingFruit.lastIndexOf(fruitB);
	//See if the fruit is on the tree and if so remove it from the array and drop it
	if (indexA > -1)
	{
		hangingFruit.splice(indexA,1);
		fruitA.SetType(b2Body.b2_dynamicBody);
		fallingFruit.push(fruitA);
		//fallSFX.stop();
		//fallSFX.play();
	}
	else if (indexB > -1)
	{
		hangingFruit.splice(indexB,1);
		fruitB.SetType(b2Body.b2_dynamicBody);
		fallingFruit.push(fruitB);
		//fallSFX.play();
		//fallSFX.play();
	}
}

function RemoveFruit(fruit)
{
	var index = fallingFruit.lastIndexOf(fruit);
	if (index != -1)
		fallingFruit.splice(index,1);
	var index = hangingFruit.lastIndexOf(fruit);
	if (index != -1)
		{hangingFruit.splice(index,1);}
	fruitToRemove.push(fruit);
}

function AddFruit(fruit)
{
	fruitToAdd.push(fruit);
}

function CatchFruit(world, fruit, hand, handType)
{
	//make sure fruit is not currently attached to something
	if (!fruit.hasJoint)
	{
		fruit.hasJoint = true;
		jointDef = new b2WeldJointDef();
		jointDef.Initialize(fruit, hand, fruit.GetPosition(), hand.GetPosition());
		jointDef.collideConnected = true;
		var joint = world.CreateJoint(jointDef);
		fruit.GetUserData().joint = joint;
		heldFruit.push(fruit);
    
		//add highlight to the next fruit to throw
		HighlightNextThrow();
		
		CreatePopup(fruit.GetUserData().value, fruit.GetPosition().x*30-5, fruit.GetPosition().y*30);
		
		//add points to total score
		points += fruit.GetUserData().value;
		
		//increase point value by one
		fruit.GetUserData().value++;
		
		catchSFX.stop();
		catchSFX.play();
	}
}

function FruitCaughtInBasket(world, fruit, basket, basketType)
{
	points += (fruit.GetUserData().value * 2);
	CreatePopup(fruit.GetUserData().value * 2, fruit.GetPosition().x*30, fruit.GetPosition().y*30-5);
	RemoveFruit(fruit);
	basketSFX.stop();
	basketSFX.play();
}

function ThrowFruit(world)
{
	//fruits are currently attached
	if (heldFruit.length > 0)
	{
		throwSFX.stop();
		throwSFX.play();
	
		var currentFruit = heldFruit.shift();
		world.DestroyJoint(currentFruit.GetUserData().joint);
		
		
		Throw(world, currentFruit);

		currentFruit.hasJoint = false;
	}
}

function Throw(world, fruit)
{
	//calculate the initial vertical velocity required to reach the apex
	var height = mouseY - fruit.GetPosition().y;
	if (height < 0) {height = -height;}
	var gravity = world.GetGravity();
	var velocityY = -Math.sqrt(2*gravity.y*height);

	//calculate the time to reach the apex
	var time = -velocityY / gravity.y;

	//calculate the initial horizontal velocity required to hit the apex
	var width = mouseX - fruit.GetPosition().x;
	var velocityX = width / time;

	fruit.SetLinearVelocity(new b2Vec2(velocityX, velocityY));
	RemoveHighlight(fruit);
	HighlightNextThrow();
}

function HighlightNextThrow()
{
// highlights top helfFruit after checking for existence and existing highlight
	if(heldFruit.length > 0)
	{
		nextFruitAnimation.addTarget(heldFruit[0].GetUserData().texture);
		nextFruitAnimation.play();
	}
}

function RemoveHighlight(fruit)
{
	nextFruitAnimation.removeTarget(fruit.GetUserData().texture);
	fruit.GetUserData().texture.setOpacity(1);
}

function MergeFruits(world, fruitA, fruitB)
{
	var index = heldFruit.lastIndexOf(fruitA);
	if (index != -1)
		{heldFruit.splice(index,1);}
	var index = heldFruit.lastIndexOf(fruitB);
	if (index != -1)
		{heldFruit.splice(index,1);}
		
	fruitA.GetUserData().collide = true;
	fruitB.GetUserData().collide = true;
	
	//average the velocity and add a dampening effect
	var velocityX = (fruitA.GetLinearVelocity().x + fruitB.GetLinearVelocity().x) * 0.7;
	var velocityY = (fruitA.GetLinearVelocity().y + fruitB.GetLinearVelocity().y) * 0.7;
	var velocity = new b2Vec2(velocityX, velocityY);
	
	//increase the size of the larger fruit
	var sizeA = fruitA.GetUserData().size;
	var sizeB = fruitB.GetUserData().size;
	var size;
	if (sizeA > sizeB)
		{size = sizeA + 0.2;}
	else
		{size = sizeB + 0.2;}
		
	//set the new value
	var value = fruitA.GetUserData().value + fruitB.GetUserData().value;
	
	//set the new position between the old fruits
	var x = (fruitA.GetPosition().x + fruitB.GetPosition().x)/2;
	var y = (fruitA.GetPosition().y + fruitB.GetPosition().y)/2;
	
	CreateNewFruit(fruitA.GetUserData().name, world, x, y, size, velocity);
	
	points += value*2;
	CreatePopup(value*2, x*30, y*30+12);
	CreatePopup("Merge!", x*30, y*30, '#FF0');

	shouldFall = false;
	
	RemoveFruit(fruitA);
	RemoveFruit(fruitB);
	
	mergeSFX.stop();
	mergeSFX.play();
}

function ForkFruits(world, fruitA, fruitB)
{
	fruitA.GetUserData().collide = true;
	fruitB.GetUserData().collide = true;

	var fruitFork;
	var fruitNone;
	if (fruitA.GetUserData().size > fruitB.GetUserData().size)
		{fruitFork = fruitA; fruitNone = fruitB;}
	else
		{fruitFork = fruitB; fruitNone = fruitA;}
		
	var velocity = fruitFork.GetLinearVelocity();
	
	//var newVelocity = velocity.GetNegative();
	var velocity1 = new b2Vec2(-velocity.x, velocity.y);
	var velocity2 = new b2Vec2(velocity.x, -velocity.y);
	
	var size = fruitFork.GetUserData().size/1.2;
	
	var position1 = new b2Vec2(velocity1.x*size/2 + fruitFork.GetPosition().x, velocity1.y*size/2 + fruitFork.GetPosition().y);
	var position2 = new b2Vec2(velocity2.x*size/2 + fruitFork.GetPosition().x, velocity2.y*size/2 + fruitFork.GetPosition().y);
	//position1 = velocity1.Add(fruitFork.GetPosition());
	
	var x = fruitFork.GetPosition().x;
	var y = fruitFork.GetPosition().y;
	
	CreatePopup("Fork!", x*30, y*30);
	
	CreateNewFruit(fruitFork.GetUserData().name, world, position1.x, position1.y, size, velocity1);
	CreateNewFruit(fruitFork.GetUserData().name, world, position2.x, position2.y, size, velocity2);
	RemoveFruit(fruitFork);
}

function CreateNewFruit(name, world, x, y, size, velocity)
{
	switch(name)
	{
		case "strawberry":
			lime.scheduleManager.callAfter(function(dt){
				body = createStrawberry(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
		case "apple":
			lime.scheduleManager.callAfter(function(dt){
				body = createApple(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			
			break;
		case "banana":
			lime.scheduleManager.callAfter(function(dt){
				body = createBanana(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
		case "cherry":
			lime.scheduleManager.callAfter(function(dt){
				body = createCherry(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);				
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
		case "grape":
			lime.scheduleManager.callAfter(function(dt){
				body = createGrape(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
		case "lemon":
			lime.scheduleManager.callAfter(function(dt){
				body = createLemon(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
		case "orange":
			lime.scheduleManager.callAfter(function(dt){
				body = createOrange(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);				
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
		case "pear":
			lime.scheduleManager.callAfter(function(dt){
				body = createPear(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);				
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
		case "pineapple":
			lime.scheduleManager.callAfter(function(dt){
				body = createPineapple(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);				
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
		case "plum":
			lime.scheduleManager.callAfter(function(dt){
				body = createPlum(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);				
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
		case "watermelon":
			lime.scheduleManager.callAfter(function(dt){
				body = createWatermelon(world,x,y,size);
				body.SetType(b2Body.b2_dynamicBody);
				body.SetLinearVelocity(velocity);
				fallingFruit.push(body);				
				AddFruit(body);
				shouldFall = true;
			}, null, 10)
			break;
	}
}

function getRandomInt (min, max) 
{
      return Math.floor(Math.random() * (max - min + 1)) + min;
}
