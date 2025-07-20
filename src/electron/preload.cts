import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  fetchData: (tableName: string, wireType: string) => ipcRenderer.invoke("fetch-data", {tableName, wireType}),
  fetchRow: (tableName: string, id: number) => ipcRenderer.invoke("fetch-row", {tableName, id}),
  fetchImages: (tableName: string, wireType: string, selectedId: number) => ipcRenderer.invoke("fetch-image", {tableName, wireType, selectedId}),

  removeItem: (table: string, id: number) => ipcRenderer.invoke("remove-item", { table, id }),

  addWire: (wireType: string, wireName: string, sequence: string, base64Images: string[]) => ipcRenderer.invoke("add-wire", {wireType, wireName, sequence, base64Images}),
  addResult: (wireType: string, wireId: number, wireName: string, result: boolean, details: string, tested_by: string, base64images: string[]) => ipcRenderer.invoke("add-result", {wireType, wireId, wireName, result, details, tested_by, base64images}),
  addMismatch: (wireType: string, wireName: string, sequence:string, base64images: string[]) => ipcRenderer.invoke("add-mismatch", {wireType, wireName, sequence, base64images}),

  compareItem: (wireCount: number[], originalSequence: string, imageToBeChecked: string[], wireType: string) => ipcRenderer.invoke("compare-item", {wireCount, originalSequence, imageToBeChecked, wireType}),
  getSequence: (wireImages: string[], wireType: string) => ipcRenderer.invoke("get-sequence", {wireImages, wireType}),
});