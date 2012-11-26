goog.provide('JuggleTree.BoxBuilder');

goog.require('lime.Sprite');

 var   b2Vec2 = Box2D.Common.Math.b2Vec2
	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
	,	b2Body = Box2D.Dynamics.b2Body
	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	,	b2Fixture = Box2D.Dynamics.b2Fixture
	,	b2World = Box2D.Dynamics.b2World
	,	b2MassData = Box2D.Collision.Shapes.b2MassData
	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	,	b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape
	;

//Each Box2d body will have this game object attached to it
//Data can be accessed by using the function b2body.GetUserData()
function gameObject(type, name, texture, value, size)
{
	this.type=type; //ex: fruit, hand, powerup
	this.name=name; //ex: apple, orange, watermelon
	this.texture = texture;
	this.hasJoint=false; // check to see if this is attached to anything
	this.joint=null;
	this.value = value;
	this.size = size;
	this.collide = false; //Need this for the fruit merging. When 2 fruits collide they call the MergeFruit function more than once, causing too many new fruits to spawn.
}
	
function createBoundries(world)
{
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_staticBody;
	var wall = world.CreateBody(bodyDef);
	
	var texture = new lime.Sprite(); //empty sprite
	
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.8;
	fixDef.shape = new b2PolygonShape;
	
	wall.SetUserData(new gameObject("wall","left",texture,0,0));
	fixDef.shape.SetAsEdge(new b2Vec2(0,-2), new b2Vec2(0,15));
	wall.CreateFixture(fixDef);
	
	wall = world.CreateBody(bodyDef);
	wall.SetUserData(new gameObject("wall","bottom",texture,0,0));
	fixDef.shape.SetAsEdge(new b2Vec2(0,15), new b2Vec2(20,15));
	wall.CreateFixture(fixDef);

	wall = world.CreateBody(bodyDef);
	wall.SetUserData(new gameObject("wall","right",texture,0,0));
	fixDef.shape.SetAsEdge(new b2Vec2(20,15), new b2Vec2(20,-2));
	wall.CreateFixture(fixDef);	
}

function createHand(world, x, y, name)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_kinematicBody;
	bodyDef.position.Set(x,y);
	
	var hand = world.CreateBody(bodyDef);
	var texture = new lime.Sprite()
		.setSize(1.4*30, 0.4*30);
		
	if (name=="left")
		texture.setFill('assets/LeftHand.png');
	else if (name=="right")
		texture.setFill('assets/RightHand.png');
		
	hand.SetUserData(new gameObject("hand",name,texture,0,0));
	hand.SetSleepingAllowed(false);
	
	//Create the Shape
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(0.7,0.05);
	hand.CreateFixture(fixDef);
	
	//Return the hand as a reference so the player can move it
	return hand;
}

//Currently the juggler doesn't have a box2d body so fruits will pass through him
function createJuggler(world, x, y, jugglerLayer)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_kinematicBody;
	bodyDef.position.Set(x,y);
	var juggler = world.CreateBody(bodyDef);

	var animation = true;
	var texture = new lime.Sprite()
		.setSize(49, 88)
		.setFill('assets/Juggler0.png')
		.setPosition(x*30,y*30);
		
	juggler.SetUserData(new gameObject("juggler","juggler",texture,0,0));
	juggler.SetSleepingAllowed(false);

	//animate the juggler
	lime.scheduleManager.scheduleWithDelay(function (dt)
		{
			if (animation)
			{
				texture.setFill('assets/Juggler1.png');
				animation = false;
			}
			else
			{
				texture.setFill('assets/Juggler0.png');
				animation = true;
			}
		}, world, 600, 0)
		
	return juggler;
}

function createBasket(world, x, y, name)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_kinematicBody;
	bodyDef.position.Set(x,y);

	var basket = world.CreateBody(bodyDef);
	var texture = new lime.Sprite()
	.setSize(2*30, 0.4*30)
	.setFill('#c00');

	if (name=="leftBasket")
		texture.setFill('#c00');
	//texture.setFill('assets/LeftBasket.png');
	else if (name=="rightBasket")
		texture.setFill('#c00');
	//texture.setFill('assets/RightBasket.png');

	basket.SetUserData(new gameObject("basket", name, texture, 0, 0));
	basket.SetSleepingAllowed(false);

	//Create the Shape
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(1.5,0.05);
	basket.CreateFixture(fixDef);

	//Return the basket as a reference
	return basket;
}

