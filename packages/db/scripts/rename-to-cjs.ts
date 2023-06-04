import fs from "fs-extra";
import path from "path";

async function renameFilesRecursive(folderPath: string): Promise<void> {
  const files = await fs.readdir(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileStats = await fs.stat(filePath);

    if (fileStats.isDirectory()) {
      await renameFilesRecursive(filePath);
    } else if (path.extname(file) === ".js") {
      const newFilePath = path.join(folderPath, path.basename(file, ".js") + ".cjs");
      await fs.rename(filePath, newFilePath);
      console.log(`Renamed ${file} to ${path.basename(newFilePath)}`);
    }
  }
}

async function main() {
  renameFilesRecursive("dist").catch((e) => {
    console.error(`An error occurred: `, e);
  });
}

main();
