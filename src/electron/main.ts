import { app, BrowserWindow, ipcMain } from "electron";
import path, { format } from "path";
import { isDev } from "./util.js";
import db from "./db.js";
import { getPreloadPath } from "./pathResolver.js";
import fs from "fs";
import { spawn } from "child_process";

async function addItem(
  tableName: string,
  validSequence: string,
  base64Image: string
) {
  const imageDir = path.join(app.getAppPath(), "images", tableName);
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

  await db(tableName).insert({
    sequence: validSequence,
    path: imagePath,
  });
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
});

ipcMain.handle(
  "fetch-wire",
  async (_event, tableName: string): Promise<SingleWire[]> => {
    try {
      const rows = await db(tableName).select("*");
      // const formattedData: SingleWire[] = rows.map((row: any) => ({
      //   id: row.id,
      //   sequence: row.sequence,
      //   date: row.date,
      // }));

      // console.log(rows)
      return rows;
    } catch (error) {
      console.error("Database Error:", error);
      return [];
    }
  }
);

ipcMain.handle("fetch-wire-image", async(_event, {selectedWireId , wireType}): Promise<string | null> => {
  try{
    const result = await db(wireType).where({ id: selectedWireId }).select("path").first();

     if (!result?.path || !fs.existsSync(result.path)) {
      console.warn("Image path not found or file does not exist.");
      return null;
    }
    const imageBuffer = fs.readFileSync(result.path);
    const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;
    return base64Image;
  } catch(error){
    console.error("Error:", error);
    return null;
  }
})

ipcMain.handle(
  "add-item",
  async (event, { tableName, validSequence, base64Image }) => {
    try {
      await addItem(tableName, validSequence, base64Image);
      console.log(`Inserted new item`);
    } catch (error) {
      console.error("Error inserting item:", error);
    }
  }
);

ipcMain.handle("remove-item", async (_, { table, id }) => {
  try {
    const result = await db(table).where({ id }).del();

    if (result) {
      console.log("Item removed.");
    } else {
      console.log("Error removing item.");
    }
  } catch (error) {
    console.error("Error removing item.");
  }
});

ipcMain.handle("compare-item", async (_event, {originalImage, imageToBeChecked, wireType}) => {
  return new Promise((resolve, reject) => {
    const pythonPath = "C:\\Users\\Acer\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
    const python = spawn(pythonPath, ["backend/compare.py"]);

    let output = "";
    let error = "";

    // Collect stdout
    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Collect stderr
    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    // On finish
    python.on("close", (code) => {
      if (code === 0) {
        resolve(output.trim()); // Return Python result
      } else {
        reject(new Error(`Python error: ${error}`));
      }
    });

    // Send data to Python via stdin
    const payload = JSON.stringify({
      original: originalImage,
      input: imageToBeChecked,
      wireType: wireType
    });

    python.stdin.write(payload);
    python.stdin.end();
  });
});