import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  fetchWireData: (tableName: string) => ipcRenderer.invoke("fetch-wire", tableName),
  removeItem: (table: string, id: number) => ipcRenderer.invoke("remove-item", { table, id }),
addItem: (tableName: string, validSequence: string, base64Image: string) => ipcRenderer.invoke("add-item", {tableName, validSequence, base64Image}),
  compareItem: (originalImage: string[], imageToBeChecked: string[], wireType: string) => ipcRenderer.invoke("compare-item", {originalImage, imageToBeChecked, wireType}),
  fetchWireImage: (selectedWireId: number, wireType: string) => ipcRenderer.invoke("fetch-wire-image", {selectedWireId, wireType}),
  getSequence: (wireImages: string[], wireType: string) => ipcRenderer.invoke("get-sequence", {wireImages, wireType}),
  addResult: (wireType: string, wireId: number, result: boolean, details: string, tested_by: string, base64images: string[]) => ipcRenderer.invoke("add-result", {wireType, wireId, result, details, tested_by, base64images}),
  fetchResults: (wireType: string) => ipcRenderer.invoke("fetch-results", wireType),
  fetchResultDetails: (resultId: number) => ipcRenderer.invoke("fetch-result-details", resultId),
  fetchResultWireImage: (resultId: number) => ipcRenderer.invoke("fetch-result-wire-image", resultId)
});