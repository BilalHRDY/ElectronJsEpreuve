const { ipcRenderer } = require("electron");

const editItemForm = document.querySelector("#edit-item-form");

const titleInput = document.querySelector("#title");
const priceInput = document.querySelector("#price");
const destinationInput = document.querySelector("#destination");
const descriptionInput = document.querySelector("#description");
const imageInput = document.querySelector("#image");
const featuresInput = document.querySelector("#features");
const totalDescriptionInput = document.querySelector("#totalDescription");
// const infosDiv = document.querySelector("#infos");

ipcRenderer.on("init-data", (e, data) => {
  totalDescriptionInput.value = data.totalDescription;
  titleInput.value = data.title;
  priceInput.value = data.price;
  destinationInput.value = data.destination;
  descriptionInput.value = data.description;
  imageInput.value = data.image;

  data.features.forEach((feature) => (featuresInput.value += `${feature} `));

  editItemForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // infosDiv.textContent = "";
    // infosDiv.hidden = false;

    ipcRenderer.send("edit-item", {
      id: data.id,
      title: titleInput.value,
      destination: destinationInput.value,
      features: featuresInput.value.trim().split(" "),
      price: priceInput.value,
      description: descriptionInput.value,
      totalDescription: totalDescriptionInput.value,
      image: imageInput.value,
    });
  });
});