function GetValue(size)
{
	Math.floor(size*10);
}

function createApple(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
		
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/apple.png')
		.setSize(size*30, size*24.27);
	body.SetUserData(new gameObject("fruit","apple",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.24*size,-0.34*size),new b2Vec2(0.5*size,-0.1*size),new b2Vec2(0.48*size,0.2*size),new b2Vec2(0*size,-0.32*size)],4);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(-0.1*size,0.24*size),new b2Vec2(-0.3*size,0.24*size),new b2Vec2(-0.5*size,0.1*size),new b2Vec2(-0.5*size,-0.08*size),new b2Vec2(0.48*size,0.2*size)],5);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(-0.28*size,-0.34*size),new b2Vec2(-0.18*size,-0.4*size),new b2Vec2(-0.1*size,-0.4*size),new b2Vec2(0*size,-0.32*size),new b2Vec2(0.48*size,0.2*size),new b2Vec2(-0.5*size,-0.08*size)],6);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.2*size,0.4*size),new b2Vec2(-0.04*size,0.3*size),new b2Vec2(0.16*size,0.32*size)],3);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(-0.1*size,0.42*size),new b2Vec2(-0.2*size,0.36*size),new b2Vec2(-0.1*size,0.24*size),new b2Vec2(-0.04*size,0.3*size)],4);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.48*size,0.2*size),new b2Vec2(0.3*size,0.32*size),new b2Vec2(0.16*size,0.32*size),new b2Vec2(-0.04*size,0.3*size),new b2Vec2(-0.1*size,0.24*size)],5);
	body.CreateFixture(fixDef);
	
	return body;
}

function createBanana(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/banana.png')
		.setSize(size*30, size*20.93)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","banana",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.95*size,0.54*size),new b2Vec2(0.95*size,0.68*size),new b2Vec2(0.86*size,0.7*size),new b2Vec2(0.86*size,0.55*size)],4);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.15*size,0.26*size),new b2Vec2(0.07*size,0.33*size),new b2Vec2(0*size,0.28*size),new b2Vec2(0*size,0.2*size)],4);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0*size,0.2*size),new b2Vec2(0.15*size,0.06*size),new b2Vec2(0.28*size,0*size),new b2Vec2(0.59*size,0*size),new b2Vec2(0.6*size,0.26*size),new b2Vec2(0.15*size,0.26*size)],6);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.59*size,0*size),new b2Vec2(0.84*size,0.07*size),new b2Vec2(0.93*size,0.14*size),new b2Vec2(1*size,0.26*size),new b2Vec2(1*size,0.48*size),new b2Vec2(0.95*size,0.54*size),new b2Vec2(0.82*size,0.46*size),new b2Vec2(0.60*size,0.26*size)],8);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.95*size,0.54*size),new b2Vec2(0.86*size,0.55*size),new b2Vec2(0.82*size,0.46*size)],3);
	body.CreateFixture(fixDef);
	
	return body;
}

