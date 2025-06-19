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
  base64Images: string[]
) {
  const imageDir = path.join(app.getAppPath(), "images", tableName);
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  const date = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(Date.now());

  // Validate number of images
  if (tableName === "singlewire" && base64Images.length !== 1) {
    throw new Error("Single wire must have exactly one image.");
  }

  if (tableName === "doublewire" && base64Images.length !== 2) {
    throw new Error("Double wire must have exactly two images.");
  }

  // Generate image file names
  const imagePaths = base64Images.map((img, idx) => {
    const filename = `${Date.now()}_${idx}.png`;
    const filepath = path.join(imageDir, filename);
    const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
    return filepath;
  });

  let result;
  // Insert based on wire type
  if (tableName === "singlewire") {
    result = await db("singlewire").insert({
      sequence: validSequence,
      path: imagePaths[0],
      created_at: new Date(), // optional
    });
  } else if (tableName === "doublewire") {
    result = await db("doublewire").insert({
      sequence: validSequence,
      image_front: imagePaths[0],
      image_back: imagePaths[1],
      created_at: new Date(), // optional
    });
  } else {
    throw new Error("Unknown wire type.");
  }

  console.log(result);
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
      return rows;
    } catch (error) {
      console.error("Database Error:", error);
      return [];
    }
  }
);

ipcMain.handle(
  "fetch-wire-image",
  async (_event, { selectedWireId, wireType }): Promise<string[]> => {
    try {
      if (wireType === "singlewire") {
        const result = await db(wireType)
          .where({ id: selectedWireId })
          .select("path")
          .first();

        if (!result?.path || !fs.existsSync(result.path)) {
          console.warn(
            "Single wire image path not found or file does not exist."
          );
          return [];
        }

        const imageBuffer = fs.readFileSync(result.path);
        const base64Image = `data:image/png;base64,${imageBuffer.toString(
          "base64"
        )}`;
        return [base64Image];
      }

      if (wireType === "doublewire") {
        const result = await db(wireType)
          .where({ id: selectedWireId })
          .select("image_front", "image_back")
          .first();

        const images: string[] = [];

        if (result?.image_front && fs.existsSync(result.image_front)) {
          const frontBuffer = fs.readFileSync(result.image_front);
          images.push(
            `data:image/png;base64,${frontBuffer.toString("base64")}`
          );
        } else {
          console.warn("Front image missing or does not exist.");
        }

        if (result?.image_back && fs.existsSync(result.image_back)) {
          const backBuffer = fs.readFileSync(result.image_back);
          images.push(`data:image/png;base64,${backBuffer.toString("base64")}`);
        } else {
          console.warn("Back image missing or does not exist.");
        }

        return images;
      }

      console.warn("Unknown wire type:", wireType);
      return [];
    } catch (error) {
      console.error("Error fetching wire images:", error);
      return [];
    }
  }
);

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

ipcMain.handle(
  "compare-item",
  async (_event, { originalImage, imageToBeChecked, wireType }) => {
    return new Promise((resolve, reject) => {
      const pythonPath =
        "C:\\Users\\Acer\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
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
          const result = JSON.parse(output);
          resolve(result); // Return Python result
        } else {
          reject(new Error(`Python error: ${error}`));
        }
      });

      // Send data to Python via stdin
      const payload = JSON.stringify({
        original: originalImage,
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
    const pythonPath =
      "C:\\Users\\Acer\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
    const python = spawn(pythonPath, ["backend/getsequence.py"]);

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
      input: wireImages,
      wireType: wireType,
    });

    python.stdin.write(payload);
    python.stdin.end();
  });
});

ipcMain.handle(
  "add-result",
  async (
    _event,
    { wireType, wireId, result, details, tested_by, base64images }
  ) => {
    try {
      const imageDir = path.join(
        app.getAppPath(),
        "images",
        "results",
        wireType
      );
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

      const queryResult = await db("results").insert({
        wire_type: wireType,
        wire_id: wireId,
        result,
        details,
        tested_by,
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

ipcMain.handle(
  "fetch-results",
  async (_event, wireType: string): Promise<ResultRow[]> => {
    try {
      const rows = await db("results")
        .where({
          wire_type: wireType,
        })
        .select("*");
      return rows;
    } catch (error) {
      console.error("Database Error:", error);
      return [];
    }
  }
);

ipcMain.handle("fetch-result-details", async (_event, id): Promise<string> => {
  try {
    const row = await db("results").where({ id }).select("details").first();
    return row?.details || "";
  } catch (error) {
    console.error("Error fetching result details:", error);
    return "";
  }
});

ipcMain.handle(
  "fetch-result-wire-image",
  async (_event, resultId): Promise<string[]> => {
    try {
      console.log("ID: ", resultId)
      const result = await db("results")
        .where({ id: resultId })
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
        console.warn("Back image missing or does not exist.");
      }

      return images;
    } catch (error) {
      console.error("Error fetching wire images:", error);
      return [];
    }
  }
);
