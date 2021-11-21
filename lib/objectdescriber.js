const _ = require("underscore");

const { asNeosObject, asNeosWorld, Component } = require("./datamodel"),
	{ startsWith } = require("./utils"),
	{ stripAtSign } = require("./cloudx");

// mainCategory: tooltip, material, audio, facet, texture, text, binary, model, world_orb, other

function extractTagValue(tags, prefix) {
	for(let t of tags) {
		if(startsWith(t, prefix))
			return t.slice(prefix.length);
	}
	return null;
}

function describeRecord(rec) {
	let res = {
		objectType: null,
	};

	let tags = new Map;
	for(let t of rec.tags)
		tags.set(t, t);

	if(tags.has("common_avatar"))
		res.objectType = "common_avatar";
	else if(tags.has("common_tooltip")) // TODO: common_tooltip catches many gadgets, maybe only check for default tooltips
		res.objectType = "common_tooltip";
	else if(tags.has("virtual_keyboard"))
		res.objectType = "virtual_keyboard";
	else if(tags.has("facet"))
		res.objectType = "facet";
	/*else if(tags.has("audio_clip")) {
		res.objectType = "audio_clip";
		res.clipAsset = extractTagValue(rec.tags, "clip_asset:");
	} else if(tags.has("video_clip")) {
		res.objectType = "video_clip";
		res.clipAsset = extractTagValue(rec.tags, "clip_asset:");
	}*/ else if(tags.has("world_orb"))
		res.objectType = "world_orb";

	let worldUri = extractTagValue(rec.tags, "world_url:");
	if(worldUri)
		res.worldUri = worldUri;

	return res;
}

function getMaterialProxyInMaterialTip(comp) {
	let orbSlot = _.find(comp.Slot.Children, s => s.Name === "OrbSlot");
	if(!orbSlot)
		return null;
	return _.first(orbSlot.GetComponentsInChildren(c => c.SimpleType === "AssetProxy<Material>"));
}

function getReferencedAsset(assetProxy, obj) {
	let assetId = assetProxy.GetFieldData("AssetReference");
	if(!assetId)
		return null;
	return _.first(obj.GetComponentsInChildren(c => c.ID === assetId));
}

function describeAudioClip(comp, obj) {
	let res = {};

	if(comp.Slot)
		res.audioName = comp.Slot.Name;

	if(comp.SimpleType === "StaticAudioClipProvider") {
		let uri = comp.GetFieldData("URL");
		if(uri)
			res.audioUri = stripAtSign(uri);
	}

	return res;
}

function describeTexture(comp, obj) {
	let res = {};

	if(comp.Slot)
		res.textureName = comp.Slot.Name;

	if(comp.SimpleType === "StaticTexture2D") {
		let uri = comp.GetFieldData("URL");
		if(uri)
			res.textureUri = stripAtSign(uri);
	} else if(comp.SimpleType === "VideoTextureProvider") {
		let uri = comp.GetFieldData("URL");
		if(uri)
			res.textureUri = stripAtSign(uri);
	}

	return res;
}

function describeMaterial(comp, obj) {
	let res = {
		materialType: comp.SimpleType,
	};

	if(comp.Slot)
		res.materialName = comp.Slot.Name;

	for(let fieldName of ["Texture","AlbedoTexture"]) {
		let textureId = comp.GetFieldData(fieldName), texture;
		if(textureId)
			texture = _.first(obj.GetComponentsInChildren(c => c.ID === textureId));
		if(texture) {
			_.extend(res, describeTexture(texture, obj));
			break;
		}
	}

	return res;
}

