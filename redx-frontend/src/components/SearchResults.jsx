import { CopyOutlined, FolderOutlined, FrownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Drawer, Empty, Pagination, Row, Tooltip } from "antd";
import classNames from "classnames";
import { useCallback, useState } from "react";
import { typeOptions } from "../lib/constants";
import { resolveThumbnailUri, stripRichText, useCopyHelper } from "../lib/utils";
import "./SearchResults.css";

function RecordThumbnail({ thumbnailUri, name }) {
	let [error, setError] = useState(false);

	return error ? <FrownOutlined className="Record-icon" style={{ fontSize: 32 }} /> : (
		<div className="Record-thumbnail">
			<img src={resolveThumbnailUri(thumbnailUri)} alt={stripRichText(name)} onError={e => setError(true)} />
		</div>
	);
}

function Record({ record, onShowRecordInfoClick }) {
	let recordOrAssetUri = record.assetUri || `neosrec:///${record.ownerId}/${record.id}`;

	let [copyHelper, copy] = useCopyHelper(recordOrAssetUri);

	let className = ["Record", "--record-type-" + record.recordType, "--type-" + record.type].join(" ");

	return (<div className={className} title={stripRichText(record.name)}>
		{record.thumbnailUri && <RecordThumbnail name={record.name} thumbnailUri={record.thumbnailUri} />}
		{record.type === "directory" && <FolderOutlined className="Record-icon" style={{ fontSize: 32 }} />}
		<div className="Record-name">{stripRichText(record.name)}</div>
		<div className="Record-actions --right">
			<Tooltip title="Copy assetUri"><button type="button" onClick={e => copy()}><CopyOutlined /></button></Tooltip>
		</div>
		<div className="Record-actions --left">
			<Tooltip title="Record Info"><button type="button" onClick={onShowRecordInfoClick}><InfoCircleOutlined /></button></Tooltip>
		</div>
		{copyHelper}
	</div>);
}

function RecordInfoItem({ title, content, className }) {
	return (
		<div className={classNames("RecordInfoItem", className)}>
			<div className="RecordInfoItem-title">{title}:</div>
			<div className="RecordInfoItem-content">{content}</div>
		</div>
	);
}

function RecordInfo({ record }) {
	let [copyHelper, copy] = useCopyHelper();

	let copyParentUri = useCallback((depth) => {
		copy(record.spawnParentUri + "&depth=" + depth);
	}, [copy, record.spawnParentUri]);

	let pathItems = record.path.split("\\").slice(1).map((name, i) => (
		<Button className="RecordInfo-pathItem" key={i} size="small" onClick={e => copyParentUri(i+1)}>{stripRichText(name)}</Button>
	));

	let recordTypeName = record.type;
	for(let o of typeOptions)
		if(o.value === record.type)
			recordTypeName = o.label;

	return (
		<div className="RecordInfo">
			<RecordInfoItem title="Name" content={stripRichText(record.name)} />
			<RecordInfoItem title="Owner" content={stripRichText(record.ownerName)} />
			<RecordInfoItem title="Category" content={recordTypeName} />
			<RecordInfoItem className="--path" title={
				<>
					Path <span>(click to copy spawnUri)</span>
				</>
			} content={pathItems} />
			{record.thumbnailUri && <RecordInfoItem title="Thumbnail" content={
				<RecordThumbnail name={record.name} thumbnailUri={record.thumbnailUri} />
			} />}
			{copyHelper}
		</div>
	);
}

// const pageSizeOptions = [ 10, 50, 100 ];

function SearchResults({ res, pagination: { from, size }, onPaginationChange }) {
	let { hits, total } = res;
	let [infoRecord, setInfoRecord] = useState(null);

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
					<Record record={hit} key={hit.id} onShowRecordInfoClick={() => setInfoRecord(hit)} />
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

			<Drawer title="Record Info" placement="right" onClose={e => setInfoRecord(null)} visible={infoRecord !== null}>
				{infoRecord && <RecordInfo record={infoRecord} />}
			</Drawer>
		</div>
	);
}

export default SearchResults;
