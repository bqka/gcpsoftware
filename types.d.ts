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

type BaseItem = {
  id: number;
  name: string;
  date: string;
  imagePath: string;
};

interface Window {
  electron: {
    subscribeStatistics: (callback: (statistics: Statistics) => void) => void;
    getStaticData: () => Promise<StaticData>;
  };
  electronAPI: {
    getItems: () => Promise<
      Array<BaseItem>
    >;
    addItem: (item: { name: string, image: string }) => Promise<void>;
    deleteItem: (key: number) => Promise<void>;
  };
}
