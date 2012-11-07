goog.provide('juggletest.FruitBuilder');

	 var   b2Vec2 = Box2D.Common.Math.b2Vec2
		,	b2BodyDef = Box2D.Dynamics.b2BodyDef
		,	b2Body = Box2D.Dynamics.b2Body
		,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
		,	b2Fixture = Box2D.Dynamics.b2Fixture
		,	b2World = Box2D.Dynamics.b2World
		,	b2MassData = Box2D.Collision.Shapes.b2MassData
		,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
		,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
		;
		
	function createApple(x, y, size, world)
	{
		//Create the Body
		var bodyDef = new b2BodyDef;
		bodyDef.position.Set(x,y);
		bodyDef.type = b2Body.b2_dynamicBody;
		
		var apple = world.CreateBody(bodyDef)
		apple.SetUserData("apple");
		apple.SetAngle(Math.PI);
		
		//Create the Polygons
		var fixDef = new b2FixtureDef;
		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.2;

		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsArray([new b2Vec2(0*size,-0.32*size),new b2Vec2(0.24*size,-0.34*size),new b2Vec2(0.5*size,-0.1*size),new b2Vec2(0.48*size,0.2*size)],4);
		apple.CreateFixture(fixDef);

		fixDef.shape.SetAsArray([new b2Vec2(0.48*size,0.2*size),new b2Vec2(-0.1*size,0.24*size),new b2Vec2(-0.3*size,0.24*size),new b2Vec2(-0.5*size,0.1*size),new b2Vec2(-0.5*size,-0.08*size)],5);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(-0.5*size,-0.08*size),new b2Vec2(-0.28*size,-0.34*size),new b2Vec2(-0.18*size,-0.4*size),new b2Vec2(-0.1*size,-0.4*size),new b2Vec2(0*size,-0.32*size),new b2Vec2(0.48*size,0.2*size)],6);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(0.16*size,0.32*size),new b2Vec2(0.2*size,0.4*size),new b2Vec2(-0.04*size,0.3*size)],3);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(-0.04*size,0.3*size),new b2Vec2(-0.1*size,0.42*size),new b2Vec2(-0.2*size,0.36*size),new b2Vec2(-0.1*size,0.24*size)],4);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(-0.1*size,0.24*size),new b2Vec2(0.48*size,0.2*size),new b2Vec2(0.3*size,0.32*size),new b2Vec2(0.16*size,0.32*size),new b2Vec2(-0.04*size,0.3*size)],5);
		apple.CreateFixture(fixDef);
	}