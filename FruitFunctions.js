goog.provide('JuggleTree.FruitFunctions');

var     b2Vec2 = Box2D.Common.Math.b2Vec2	
	,	fruitToRemove = new Array()
	,	fruitToAdd = new Array()
	,	leftHandJoint = "empty"
	,	rightHandJoint = "empty"
	,	heldFruit = []
	;

function GenerateFruit(world)
{
	var x = Math.random() * 17 + 1;
	var y = Math.random() * 3 + 1;
	var size = Math.random() * 1 + 0.5;
	var type = 1//Math.floor((Math.random()*11));
	var initialVelocity = new b2Vec2(0, 0);
	var body;
	switch(type)
	{
		case 0:
			body = createStrawberry(world,x,y,size,initialVelocity);
			break;
		case 1:
			body = createApple(world,x,y,size,initialVelocity);
			break;
		case 2:
			body = createBanana(world,x,y,size,initialVelocity);
			break;
		case 3:
			body = createCherry(world,x,y,size,initialVelocity);
			break;
		case 4:
			body = createGrape(world,x,y,size,initialVelocity);
			break;
		case 5:
			body = createLemon(world,x,y,size,initialVelocity);
			break;
		case 6:
			body = createOrange(world,x,y,size,initialVelocity);
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
			body = createWatermelon(world,x,y,size,initialVelocity);
			break;
	}
	AddFruit(body);

}

function RemoveFruit(fruit)
{
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
		jointDef = new b2DistanceJointDef();
		jointDef.Initialize(fruit, hand, fruit.GetPosition(), hand.GetPosition());
		jointDef.collideConnected = true;
		heldFruit.push([world.CreateJoint(jointDef), fruit]);
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

		//get whichever body is the fruit
		if (currentJoint.GetBodyA().GetUserData().type == "fruit")
		{
			world.DestroyJoint(currentJoint);
			Throw(world, currentJoint.GetBodyA());
		}
		else if (currentJoint.GetBodyB().GetUserData().type == "fruit")
		{
			world.DestroyJoint(currentJoint);
			Throw(world, currentJoint.GetBodyA());
		}
		//remove joint check
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
		{size = sizeA + 0.15;}
	else
		{size = sizeB + 0.15;}
		
	//set the new value
	var value = fruitA.GetUserData().value + fruitB.GetUserData().value;
	
	//set the new position between the old fruits
	var x = (fruitA.GetPosition().x + fruitB.GetPosition().x)/2;
	var y = (fruitA.GetPosition().y + fruitB.GetPosition().y)/2;
	
	switch(fruitA.GetUserData().name)
	{
		case "strawberry":
			lime.scheduleManager.callAfter(function(dt){
				body = createStrawberry(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
		case "apple":
			lime.scheduleManager.callAfter(function(dt){
				body = createApple(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			
			break;
		case "banana":
			lime.scheduleManager.callAfter(function(dt){
				body = createBanana(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
		case "cherry":
			lime.scheduleManager.callAfter(function(dt){
				body = createCherry(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
		case "grape":
			lime.scheduleManager.callAfter(function(dt){
				body = createGrape(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
		case "lemon":
			lime.scheduleManager.callAfter(function(dt){
				body = createLemon(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
		case "orange":
			lime.scheduleManager.callAfter(function(dt){
				body = createOrange(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
		case "pear":
			lime.scheduleManager.callAfter(function(dt){
				body = createPear(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
		case "pineapple":
			lime.scheduleManager.callAfter(function(dt){
				body = createPineapple(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
		case "plum":
			lime.scheduleManager.callAfter(function(dt){
				body = createPlum(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
		case "watermelon":
			lime.scheduleManager.callAfter(function(dt){
				body = createWatermelon(world,x,y,size,velocity);
				AddFruit(body);
			}, null, 10)
			break;
	}
	
	RemoveFruit(fruitA);
	RemoveFruit(fruitB);
}