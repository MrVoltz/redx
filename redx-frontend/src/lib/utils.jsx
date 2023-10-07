import { message } from "antd";
import { useRef } from "react"

export function useConstant(fn) {
  const ref = useRef();

  if(!ref.current)
    ref.current = { v: fn() };

  return ref.current.v;
}

/** @param {String} uri */
export function resolveThumbnailUri(uri) {
  console.log("resolveThumbnailUri", uri);
  const m = uri.match(/^neosdb:\/\/([^.]+)\.(.+)$/);
  if(m)
    return "https://assets.neos.com/assets" + m[1];
  const m2 = uri.match(/^resdb:\/\/([^.]+)\.(.+)$/);
  if(m2)
    return "https://assets.resonite.com" + m2[1];
  return uri;
}

export function stripRichText(str) {
  return str.replace(/<([^>]*)>/g, "").trim();
}

export function useCopyHelper(value) {
  let inputRef = useRef(null);

  return [
    <input tabIndex={-1} readOnly={true} className="SearchResults-copyInput" ref={inputRef} value={value} />,
    (valueOverride) => {
      if(valueOverride !== undefined)
        inputRef.current.value = valueOverride;
      inputRef.current.select();
      document.execCommand("copy");
      message.success(
        <>
          Copied!<br />
          <small>{inputRef.current.value}</small>
        </>
      );
    }
  ];
}
