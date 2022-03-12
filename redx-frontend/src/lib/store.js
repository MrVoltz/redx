import { useReducer } from "react";
import { typeOptions } from "./constants";

const initialState = {
	q: "",
	types: typeOptions.filter(o => o.default === undefined || o.default).map(o => o.value),
	from: 0,
	size: 50,
	imageEnabled: false,
	imageWeight: 0.5
};

function reducer(state, { type, payload }) {
	switch (type) {
		case "search":
			return { ...state, from: 0, q: payload };
		case "paginate":
			return { ...state, from: payload.from, size: payload.size };
		case "setTypes":
			return { ...state, types: payload };
		case "toggleType":
			let newTypes = state.types.filter(t => t !== payload.type);
			if (payload.checked)
				newTypes.push(payload.type);
			return { ...state, types: newTypes };
		case "setImageEnabled":
			return { ...state, imageEnabled: payload };
		case "setImageWeight":
			return { ...state, imageWeight: payload };
		default:
			throw new Error("Unknown action: " + type);
	}
}

export default function useStore() {
	return useReducer(reducer, initialState);
};
