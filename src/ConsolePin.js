import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";

const Console = ({ logs, showLogs }) => {
  const style = useMemo(() => consoleStyle({ showLogs }), [showLogs]);
  return (
    <div style={style}>
      {logs.map((log, index) => (
        <div key={index} style={logStyle(log)}>
          {log.args
            .map(item => {
              if (typeof item === "object") return JSON.stringify(item);
              return item;
            })
            .join(" ")}
        </div>
      ))}
    </div>
  );
};

const Pin = ({ autoHide = true, top, right, bottom, left }) => {
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  useEffect(() => {
    const listener = log => setLogs(logs => [...logs, log]);
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      index !== -1 && listeners.splice(index, 1);
    };
  }, []);
  const mode = useMemo(() => {
    if (logs.find(({ mode }) => mode === ERROR)) return ERROR;
    if (logs.find(({ mode }) => mode === WARN)) return WARN;
    if (logs.find(({ mode }) => mode === INFO)) return INFO;
  }, [logs]);
  const style = useMemo(
    () => pinStyle({ autoHide, top, right, bottom, left, mode }),
    [autoHide, top, right, bottom, left, mode]
  );
  return (
    <div style={style} onClick={() => setShowLogs(logs.length && !showLogs)}>
      {logs.length > 99 ? "+99" : logs.length}
      <Console logs={logs} showLogs={showLogs} />
    </div>
  );
};

const Portal = props => {
  const [root, setRoot] = useState();
  useEffect(() => {
    const root = document.createElement("div");
    root.setAttribute(
      "style",
      "font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Helvetica Neue',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'"
    );
    document.body.appendChild(root);
    setRoot(root);
  }, []);
  if (!root) return null;
  return createPortal(<Pin {...props} />, root);
};

export default (process.env.NODE_ENV !== "development" ? () => null : Portal);

// Styles

const pinStyle = ({ autoHide, top, right, bottom, left, mode }) => ({
  position: "fixed",
  ...(top && { top }),
  ...(right && { right }),
  ...(bottom && { bottom }),
  ...(left && { left }),
  width: 30,
  height: 30,
  lineHeight: "30px",
  textAlign: "center",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  borderRadius: "50%",
  border: "1px solid #d9d9d9",
  color: "rgba(0, 0, 0, 0.65)",
  background: "white",
  fontSize: 15,
  ...(!mode &&
    autoHide && {
      display: "none"
    }),
  ...(mode === INFO
    ? {
        border: "none",
        color: "white",
        background: "#1890ff"
      }
    : mode === WARN
    ? {
        border: "none",
        color: "white",
        background: "#faad14"
      }
    : mode === ERROR
    ? {
        border: "none",
        color: "white",
        background: "#ff4d4f"
      }
    : {})
});

const consoleStyle = ({ showLogs }) => ({
  position: "absolute",
  height: 300,
  width: 300,
  bottom: "calc(100% + 12px)",
  right: -5,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  borderRadius: 5,
  border: "1px solid #d9d9d9",
  overflowY: "auto",
  display: showLogs ? "block" : "none",
  textAlign: "left",
  background: "white",
  fontSize: 13
});

const logStyle = ({ mode }) => ({
  padding: "2px 10px",
  color: "rgba(0, 0, 0, 0.65)",
  borderBottom: "1px solid #d9d9d9",
  ...(mode === INFO
    ? {
        border: "none",
        color: "white",
        background: "#1890ff"
      }
    : mode === WARN
    ? {
        border: "none",
        color: "white",
        background: "#faad14"
      }
    : mode === ERROR
    ? {
        border: "none",
        color: "white",
        background: "#ff4d4f"
      }
    : {})
});

// Other Stuff

const INFO = 1;
const WARN = 2;
const ERROR = 3;

const listeners = [];

const dispatchLog = log => {
  for (const listener of listeners) listener(log);
};

const saveLog = console.log.bind(console);
console.log = (...args) => {
  saveLog(...args);
  dispatchLog({ mode: INFO, args });
};

const saveInfo = console.info.bind(console);
console.info = (...args) => {
  saveInfo(...args);
  dispatchLog({ mode: INFO, args });
};

const saveWarn = console.warn.bind(console);
console.warn = (...args) => {
  saveWarn(...args);
  dispatchLog({ mode: WARN, args });
};

const saveError = console.error.bind(console);
console.error = (...args) => {
  saveError(...args);
  dispatchLog({ mode: ERROR, args });
};
