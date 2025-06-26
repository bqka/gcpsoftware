import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { db, initializeDatabase } from "./db.js";
import { getPreloadPath } from "./pathResolver.js";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addItem(
  wireType: string,
  wireName: string,
  sequence: string,
  base64Images: string[]
) {
  const imageDir = path.join(app.getPath("userData"), "images", wireType);
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  if (wireType === "singlewire" && base64Images.length !== 1) {
    throw new Error(`Single wire must have exactly one image. It has ${base64Images.length}`);
  }

  if (wireType === "doublewire" && base64Images.length !== 2) {
    throw new Error("Double wire must have exactly two images.");
  }

  const imagePaths = base64Images.map((img, idx) => {
    const filename = `${Date.now()}_${idx}.png`;
    const filepath = path.join(imageDir, filename);
    const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
    return filepath;
  });

  let result;
  result = await db("wires").insert({
    wire_type: wireType,
    wire_name: wireName,
    image_front: imagePaths[0],
    image_back: imagePaths[1] ?? null,
    sequence: sequence,
  });

  console.log(result);
}

async function createMainWindow() {
  await initializeDatabase();

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
}

app.on("ready", () => {
  createMainWindow();
});

ipcMain.handle(
  "fetch-data",
  async (_event, { tableName, wireType }): Promise<any[]> => {
    try {
      const rows = await db(tableName)
        .where({ wire_type: wireType })
        .select("*");
      return rows;
    } catch (error) {
      console.error("Database Error:", error);
      return [];
    }
  }
);

//fetch image
ipcMain.handle(
  "fetch-image",
  async (_event, { tableName, wireType, selectedId }): Promise<string[]> => {
    try {
      console.log(
        `Fetching wire image from ${tableName} with id = ${selectedId} and wireType = ${wireType}`
      );
      const result = await db(tableName)
        .where({ id: selectedId, wire_type: wireType })
        .select("image_front", "image_back")
        .first();

      const images: string[] = [];

      if (result?.image_front && fs.existsSync(result.image_front)) {
        const frontBuffer = fs.readFileSync(result.image_front);
        images.push(`data:image/png;base64,${frontBuffer.toString("base64")}`);
      } else {
        console.warn("Front image missing or does not exist.");
      }

      if (result?.image_back && fs.existsSync(result.image_back)) {
        const backBuffer = fs.readFileSync(result.image_back);
        images.push(`data:image/png;base64,${backBuffer.toString("base64")}`);
      } else {
        if (wireType === "doublewire")
          console.warn("Back image missing or does not exist.");
      }

      return images;
    } catch (error) {
      console.error("Error fetching wire images:", error);
      return [];
    }
  }
);

//add-wire
ipcMain.handle(
  "add-wire",
  async (_event, { wireType, wireName, sequence, base64Images }) => {
    try {
      await addItem(wireType, wireName, sequence, base64Images);
      console.log(`Inserted new item`);
    } catch (error) {
      console.error("Error inserting item:", error);
    }
  }
);

ipcMain.handle("remove-item", async (_, { table, id }) => {
  try {
    const record = await db(table).where({ id }).first();
    if (!record) {
      console.log("Item not found.");
      return;
    }

    const imagePaths: string[] = [];

    if (record.image_front) imagePaths.push(record.image_front);
    if (record.image_back) imagePaths.push(record.image_back);

    for (const filePath of imagePaths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn(`Failed to delete image at ${filePath}:`, err);
      }
    }

    const result = await db(table).where({ id }).del();

    if (result) {
      console.log("Item and image(s) removed.");
    } else {
      console.log("Error removing item from database.");
    }
  } catch (error) {
    console.error("Error in remove-item handler:", error);
  }
});

//compare item
ipcMain.handle(
  "compare-item",
  async (_event, { wireCount, originalSequence, imageToBeChecked, wireType }) => {
    return new Promise((resolve, reject) => {
      // const pythonPath =
      //   "C:\\Users\\Acer\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
      // const python = spawn(pythonPath, ["backend/compare.py"]);

      const exePath = app.isPackaged
        ? path.join(process.resourcesPath, "python-bin", "compare.exe")
        : path.join(__dirname, "../python-bin/compare.exe");
      const python = spawn(exePath);

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
          const result = JSON.parse(output);
          resolve(result); // Return Python result
        } else {
          reject(new Error(`Python error: ${error}`));
        }
      });

      // Send data to Python via stdin
      const payload = JSON.stringify({
        wire_count: wireCount,
        sequence: originalSequence,
        input: imageToBeChecked,
        wireType: wireType,
      });

      python.stdin.write(payload);
      python.stdin.end();
    });
  }
);

ipcMain.handle("get-sequence", async (_event, { wireImages, wireType }) => {
  return new Promise((resolve, reject) => {
    // const pythonPath =
    //   "C:\\Users\\Acer\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
    // const python = spawn(pythonPath, ["backend/getsequence.py"]);

    const exePath = app.isPackaged
      ? path.join(process.resourcesPath, "python-bin", "getsequence.exe")
      : path.join(__dirname, "../python-bin/getsequence.exe");
    const python = spawn(exePath);

    let output = "";
    let error = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      error += data.toString();
    });

    python.on("close", (code) => {
      if (code === 0) {
        const result = JSON.parse(output);
        resolve(result); // Return Python result
      } else {
        reject(new Error(`Python error: ${error}`));
      }
    });

    const payload = JSON.stringify({
      input: wireImages,
      wireType: wireType,
    });

    python.stdin.write(payload);
    python.stdin.end();
  });
});

//add result
ipcMain.handle(
  "add-result",
  async (
    _event,
    { wireType, wireId, wireName, result, details, tested_by, base64images }
  ) => {
    try {
      console.log("ADDING RESULT");
      const imageDir = path.join(app.getPath("userData"), "results", wireType);
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      const imagePaths = base64images.map((img: string, idx: number) => {
        const filename = `${Date.now()}_${idx}.png`;
        const filepath = path.join(imageDir, filename);
        const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
        return filepath;
      });

      await db("results").insert({
        wire_type: wireType,
        wire_id: wireId,
        wire_name: wireName,
        result,
        details,
        tested_by,
        image_front: imagePaths[0],
        image_back: imagePaths[1] ?? null,
      });
    } catch (error) {
      console.error("Error adding result:", error);
      throw new Error("Failed to add result");
    }
  }
);

//add mismatch
ipcMain.handle(
  "add-mismatch",
  async (_event, { wireType, wireName, sequence, base64images }) => {
    try {
      const imageDir = path.join(app.getPath("userData"), "mismatch", wireType);
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      const imagePaths = base64images.map((img: string, idx: number) => {
        const filename = `${Date.now()}_${idx}.png`;
        const filepath = path.join(imageDir, filename);
        const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
        return filepath;
      });

      const queryResult = await db("mismatch").insert({
        wire_type: wireType,
        wire_name: wireName,
        sequence: sequence,
        image_front: imagePaths[0],
        image_back: imagePaths[1],
      });

      console.log(queryResult);
    } catch (error) {
      console.error("Error adding result:", error);
      throw new Error("Failed to add result");
    }
  }
);

ipcMain.handle("fetch-row", async (_event, {tableName, id}): Promise<any[]> => {
  try {
    console.log(`Fetching Row from ${tableName} with id = ${id}`)
    const row = await db(tableName).where({ id }).first();
    return row || [];
  } catch (error) {
    console.error("Error fetching row:", error);
    return [];
  }
});
