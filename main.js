const { app, BrowserWindow, ipcMain, dialog } = require("electron"),
  path = require("path");
Store = require("electron-store");

//   { generateCard } = require("./home")
let mainWindow = null;
let viewItemWindow = null;
let editItemWindow = null;
let newItemWindow = null;
// *************** Database initialisation *********************

const store = new Store();

let trips = store.get("trips");
console.log(trips);
if (!trips || trips.length == 0) {
  trips = [
    {
      id: 1,
      title: "Annonce 1",
      destination: "Parc national de Yellowstone",
      features: ["repas", "parking"],
      price: 200,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic aliquam ea mollitia, velit blanditiis provident autem enim odio.",
      totalDescription:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic aliquam ea mollitia, velit blanditiis provident autem enim odio.  Hic aliquam ea mollitia, velit blanditiis provident autem enim odio.",
      image:
        "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    },
    {
      id: 2,
      title: "Annonce 2",
      destination: "Cormeilles-en-Parisis ",
      features: ["repas", "silo", "camenbert"],
      price: 300,
      description:
        "Lorddddddem ipsum dolor sit amet consectetur adipisicing elit. Hic aliquam ea mollitia, velit blanditiis provident autem enim odio.",
      totalDescription:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic aliquam ea mollitia, velit blanditiis provident autem enim odio.  Hic aliquam ea mollitia, velit blanditiis provident autem enim odio.",
      image:
        "https://www.leparisien.fr/resizer/Lao8dpOtFmaIu9UwOfThK3CYzJk=/932x582/arc-anglerfish-eu-central-1-prod-leparisien.s3.amazonaws.com/public/V5GSORTR4AJ6SS4QGNJID2X6O4.jpg",
    },
  ];

  store.set("trips", trips);
}

// Create a generic window
function createWindow(viewName, data, width = 1400, height = 1200) {
  const win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win
    .loadFile(path.join(__dirname, "views", viewName, viewName + ".html"))
    .then(() => {
      win.send("init-data", data);
    });
  return win;
}

app.whenReady().then(() => {
  mainWindow = createWindow("home", trips);
});

// For mac
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// For mac
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow("home");
  }
});

// *********************** View item window *********************
ipcMain.on("create-view-item-window", (e, dataHome) => {
  if (viewItemWindow) {
    viewItemWindow.destroy();
  }

  viewItemWindow = createWindow("viewItem", dataHome, 1000, 800);
});

// ********************* Add item window**************

ipcMain.on("create-new-item-window", (e) => {
  if (newItemWindow) {
    newItemWindow.destroy();
  }
  newItemWindow = createWindow("addItem", null, 1000, 800);

  ipcMain.handle("add-item", (e, dataNewItem) => {
    if (trips.length === 0) {
      dataNewItem.id = 0;
    } else {
      const lastIndex = trips.length - 1;
      dataNewItem.id = trips[lastIndex].id + 1;
    }

    trips.push(dataNewItem);
    store.set("trips", trips);

    mainWindow.send("show-new-item", {
      newItem: [dataNewItem],
    });

    return { msg: "Ajout fait !" };
  });

  newItemWindow.on("closed", () => {
    ipcMain.removeHandler("add-item");
    newItemWindow = null;
  });
});

// ********************* Edit Item window *****************
ipcMain.on("create-edit-item-window", (e, dataview) => {
  console.log("create-edit-item-window");
  let item = null;
  for (let trip of trips) {
    if (trip.id === dataview.id) {
      item = trip;
      break;
    }
  }

  editItemWindow = createWindow("update", item, 1000, 800);
});

ipcMain.on("edit-item", (e, dataEditItem) => {
  console.log("edit-item from main");
  for (let i = 0; i < trips.length; i++) {
    if (trips[i].id === dataEditItem.id) {
      trips[i] = dataEditItem;
      store.set("trips", trips);
      break;
    }
  }
  editItemWindow.destroy();
  mainWindow.send("update-item", dataEditItem);
  viewItemWindow.send("update-item", dataEditItem);
});

// ****************** Delete item box ************

ipcMain.handle("delete-item", (e, data) => {
  const choice = dialog.showMessageBoxSync({
    type: "warning",
    title: "supression de l'élément",
    message: "Es-tu sûr ? ",
    buttons: ["Non", "Oui"],
  });

  //  si oui
  if (choice) {
    for (let i = 0; i < trips.length; i++) {
      if (trips[i].id === data.id) {
        console.log("dd");
        trips.splice(i, 1);
        store.set("trips", trips);
        mainWindow.send("delete-item", data.id);
        viewItemWindow.destroy();
        break;
      }
    }
  }
  return { choice };
});
