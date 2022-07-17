const { app, dialog, contextBridge, ipcRenderer } = require("electron");

const WINDOW_API = {
  getRequires: () => ipcRenderer.invoke("getRequires"),
};

contextBridge.exposeInMainWorld("api", WINDOW_API);
