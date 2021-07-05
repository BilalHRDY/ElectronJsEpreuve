const { ipcRenderer } = require("electron");

let btnUpdate = document.querySelector("#btnUpdate");
let btnDelete = document.querySelector("#btnDelete");
let btnHaveEventListener = false;

function generateCardView(card) {
  document.querySelector("#title").innerHTML = card.title;
  document.querySelector("#destination").innerHTML = card.destination;
  document.querySelector("#image").src = card.image;
  document.querySelector("#totalDescription").innerHTML = card.totalDescription;
  document.querySelector("#price").innerHTML = card.price;
  let features = document.querySelector("#features");
  features.innerHTML = "";

  card.features.forEach(
    (feature) => (features.innerHTML += `<li> ${feature}</li> `)
  );

  // Check if buttons have already an eventListener to not add more eventListener
  //  when viewItem.html is updated
  if (!btnHaveEventListener) {
    btnHaveEventListener = true;
    btnUpdate.addEventListener("click", () => {
      console.log("create-edit-item-window");
      ipcRenderer.send("create-edit-item-window", {
        id: card.id,
      });
    });

    btnDelete.addEventListener("click", () => {
      ipcRenderer
        .invoke("delete-item", {
          id: card.id,
        })
        .then((resp) => {
          if (resp.choice) {
          }
        });
    });
  }
}
ipcRenderer.on("init-data", (e, data) => {
  generateCardView(data);
});

ipcRenderer.on("update-item", (e, data) => {
  generateCardView(data);
});
