import { Col, Empty, Pagination, Row } from "antd";
import { FolderOutlined, FrownOutlined } from '@ant-design/icons';
import "./SearchResults.css";
import { useState } from "react";

/** @param {String} uri */
function resolveThumbnailUri(uri) {
	let m;
	if (m = uri.match(/^neosdb:\/\/([^.]+)\.(.+)$/))
		return "https://assets.neos.com/assets" + m[1];
	return uri;
}

function stripRichText(str) {
	return str.replace(/<([^>]*)>/g, "").trim();
}

function RecordThumbnail({ thumbnailUri }) {
	let [error, setError] = useState(false);

	return error ? <FrownOutlined className="Record-icon" style={{ fontSize: 32 }}/> : (
		<div className="Record-thumbnail">
			<img src={resolveThumbnailUri(thumbnailUri)} onError={e => setError(true)}/>
		</div>
	);
}

function Record({ record }) {
	let className = ["Record", "--record-type-" + record.recordType, "--type-" + record.type].join(" ");

	return (<div className={className} title={stripRichText(record.name)}>
		{record.thumbnailUri && <RecordThumbnail thumbnailUri={record.thumbnailUri}/>}
		{record.type === "directory" && <FolderOutlined className="Record-icon" style={{ fontSize: 32 }} />}
		<div className="Record-name">{stripRichText(record.name)}</div>
	</div>);
}

// const pageSizeOptions = [ 10, 50, 100 ];

function SearchResults({ res, pagination: { from, size }, onPaginationChange }) {
	let { hits, total } = res;

	if (!total)
		return (
			<div className="SearchResults --empty">
				<Empty />
			</div>
		);

	return (
		<div className="SearchResults">
			<div className="SearchResults-hits">
				{hits.map(hit => (
					<Record record={hit} key={hit.id} />
				))}
			</div>

			<Row justify="center">
				<Pagination
					total={total}
					pageSize={size}
					// pageSizeOptions={pageSizeOptions}
					current={Math.floor(from / size) + 1}
					onChange={(page, pageSize) => onPaginationChange({ from: (page - 1) * pageSize, size: pageSize })}
				/>
			</Row>
		</div>
	);
}

export default SearchResults;
