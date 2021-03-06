/*
*
*	Magma Spawn abilities
*
*/
abilities[4] =[

// 	First Ability: Scorched Ground
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onStartPhase",

	// 	require() :
	require : function(){return this.testRequirements();},

	//	activate() : 
	activate : function() {
		var effectFn = function(effect,crea){ 
			crea.takeDamage(new Damage( effect.attacker, "effect", {burn:10}, 1,[] )); 
			this.trap.destroy();
		};

		var requireFn = function(){ 
			if(this.trap.hex.creature==0) return false;
			return this.trap.hex.creature.type != "L2"; 
		};

		this.creature.hexagons[1].createTrap("scorched-ground",[
			new Effect(
				"Scorched Ground",this.creature,this.creature.hexagons[1],"onStepIn",
				{ requireFn: requireFn, effectFn: effectFn,	attacker: this.creature }
			),
		],this.creature.player, {turnLifetime:1} );

		var hex;
		if( this.creature.player.flipped )
			hex = this.creature.hexagons[0];
		else
			hex = this.creature.hexagons[2];


		hex.createTrap("scorched-ground",[
			new Effect(
				"Scorched Ground",this.creature,hex,"onStepIn",
				{ requireFn: requireFn, effectFn: effectFn,	attacker: this.creature }
			),
		],this.creature.player, {turnLifetime:1} );
	},
},



// 	Second Ability: Pulverizing Punch
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		burn : 0,
		crush : 9
	},

	// 	require() :
	require : function(){
		if( !this.testRequirements() ) return false;

		if( !this.atLeastOneTarget( G.grid.getHexMap(this.creature.x-3,this.creature.y-2,0,false,frontnback3hex),"ennemy" ) ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	// 	query() :
	query : function(){
		var ability = this;
		var magmaSpawn = this.creature;

		G.grid.queryCreature({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			team : 0, //Team, 0 = ennemies
			id : magmaSpawn.id,
			flipped : magmaSpawn.flipped,
			hexs : G.grid.getHexMap(magmaSpawn.x-3,magmaSpawn.y-2,0,false,frontnback3hex),
		});
	},


	//	activate() : 
	activate : function(target,args) {
		var ability = this;
		ability.end();

		ability.creature.burnBoost = (ability.creature.burnBoost+1) ? ability.creature.burnBoost : 1;

		var d = {burn:ability.creature.burnBoost, crush:ability.damages.crush};
		
		var damage = new Damage(
			ability.creature, //Attacker
			"target", //Attack Type
			d, //Damage Type
			1, //Area
			[]	//Effects
		);

		target.takeDamage(damage);

		ability.creature.burnBoost++;
	},
},



// 	Thirt Ability: Fissure Vent
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		burn : 10,
	},

	map : [ [0,0,1,0],
		[0,0,1,1],
		[0,1,1,0],//origin line
		[0,0,1,1],
		[0,0,1,0]],

	// 	require() :
	require : function(){
		if( !this.testRequirements() ) return false;

		// Require Ennemy
		// var magmaSpawn = this.creature;
		// var hexs = G.grid.getHexMap(magmaSpawn.x,magmaSpawn.y-2,0,false,this.map).concat(
		// 	G.grid.getHexMap(magmaSpawn.x-magmaSpawn.size+1,magmaSpawn.y-2,0,true,this.map));
		// if( !this.atLeastOneTarget( hexs,"ennemy" ) ){
		// 	this.message = G.msg.abilities.notarget;
		// 	return false;
		// }
		return true;
	},

	// 	query() :
	query : function(){
		var ability = this;
		var magmaSpawn = this.creature;

		G.grid.queryChoice({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			team : 3, 
			requireCreature : 0,
			id : magmaSpawn.id,
			flipped : magmaSpawn.flipped,
			choices : [
				G.grid.getHexMap(magmaSpawn.x,magmaSpawn.y-2,0,false,this.map),
				G.grid.getHexMap(magmaSpawn.x-magmaSpawn.size+1,magmaSpawn.y-2,0,true,this.map)
			],
		})

	},


	//	activate() : 
	activate : function(hexs,args) {
		var ability = this;
		ability.end();

		//Basic Attack all nearby creatures
		ability.areaDamage(
			ability.creature, //Attacker
			"zone", //Attack Type
			ability.damages, //Damage Type
			[],	//Effects
			ability.getTargets(hexs) //Targets
		);
	},
},



// 	Fourth Ability: Molten Hurl
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		crush : 10,
		burn : 5,
	},

	directions : [0,1,0,0,1,0],

	require : function(){
		if( !this.testRequirements() ) return false;

		var magmaSpawn = this.creature;
		var x = (magmaSpawn.player.flipped) ? magmaSpawn.x-magmaSpawn.size+1 : magmaSpawn.x ;

		var test = this.testDirection({
			team : "ennemy",
			x : x,
			directions : this.directions,
		});

		if( !test ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	// 	query() :
	query : function(){
		var ability = this;
		var magmaSpawn = this.creature;

		var x = (magmaSpawn.player.flipped) ? magmaSpawn.x-magmaSpawn.size+1 : magmaSpawn.x ;

		G.grid.queryDirection({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			team : 0, //enemies
			id : magmaSpawn.id,
			requireCreature : true,
			x : x,
			y : magmaSpawn.y,
			directions : this.directions,
		});
	},


	//	activate() : 
	activate : function(path,args) {
		var ability = this;
		var magmaSpawn = this.creature;
		ability.end();

		path.each(function(){this.destroyTrap();});

		//Damage
		var target = path.last().creature;
		var damage = new Damage(
			ability.creature, //Attacker
			"target", //Attack Type
			ability.damages, //Damage Type
			1, //Area
			[]	//Effects
		);
		target.takeDamage(damage);

		//Movement
		var magmaHex = (args.direction==4) ? magmaSpawn.hexagons[magmaSpawn.size-1] : magmaSpawn.hexagons[0] ;
		path.filterCreature(false,false);
		path.unshift(magmaHex); //prevent error on empty path
		var destination = path.last();
		var x = (args.direction==4) ? destination.x+magmaSpawn.size-1 : destination.x ;
		destination = G.grid.hexs[destination.y][x];

		magmaSpawn.moveTo(destination,{
			ignoreMovementPoint : true,
			ignorePath : true,
			callback : function(){
				G.activeCreature.queryMove();
			},
		});
	},
}

];
