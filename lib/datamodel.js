const _ = require("underscore");

const { getSimpleType } = require("./utils");

class Component {
	constructor(obj, Slot=null) {
		this.obj = obj;
		this.Slot = Slot;
	}

	get ID() {
		return this.obj.Data.ID;
	}

	get Type() {
		return this.obj.Type;
	}

	get SimpleType() {
		if(!this._SimpleType)
			this._SimpleType = getSimpleType(this.Type);
		return this._SimpleType;
	}

	HasField(key) {
		return _.has(this.obj.Data, key);
	}

	GetFieldData(key) {
		if(!this.HasField(key))
			return undefined;
		return this.obj.Data[key].Data;
	}

	static typePredicate(type) {
		return c => c.Type === type;
	}

	static simpleTypePredicate(type) {
		return c => c.SimpleType === type;
	}
}

class Slot {
	constructor(obj, Parent=null, Root=null) {
		this.obj = obj;
		this.Parent = Parent;
		if(!Root)
			Root = this;
		this.Root = Root;
	}

	get Name() {
		return this.obj.Name.Data;
	}

	get Active() {
		return this.obj.Active.Data;
	}

	get Components() {
		if(!this._Components)
			this._Components = this.obj.Components.Data.map(c => new Component(c, this));
		return this._Components;
	}

	get Children() {
		if(!this._Children)
			this._Children = this.obj.Children.map(c => new Slot(c, this, this.Root));
		return this._Children;
	}

	GetComponents(pred, res=[]) {
		if(_.isString(pred))
			pred = Component.typePredicate(pred);
		for(let c of this.Components)
			if(pred(c))
				res.push(c);
		return res;
	}

	GetComponentsInChildren(pred, res=[]) {
		if(_.isString(pred))
			pred = Component.typePredicate(pred);
		let next = [this];
		while(next.length) {
			let slot = next.shift();
			slot.GetComponents(pred, res);
			next.push(...slot.Children);
		}
		return res;
	}
}

class NeosObject {
	constructor(obj) {
		this.obj = obj;
	}

	get Assets() {
		if(!this._Assets)
			this._Assets = this.obj.Assets ? this.obj.Assets.map(c => new Component(c)) : [];
		return this._Assets;
	}

	get RootSlot() {
		if(!this._RootSlot)
			this._RootSlot = new Slot(this.obj.Object);
		return this._RootSlot;
	}

	GetComponentsInChildren(pred, res=[]) {
		if(_.isString(pred))
			pred = Component.typePredicate(pred);
		for(let a of this.Assets)
			if(pred(a))
				res.push(a);
		this.RootSlot.GetComponentsInChildren(pred, res);
		return res;
	}
}

class NeosWorld {
	constructor(obj) {
		this.obj = obj;
	}

	get RootSlot() {
		if(!this._RootSlot)
			this._RootSlot = new Slot(this.obj.Slots);
		return this._RootSlot;
	}
}

function asNeosObject(obj) {
	return new NeosObject(obj);
}

function asNeosWorld(obj) {
	return new NeosWorld(obj);
}

module.exports = {
	NeosObject, NeosWorld, Slot, Component,
	asNeosObject, asNeosWorld,
};
