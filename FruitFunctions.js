goog.provide('juggletest.FruitFunctions');

var		fruitToRemove = new Array()
	,	leftHandJoint = "empty"
	,	rightHandJoint = "empty"
	;

function GenerateFruit(world, fruitLayer)
{
	var x = Math.random() * 17 + 1;
	var y = Math.random() * 3 + 1;
	var size = Math.random() * 1 + 0.5;
	var apple = createApple(world,x,y,size);
	fruitLayer.appendChild(apple.GetUserData().texture);
}

function RemoveFruit(fruit)
{
	fruitToRemove.push(fruit);
}

function CatchFruit(world, fruit, hand, handType)
{
	if (leftHandJoint == "empty" && handType == "left"
		|| rightHandJoint == "empty" && handType == "right")
	{
		jointDef = new b2DistanceJointDef();
		jointDef.Initialize(fruit, hand, fruit.GetPosition(), hand.GetPosition());
		jointDef.collideConnected = true;
		if (handType == "left")
		{ leftHandJoint = world.CreateJoint(jointDef); }
		else if (handType == "right")
		{ rightHandJoint = world.CreateJoint(jointDef); }
	}
}

function ThrowFruit(world)
{
	if (rightHandJoint != "empty")
	{
		if (rightHandJoint.GetBodyA().GetUserData().type == "fruit")
		{
			world.DestroyJoint(rightHandJoint);
			Throw(world, rightHandJoint.GetBodyA());
			rightHandJoint = "empty";
		}
		else if (rightHandJoint.GetBodyB().GetUserData().type == "fruit")
		{
			world.DestroyJoint(rightHandJoint);
			Throw(world, rightHandJoint.GetBodyB());
			rightHandJoint = "empty";
		}
	}
	else if (leftHandJoint != "empty")
	{
		if (leftHandJoint.GetBodyA().GetUserData().type == "fruit")
		{
			world.DestroyJoint(leftHandJoint);
			Throw(world, leftHandJoint.GetBodyA());
			leftHandJoint = "empty";
		}
		else if (leftHandJoint.GetBodyB().GetUserData().type == "fruit")
		{
			world.DestroyJoint(leftHandJoint);
			Throw(world, leftHandJoint.GetBodyB());
			leftHandJoint = "empty";
		}
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
	