function createGrape(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/grape.png')
		.setSize(size*30, size*45)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","grape",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.27*size,0.11*size),new b2Vec2(0.36*size,0*size),new b2Vec2(0.59*size,0*size),new b2Vec2(0.65*size,0.09*size),new b2Vec2(0.65*size,0.15*size)],5);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.65*size,0.15*size),new b2Vec2(0.79*size,0.15*size),new b2Vec2(0.79*size,0.3*size)],3);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.79*size,0.3*size),new b2Vec2(0.15*size,0.5*size),new b2Vec2(0.15*size,0.11*size),new b2Vec2(0.27*size,0.11*size),new b2Vec2(0.65*size,0.15*size)],5);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.90*size,0.94*size),new b2Vec2(0.90*size,1.05*size),new b2Vec2(0.84*size,1.1*size),new b2Vec2(0.65*size,1.1*size)],4);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.65*size,1.1*size),new b2Vec2(0.89*size,0.54*size),new b2Vec2(1*size,0.65*size),new b2Vec2(1*size,0.85*size),new b2Vec2(0.90*size,0.94*size)],5);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.71*size,1.34*size),new b2Vec2(0.89*size,1.34*size),new b2Vec2(0.89*size,1.5*size),new b2Vec2(0.76*size,1.5*size)],4);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.76*size,1.5*size),new b2Vec2(0.5*size,1.30*size),new b2Vec2(0.64*size,1.28*size),new b2Vec2(0.71*size,1.34*size)],4);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.5*size,1.30*size),new b2Vec2(0.65*size,1.10*size),new b2Vec2(0.64*size,1.28*size)],3);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.33*size,1.20*size),new b2Vec2(0.11*size,1.20*size),new b2Vec2(0.10*size,0.83*size)],3);
	body.CreateFixture(fixDef);	

	fixDef.shape.SetAsArray([new b2Vec2(0.10*size,0.83*size),new b2Vec2(0*size,0.72*size),new b2Vec2(0*size,0.56*size)],3);
	body.CreateFixture(fixDef);	

	fixDef.shape.SetAsArray([new b2Vec2(0*size,0.56*size),new b2Vec2(0.15*size,0.5*size),new b2Vec2(0.79*size,0.30*size),new b2Vec2(0.89*size,0.30*size),new b2Vec2(0.89*size,0.54*size),new b2Vec2(0.65*size,1.10*size)],6);
	body.CreateFixture(fixDef);	

	fixDef.shape.SetAsArray([new b2Vec2(0.65*size,1.10*size),new b2Vec2(0.5*size,1.30*size),new b2Vec2(0.40*size,1.30*size),new b2Vec2(0.33*size,1.20*size),new b2Vec2(0.10*size,0.83*size),new b2Vec2(0*size,0.56*size)],6);
	body.CreateFixture(fixDef);		
	return body;
}

function createCherry(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/cherry.png')
		.setSize(size*30, size*56.25)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","cherry",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.64*size,1.46*size),new b2Vec2(0.99*size,1.89*size),new b2Vec2(0.77*size,1.89*size),new b2Vec2(0.45*size,1.54*size)],4);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.45*size,1.54*size),new b2Vec2(0.45*size,1.05*size),new b2Vec2(0.64*size,1.03*size),new b2Vec2(0.64*size,1.46*size)],4);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.45*size,1.05*size),new b2Vec2(0*size,0.91*size),new b2Vec2(0*size,0.13*size),new b2Vec2(0.15*size,0*size),new b2Vec2(0.81*size,0.01*size),new b2Vec2(0.99*size,0.18*size),new b2Vec2(0.99*size,0.74*size),new b2Vec2(0.64*size,1.03*size)],8);
	body.CreateFixture(fixDef);
	
	return body;
}

function createLemon(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/lemon.png')
		.setSize(size*30, size*37.83)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","lemon",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.69*size,1.11*size),new b2Vec2(0.69*size,1.19*size),new b2Vec2(0.65*size,1.26*size),new b2Vec2(0.53*size,1.26*size),new b2Vec2(0.48*size,1.15*size)],5);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.48*size,1.15*size),new b2Vec2(0.26*size,1.03*size),new b2Vec2(0.8*size,0.92*size),new b2Vec2(0.69*size,1.11*size)],4);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.26*size,1.03*size),new b2Vec2(0.11*size,0.95*size),new b2Vec2(0*size,0.82*size),new b2Vec2(0*size,0.39*size),new b2Vec2(0.05*size,0.24*size),new b2Vec2(0.39*size,0*size),new b2Vec2(0.55*size,0*size)],7);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.55*size,0*size),new b2Vec2(0.79*size,0.14*size),new b2Vec2(1*size,0.36*size),new b2Vec2(1*size,0.65*size),new b2Vec2(0.89*size,0.89*size),new b2Vec2(0.80*size,0.92*size),new b2Vec2(0.26*size,1.03*size)],7);
	body.CreateFixture(fixDef);
	
	return body;
}

function createOrange(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/orange.png')
		.setSize(size*30, size*28.8)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","orange",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.96*size,0.28*size),new b2Vec2(1*size,0.37*size),new b2Vec2(1*size,0.56*size)],3);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(1*size,0.56*size),new b2Vec2(0.92*size,0.74*size),new b2Vec2(0.87*size,0.84*size),new b2Vec2(0.67*size,0.96*size),new b2Vec2(0.41*size,0.96*size),new b2Vec2(0.19*size,0.88*size),new b2Vec2(0*size,0.67*size)],7);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0*size,0.67*size),new b2Vec2(0*size,0.28*size),new b2Vec2(0.13*size,0.12*size),new b2Vec2(0.33*size,0*size),new b2Vec2(0.79*size,0*size),new b2Vec2(0.89*size,0.12*size),new b2Vec2(0.96*size,0.28*size),new b2Vec2(1*size,0.56*size)],8);
	body.CreateFixture(fixDef);
	
	return body;
}

