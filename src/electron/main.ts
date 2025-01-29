import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { ipcMainHandle, isDev } from "./util.js";
import { getStaticData, pollResources } from "./resourceManager.js";
import { getPreloadPath } from "./pathResolver.js";
import Database from "./database.js";
import fs from "fs";

const db = new Database(path.join(app.getAppPath(), "./database.db"));

async function addBaseItem(itemName: string, base64Image: string) {
  const imageDir = path.join(app.getAppPath(), "images/baseImages");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }
  const fileName = `${Date.now()}.png`;
  const imagePath = path.join(imageDir, fileName);

  // Remove base64 metadata (data:image/png;base64,)
  const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");

  fs.writeFileSync(imagePath, Buffer.from(base64Data, "base64"));

  const date = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(Date.now());

  await db.run(
    `
    INSERT INTO baseitems (name, imagePath, date)
    VALUES (?, ?, ?)`,
    [itemName, imagePath, date]
  );
}

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  pollResources(mainWindow);

  ipcMainHandle("getStatistics", () => {
    return getStaticData();
  });

  ipcMain.handle("getItems", async () => {
    try {
      const rows = await db.query(
        "SELECT id, date, name, imagePath FROM baseitems"
      );

      const formattedItems = rows.map((row: any) => ({
        id: row.id,
        date: row.date,
        name: row.name,
        image: row.image,
      }));

      return formattedItems;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  });

  ipcMain.handle("addItem", async (event, item: {name: string, image: string}) => {
    try {
      const { name, image } = item;
      await addBaseItem(name, image);
      console.log(`Inserted new item: ${name}`);
    } catch (error) {
      console.error("Error inserting item:", error);
    }
  });

});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  db.close();
});
