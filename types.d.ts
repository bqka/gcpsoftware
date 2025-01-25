type Statistics = {
    cpuUsage: number,
    ramUsage: number,
    storageUsage: number,
};

type StaticData = {
    totalStorage: number,
    cpuModel: string,
    totalMemoryGB: number
};

type EventPayloadMapping = {
    statistics: Statistics,
    getStatistics: StaticData,
}

interface Window {
    electron: {
        subscribeStatistics: (callback: (statistics: Statistics) => void) => void,
        getStaticData: () => Promise<StaticData>
    };
}