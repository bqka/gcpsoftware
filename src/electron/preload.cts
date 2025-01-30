const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics : (callback) => {
        ipcOn("statistics", (stats) => callback(stats))
    },
    getStaticData: () => ipcInvoke('getStatistics')
} satisfies Window["electron"])


contextBridge.exposeInMainWorld('electronAPI', {
  getItems: () => ipcRenderer.invoke('getItems'),
  addItem: (item: { name: string, image: string }) => ipcRenderer.invoke('addItem', item),
  deleteItem: (key: number) => ipcRenderer.invoke('deleteItem', key)
});


function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void
) {
    ipcRenderer.on(key, (_: Electron.IpcRendererEvent, payload: EventPayloadMapping[Key]) => callback(payload))
}

function ipcInvoke<Key extends keyof EventPayloadMapping>(
    key: Key
) : Promise<EventPayloadMapping[Key]> {
    return ipcRenderer.invoke(key);
}