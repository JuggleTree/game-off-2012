goog.provide('juggletest.FruitFunctions');

var		fruitToRemove = new Array()
	,	leftHandJoint = "empty"
	,	rightHandJoint = "empty"
	, heldFruit = []
	;

function GenerateFruit(world, fruitLayer)
{
	var x = Math.random() * 17 + 1;
	var y = Math.random() * 3 + 1;
	var size = Math.random() * 1 + 0.5;
	var type = Math.floor((Math.random()*11));
	switch(type)
	{
		case 0:
			createStrawberry(world,x,y,size);
			break;
		case 1:
			createApple(world,x,y,size);
			break;
		case 2:
			createBanana(world,x,y,size);
			break;
		case 3:
			createCherry(world,x,y,size);
			break;
		case 4:
			createGrape(world,x,y,size);
			break;
		case 5:
			createLemon(world,x,y,size);
			break;
		case 6:
			createOrange(world,x,y,size);
			break;
		case 7:
			createPear(world,x,y,size);
			break;
		case 8:
			createPineapple(world,x,y,size);
			break;
		case 9:
			createPlum(world,x,y,size);
			break;
		case 10:
			createWatermelon(world,x,y,size);
			break;
	}
}

function RemoveFruit(fruit)
{
	fruitToRemove.push(fruit);
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

