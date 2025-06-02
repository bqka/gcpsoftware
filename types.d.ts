type SingleWire = {
  id: number;
  sequence: string;
  date: string;
}

interface Window {
    electron: {
        fetchWireData: (tableName: string) => Promise<SingleWire[]>;
        removeItem: (table: string, id: number) => Promise<void>;
        addItem: (tableName: string, validSequence: string, base64Image: string) => Promise<void>;
        compareItem: (originalImage:string, imageToBeChecked: string, wireType: string) => Promise<string>;
        fetchWireImage: (selectedWireId: number, wireType: string) => Promise<string | null>;
    }
}