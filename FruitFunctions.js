goog.provide('JuggleTree.FruitFunctions');

goog.require('JuggleTree.Popups');

var     b2Vec2 = Box2D.Common.Math.b2Vec2	
	,	fruitToRemove = new Array()
	,	fruitToAdd = new Array()
	,	leftHandJoint = "empty"
	,	rightHandJoint = "empty"
	,	heldFruit = []
	,	growingFruit = new Array()
	,	fallingFruit = new Array()
	,	points = 0
	;

function GenerateFruit(world, fruitLayer)
{

	if (fruitLayer.getNumberOfChildren() < 10)
	{
		var x = Math.random() * 17 + 1;
		var y = Math.random() + 1;
		var size = Math.random() + 0.3;
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
				body = createCherry(world,x,y,size*0.5,initialVelocity);
				break;
			case 4:
				body = createGrape(world,x,y,size*0.8,initialVelocity);
				break;
			case 5:
				body = createLemon(world,x,y,size,initialVelocity);
				break;
			case 6:
				body = createOrange(world,x,y,size*0.7,initialVelocity);
				break;
			case 7:
				body = createPear(world,x,y,size,initialVelocity);
				break;
			case 8:
				body = createPineapple(world,x,y,size,initialVelocity);
				break;
			case 9:
				body = createPlum(world,x,y,size,initialVelocity);
				break;
			case 10:
				body = createWatermelon(world,x,y,size*1.3,initialVelocity);
				break;
		}
		AddFruit(body);
		growingFruit.push(body);
	}

}

function DropFruit()
{
	if (fallingFruit.length < 3 && growingFruit.length > 0)
	{
		var fruit = growingFruit.shift();
		fruit.SetType(b2Body.b2_dynamicBody);
		fallingFruit.push(fruit);
	}
}

function RemoveFruit(fruit)
{
	var index = fallingFruit.lastIndexOf(fruit);
	fallingFruit.splice(index,1);
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
		heldFruit.push([world.CreateJoint(jointDef), fruit]);
		
		CreatePopup(fruit.GetUserData().value, fruit.GetPosition().x*30, fruit.GetPosition().y*30);
		
		//add points to total score
		points += fruit.GetUserData().value;
		
		//increase point value by one
		fruit.GetUserData().value++;
	}
}

function ThrowFruit(world)
{
	//fruits are currently attached
	if (heldFruit.length > 0)
	{
		var temp = heldFruit.shift();
		var currentJoint = temp[0];
		var currentFruit = temp[1];
		
		world.DestroyJoint(currentJoint);
		Throw(world, currentFruit);

		currentFruit.hasJoint = false;
	}
}

function Throw(world, fruit)
{
	//calculate the initial vertical velocity required to reach the apex
	var height = mouseY - fruit.GetPosition().y;
	if (height < 0) {height = -height;}
	var gravity = world.GetGravity()
		var velocityY = -Math.sqrt(2*gravity.y*height);

	//calculate the time to reach the apex
	var time = -velocityY / gravity.y;

	//calculate the initial horizontal velocity required to hit the apex
	var width = mouseX - fruit.GetPosition().x;
	var velocityX = width / time;

	fruit.SetLinearVelocity(new b2Vec2(velocityX, velocityY));
}

function MergeFruits(world, fruitA, fruitB)
{
	fruitA.GetUserData().collide = true;
	fruitB.GetUserData().collide = true;
	
	//average the velocity and add a dampening effect
	var velocityX = (fruitA.GetLinearVelocity().x + fruitB.GetLinearVelocity().x) * 0.5;
	var velocityY = (fruitA.GetLinearVelocity().y + fruitB.GetLinearVelocity().y) * 0.5;
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
	
	CreatePopup("Merge!", x*30, y*30);
	
	RemoveFruit(fruitA);
	RemoveFruit(fruitB);
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
				body = createStrawberry(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);
				AddFruit(body);
			}, null, 10)
			break;
		case "apple":
			lime.scheduleManager.callAfter(function(dt){
				body = createApple(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);
				AddFruit(body);
			}, null, 10)
			
			break;
		case "banana":
			lime.scheduleManager.callAfter(function(dt){
				body = createBanana(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);
				AddFruit(body);
			}, null, 10)
			break;
		case "cherry":
			lime.scheduleManager.callAfter(function(dt){
				body = createCherry(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);				
				AddFruit(body);
			}, null, 10)
			break;
		case "grape":
			lime.scheduleManager.callAfter(function(dt){
				body = createGrape(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);
				AddFruit(body);
			}, null, 10)
			break;
		case "lemon":
			lime.scheduleManager.callAfter(function(dt){
				body = createLemon(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);
				AddFruit(body);
			}, null, 10)
			break;
		case "orange":
			lime.scheduleManager.callAfter(function(dt){
				body = createOrange(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);				
				AddFruit(body);
			}, null, 10)
			break;
		case "pear":
			lime.scheduleManager.callAfter(function(dt){
				body = createPear(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);				
				AddFruit(body);
			}, null, 10)
			break;
		case "pineapple":
			lime.scheduleManager.callAfter(function(dt){
				body = createPineapple(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);				
				AddFruit(body);
			}, null, 10)
			break;
		case "plum":
			lime.scheduleManager.callAfter(function(dt){
				body = createPlum(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);				
				AddFruit(body);
			}, null, 10)
			break;
		case "watermelon":
			lime.scheduleManager.callAfter(function(dt){
				body = createWatermelon(world,x,y,size,velocity);
				body.SetType(b2Body.b2_dynamicBody);
				fallingFruit.push(body);				
				AddFruit(body);
			}, null, 10)
			break;
	}
}