function createPear(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/pear.png')
		.setSize(size*30, size*46.67)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","pear",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.66*size,1.35*size),new b2Vec2(0.66*size,1.55*size),new b2Vec2(0.55*size,1.56*size),new b2Vec2(0.58*size,1.34*size)],4);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.35*size,1.05*size),new b2Vec2(0.08*size,0.81*size),new b2Vec2(0*size,0.66*size),new b2Vec2(0*size,0.31*size),new b2Vec2(0.05*size,0.21*size),new b2Vec2(0.09*size,0.13*size),new b2Vec2(0.2*size,0.05*size),new b2Vec2(0.32*size,0*size)],8);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.32*size,0*size),new b2Vec2(0.57*size,0*size),new b2Vec2(0.76*size,0.08*size),new b2Vec2(0.88*size,0.18*size),new b2Vec2(1*size,0.42*size)],5);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(1*size,0.42*size),new b2Vec2(1*size,0.63*size),new b2Vec2(0.89*size,1.07*size),new b2Vec2(0.83*size,1.27*size),new b2Vec2(0.35*size,1.05*size),new b2Vec2(0.32*size,0*size)],6);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.83*size,1.27*size),new b2Vec2(0.66*size,1.35*size),new b2Vec2(0.58*size,1.34*size),new b2Vec2(0.38*size,1.23*size),new b2Vec2(0.35*size,1.05*size)],5);
	body.CreateFixture(fixDef);
	
	return body;
}

function createPineapple(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/pineapple.png')
		.setSize(size*30, size*65.17)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","pineapple",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.32*size,1.19*size),new b2Vec2(0.22*size,1.11*size),new b2Vec2(0.08*size,0.74*size),new b2Vec2(0.05*size,0.51*size),new b2Vec2(0.04*size,0.18*size),new b2Vec2(0.15*size,0.07*size)],6);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.15*size,0.07*size),new b2Vec2(0.36*size,0*size),new b2Vec2(0.55*size,0*size),new b2Vec2(0.87*size,0.12*size),new b2Vec2(0.83*size,0.81*size),new b2Vec2(0.71*size,1.17*size),new b2Vec2(0.32*size,1.19*size)],7);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.86*size,1.4*size),new b2Vec2(1*size,1.52*size),new b2Vec2(0.76*size,1.51*size),new b2Vec2(0.77*size,1.36*size)],4);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.77*size,1.27*size),new b2Vec2(0.90*size,1.28*size),new b2Vec2(1*size,1.39*size),new b2Vec2(0.86*size,1.40*size),new b2Vec2(0.77*size,1.36*size)],5);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.76*size,1.51*size),new b2Vec2(0.77*size,1.61*size),new b2Vec2(0.72*size,1.80*size),new b2Vec2(0.58*size,1.68*size)],4);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.58*size,1.68*size),new b2Vec2(0.55*size,1.87*size),new b2Vec2(0.47*size,2.07*size),new b2Vec2(0.34*size,2.17*size),new b2Vec2(0.35*size,1.64*size)],5);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.35*size,1.64*size),new b2Vec2(0.23*size,1.31*size),new b2Vec2(0.32*size,1.19*size),new b2Vec2(0.71*size,1.17*size),new b2Vec2(0.77*size,1.27*size),new b2Vec2(0.76*size,1.51*size),new b2Vec2(0.58*size,1.68*size)],7);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.35*size,1.64*size),new b2Vec2(0.16*size,1.39*size),new b2Vec2(0.10*size,1.30*size),new b2Vec2(0.12*size,1.21*size),new b2Vec2(0.23*size,1.31*size)],5);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.13*size,1.63*size),new b2Vec2(-0.01*size,1.58*size),new b2Vec2(0.16*size,1.39*size),new b2Vec2(0.35*size,1.64*size)],4);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.35*size,1.64*size),new b2Vec2(0.06*size,1.86*size),new b2Vec2(0.06*size,1.75*size),new b2Vec2(0.13*size,1.63*size)],4);
	body.CreateFixture(fixDef);
	
	return body;
}

