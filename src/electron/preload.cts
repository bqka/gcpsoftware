import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  fetchWireData: (tableName: string) => ipcRenderer.invoke("fetch-wire", tableName),
  removeItem: (table: string, id: number) => ipcRenderer.invoke("remove-item", { table, id }),
  addItem: (tableName: string, validSequence: string, base64Image: string) => ipcRenderer.invoke("add-item", {tableName, validSequence, base64Image}),
  compareItem: (originalImage: string, imageToBeChecked: string, wireType: string) => ipcRenderer.invoke("compare-item", {originalImage, imageToBeChecked, wireType}),
  fetchWireImage: (selectedWireId: number, wireType: string) => ipcRenderer.invoke("fetch-wire-image", {selectedWireId, wireType})
});