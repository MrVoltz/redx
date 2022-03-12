import { Checkbox, Col, Divider, Input, InputNumber, PageHeader, Pagination, Row, Slider, Space, Spin } from 'antd';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import axios from 'axios';
import React, { useCallback, useReducer } from 'react';
import { useAsync } from 'react-async-hook';
import './App.css';
import SearchResults from './components/SearchResults';
import useConstant from './utils';

const typeOptions = [
	{ label: "Directory", value: "directory", spaceAfter: true, default: false },

	{ label: "Avatar", value: "common_avatar" },
	{ label: "Model", value: "model" },
	{ label: "Tooltip", value: "common_tooltip" },
	{ label: "Facet", value: "facet" },
	{ label: "VirtualKeyboard", value: "virtual_keyboard" },
	{ label: "OtherUIX", value: "uix" },
	{ label: "WorldOrb", value: "world_orb" },
	{ label: "Uncategorized", value: "other", spaceAfter: true },

	{ label: "Material", value: "material" },
	{ label: "Texture", value: "texture" },
	{ label: "Video", value: "video" },
	{ label: "Audio", value: "audio" },
	{ label: "Text", value: "text" },
	{ label: "Binary", value: "binary", tooltip: "Executables, archives..." },
];

const version = "0.0.1";

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
	}
}

function AppSidebar({ state, dispatch }) {
	let allTypesActive = typeOptions.length === state.types.length,
		noTypesActive = state.types.length === 0;

	return (
		<>
			<Space direction="vertical">
				<Checkbox
					indeterminate={!allTypesActive && !noTypesActive}
					checked={allTypesActive}
					style={{ marginBottom: "10px" }}
					onChange={e => dispatch({ type: "setTypes", payload: e.target.checked ? typeOptions.map(o => o.value) : [] })}
				>Select All Categories</Checkbox>
				{typeOptions.map(o => (
					<Checkbox
						key={o.value}
						name="type"
						checked={state.types.includes(o.value)}
						style={o.spaceAfter ? { marginBottom: "10px" } : {}}
						onChange={e => dispatch({ type: "toggleType", payload: { type: o.value, checked: e.target.checked } })}
					>{o.label}</Checkbox>
				))}
			</Space>
			<Divider />
			<Space direction="vertical">
				<Checkbox
					checked={state.imageEnabled}
					onChange={e => dispatch({ type: "setImageEnabled", payload: e.target.checked })}
				>Search Thumbnails</Checkbox>
				<Row align='middle' gutter={5}>
					<Col flex={1}>
						<Slider
							min={0.05}
							max={1}
							step={0.05}
							value={state.imageWeight}
							onChange={v => v && dispatch({ type: "setImageWeight", payload: v })}
							disabled={!state.imageEnabled}
						/>
					</Col>
					<Col>
						<InputNumber
							style={{ width: "4.5em" }}
							size='small'
							min={0.05}
							max={1}
							value={state.imageWeight}
							onChange={v => dispatch({ type: "setImageWeight", payload: v })}
							disabled={!state.imageEnabled}
						/>
					</Col>
				</Row>
				<div class="AppSidebar-powered-by">(uses AI service by <a target="_blank" href="https://github.com/guillefix/">guillefix</a>)</div>
			</Space>
		</>
	);
}

function fetchRecords(q, types, from, size, imageWeight) {
	if (size === 0)
		return Promise.resolve({ total: 0, hits: [] });

	let params = new URLSearchParams;
	params.append("q", q);
	for (let type of types)
		params.append("type", type);
	params.append("from", from);
	params.append("size", size);
	params.append("image_weight", imageWeight)

	return axios("/search.json", {
		params
	}).then(({ data }) => data);
}

function App() {
	let [state, dispatch] = useReducer(reducer, initialState);

	console.log(state);

	const debouncedFetchRecords = useConstant(() => AwesomeDebouncePromise(fetchRecords, 500));
	const asyncHits = useAsync(debouncedFetchRecords, [state.q, state.types, state.from, state.size, state.imageEnabled ? state.imageWeight : 0]);

	return (
		<div className="App">
			<div className="App-main">
				<div className="App-sidebar">
					<h1 style={{ fontSize: "1.8em" }}>RedX <small>v{version}</small></h1>
					<AppSidebar state={state} dispatch={dispatch} />
				</div>
				<div className="App-content">
					<div className="App-search">
						<Input.Search size="large" value={state.q} onChange={e => dispatch({ type: "search", payload: e.target.value })} />
					</div>

					{asyncHits.loading && <Spin />}
					{asyncHits.result && <SearchResults
						res={asyncHits.result}
						pagination={{ from: state.from, size: state.size }}
						onPaginationChange={payload => dispatch({ type: "paginate", payload })}
					/>}
				</div>
			</div>
		</div>
	);
}

export default App;
