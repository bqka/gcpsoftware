const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics : (callback: (statistics: any) => void) => {
        //@ts-ignore
        ipcRenderer.on("statistics", (_event, stats) => {
            callback(stats);
        })
    },
    getStaticData: () => ipcRenderer.invoke('getStaticData')
})