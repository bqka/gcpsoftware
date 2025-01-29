type Statistics = {
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
};

type StaticData = {
  totalStorage: number;
  cpuModel: string;
  totalMemoryGB: number;
};

type EventPayloadMapping = {
  statistics: Statistics;
  getStatistics: StaticData;
  getItems: Array<{ id: number; date: string; name: string; image: string }>;
};

type Item = {
  name: string;
  image: string;
};

interface Window {
  electron: {
    subscribeStatistics: (callback: (statistics: Statistics) => void) => void;
    getStaticData: () => Promise<StaticData>;
  };
  electronAPI: {
    getItems: () => Promise<
      Array<{ id: number; date: string; name: string; image: string }>
    >;
    addItem: (item: Item) => Promise<void>;
  };
}