function createPlum(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/plum.png')
		.setSize(size*30, size*36.52)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","plum",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.27*size,0*size),new b2Vec2(0.64*size,0*size),new b2Vec2(0.87*size,0.12*size),new b2Vec2(1*size,0.29*size),new b2Vec2(0.99*size,1*size),new b2Vec2(0.59*size,1.22*size)],6);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.59*size,1.22*size),new b2Vec2(0.42*size,1.22*size),new b2Vec2(0.22*size,1.12*size),new b2Vec2(-0.01*size,0.89*size),new b2Vec2(0*size,0.29*size),new b2Vec2(0.05*size,0.19*size),new b2Vec2(0.27*size,0*size)],7);
	body.CreateFixture(fixDef);
	
	return body;
}

function createStrawberry(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/strawberry.png')
		.setSize(size*30, size*35)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","strawberry",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.72*size,1.1*size),new b2Vec2(0.62*size,1.1*size),new b2Vec2(0.82*size,0.92*size)],3);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.82*size,0.92*size),new b2Vec2(0.94*size,1.17*size),new b2Vec2(0.75*size,1.17*size),new b2Vec2(0.72*size,1.10*size)],4);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.62*size,1.1*size),new b2Vec2(0.58*size,1.16*size),new b2Vec2(0.49*size,1.16*size),new b2Vec2(0.46*size,1.09*size)],4);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.38*size,1.09*size),new b2Vec2(0.30*size,1.17*size),new b2Vec2(0.22*size,1.12*size),new b2Vec2(0.30*size,1.03*size)],4);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.30*size,1.03*size),new b2Vec2(0.46*size,1.09*size),new b2Vec2(0.38*size,1.09*size)],3);
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.30*size,1.03*size),new b2Vec2(0*size,0.83*size),new b2Vec2(0*size,0.35*size),new b2Vec2(0.17*size,0*size),new b2Vec2(0.65*size,0*size),new b2Vec2(1*size,0.45*size)],6);
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(1*size,0.45*size),new b2Vec2(1*size,0.66*size),new b2Vec2(0.82*size,0.92*size),new b2Vec2(0.62*size,1.1*size),new b2Vec2(0.46*size,1.09*size),new b2Vec2(0.30*size,1.03*size)],6);
	body.CreateFixture(fixDef);
	
	return body;
}

function createWatermelon(world, x, y, size, velocity)
{
	//Create the Body
	var bodyDef = new b2BodyDef;
	bodyDef.position.Set(x,y);
	bodyDef.type = b2Body.b2_staticBody;
	
	var body = world.CreateBody(bodyDef)
		var texture = new lime.Sprite()
		.setFill('assets/watermelon.png')
		.setSize(size*30, size*28.89)
		.setAnchorPoint(0,0);
	body.SetUserData(new gameObject("fruit","watermelon",texture,Math.floor(size*10),size));
	body.SetAngle(Math.PI);
	body.SetLinearVelocity(velocity);
	
	//Create the Polygons
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([new b2Vec2(0.24*size,0*size),new b2Vec2(0.37*size,0*size),new b2Vec2(0.55*size,0.04*size),new b2Vec2(0.7*size,0.12*size),new b2Vec2(0.82*size,0.25*size),new b2Vec2(0.93*size,0.4*size)],6);	
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0.93*size,0.4*size),new b2Vec2(0.98*size,0.5*size),new b2Vec2(1*size,0.61*size),new b2Vec2(1*size,0.69*size),new b2Vec2(0.94*size,0.83*size),new b2Vec2(0.80*size,0.95*size),new b2Vec2(0.24*size,0*size)],7);	
	body.CreateFixture(fixDef);
	
	fixDef.shape.SetAsArray([new b2Vec2(0.80*size,0.95*size),new b2Vec2(0.76*size,0.96*size),new b2Vec2(0.57*size,0.96*size),new b2Vec2(0.37*size,0.89*size),new b2Vec2(0.29*size,0.84*size),new b2Vec2(0.16*size,0.71*size),new b2Vec2(0*size,0.48*size)],7);	
	body.CreateFixture(fixDef);

	fixDef.shape.SetAsArray([new b2Vec2(0*size,0.48*size),new b2Vec2(0*size,0.27*size),new b2Vec2(0.03*size,0.17*size),new b2Vec2(0.08*size,0.1*size),new b2Vec2(0.17*size,0.04*size),new b2Vec2(0.24*size,0*size),new b2Vec2(0.80*size,0.95*size)],7);	
	body.CreateFixture(fixDef);
	
	return body;
}