function describeObject(obj) {
	obj = asNeosObject(obj);
	let res = {
		objectType: "other"
	};

	let slot = obj.RootSlot;
	if(slot.GetComponents(c => c.SimpleType === "InventoryItem").length)
		slot = slot.Children[0];

	while(slot.Components.length < 2 && slot.Children.length)
		slot = slot.Children[0];

	for(let c of slot.Components) {
		if(c.SimpleType === "MaterialTip") {
			let proxy = getMaterialProxyInMaterialTip(c, obj), material;
			if(proxy) {
				res.materialName = proxy.Slot.Name;
				material = getReferencedAsset(proxy, obj);
			}
			if(material) {
				res.objectType = "material";
				_.extend(res, describeMaterial(material, obj));
			} else
				res.objectType = "common_tooltip";
			break;
		} else if(c.HasField("TipReference"))
			res.objectType = "common_tooltip";
		else if(c.SimpleType === "AssetProxy<Material>") {
			res.objectType = "material";
			res.materialName = slot.Name;
			let material = getReferencedAsset(c, obj);
			if(material)
				_.extend(res, describeMaterial(material, obj));
			break;
		} else if(c.SimpleType === "AssetProxy<AudioClip>") {
			res.objectType = "audio";
			res.audioName = slot.Name;
			let audio = getReferencedAsset(c, obj);
			if(audio)
				_.extend(res, describeAudioClip(audio, obj));
			break;
		} else if(c.SimpleType === "AudioExportable") {
			res.objectType = "audio";
			res.audioName = slot.Name;
			let audioId = c.GetFieldData("Video"), audio;
			if(audioId)
				audio = _.first(obj.GetComponentsInChildren(c => c.ID === audioId));
			if(audio)
				_.extend(res, describeAudioClip(audio, obj));
			break;
		} else if(c.SimpleType === "AssetProxy<Texture2D>") {
			res.objectType = "texture";
			res.textureName = slot.Name;
			let texture = getReferencedAsset(c, obj);
			if(texture)
				_.extend(res, describeTexture(texture, obj));
			break;
		} else if(c.SimpleType === "TextureExportable") {
			res.objectType = "texture";
			res.textureName = slot.Name;
			let textureId = c.GetFieldData("Texture"), texture;
			if(textureId)
				texture = _.first(obj.GetComponentsInChildren(c => c.ID === textureId));
			if(texture)
				_.extend(res, describeTexture(texture, obj));
			break;
		} else if(c.SimpleType === "AssetProxy<VideoTexture>") {
			res.objectType = "video";
			res.textureName = slot.Name;
			let video = getReferencedAsset(c, obj);
			if(video)
				_.extend(res, describeTexture(video, obj));
			break;
		} else if(c.SimpleType === "VideoExportable") {
			res.objectType = "video";
			res.textureName = slot.Name;
			let textureId = c.GetFieldData("Video"), texture;
			if(textureId)
				texture = _.first(obj.GetComponentsInChildren(c => c.ID === textureId));
			if(texture)
				_.extend(res, describeTexture(texture, obj));
			break;
		} else if(c.SimpleType === "Facet") {
			res.objectType = "facet";
			break;
		} else if(c.SimpleType === "ValueFieldProxy<String>")
			res.objectType = "text";
		else if(c.SimpleType === "TextExportable") {
			res.objectType = "text";
			break;
		} else if(c.SimpleType === "ModelExportable")
			res.objectType = "model";
		else if(c.SimpleType === "BinaryExportable")
			res.objectType = "binary";
		else if(c.SimpleType === "AvatarRoot") {
			res.objectType = "avatar";
			break;
		} else if(c.SimpleType === "WorldOrb") {
			res.objectType = "world_orb";
			break;
		} else if(c.SimpleType === "Canvas")
			res.objectType = "uix";
	}

	return res;
}

function describeWorld(obj) {
	obj = asNeosWorld(obj);
	let res = {
		inventoryLinkUris: []
	};

	let inventoryLinks = obj.RootSlot.GetComponentsInChildren(c => c.SimpleType === "InventoryLink");
	for(let c of inventoryLinks) {
		let targetUri = c.GetFieldData("Target");
		if(targetUri)
			res.inventoryLinkUris.push(stripAtSign(targetUri));
	}

	return res;
}

module.exports = { describeObject, describeRecord, describeWorld, extractTagValue };
