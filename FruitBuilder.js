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
		
		//Create the Polygons
		var fixDef = new b2FixtureDef;
		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.2;

		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsArray([new b2Vec2(0.5*size,0.08*size),new b2Vec2(0.74*size,0.06*size),new b2Vec2(1*size,0.3*size),new b2Vec2(0.98*size,0.6*size)],4);
		apple.CreateFixture(fixDef);

		fixDef.shape.SetAsArray([new b2Vec2(0.98*size,0.6*size),new b2Vec2(0.4*size,0.64*size),new b2Vec2(0.2*size,0.64*size),new b2Vec2(0*size,0.5*size),new b2Vec2(0*size,0.32*size)],5);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(0*size,0.32*size),new b2Vec2(0.22*size,0.06*size),new b2Vec2(0.32*size,0*size),new b2Vec2(0.4*size,0*size),new b2Vec2(0.5*size,0.08*size),new b2Vec2(0.98*size,0.6*size)],6);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(0.66*size,0.72*size),new b2Vec2(0.7*size,0.8*size),new b2Vec2(0.46*size,0.7*size)],3);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(0.46*size,0.7*size),new b2Vec2(0.4*size,0.82*size),new b2Vec2(0.3*size,0.76*size),new b2Vec2(0.4*size,0.64*size)],4);
		apple.CreateFixture(fixDef);
		
		fixDef.shape.SetAsArray([new b2Vec2(0.4*size,0.64*size),new b2Vec2(0.98*size,0.6*size),new b2Vec2(0.8*size,0.72*size),new b2Vec2(0.66*size,0.72*size),new b2Vec2(0.46*size,0.7*size)],5);
		apple.CreateFixture(fixDef);
	}