const { ipcRenderer } = require("electron");

function generateCard(tripsArray) {
  const containerDiv = document.querySelector(".container-fluid");

  tripsArray.forEach((trip) => {
    // I clone the card template
    const newCard = document.querySelector("#cardTemplate").cloneNode(true);

    newCard.hidden = false;
    newCard.id = `card${trip.id}`;

    // I append the new card in the container (for the moment the new card has no content)
    containerDiv.appendChild(newCard);

    // I select all the elements of the new card
    let title = document.querySelector(`#card${trip.id} #title`);

    let destination = document.querySelector(`#card${trip.id} #destination`);
    let image = document.querySelector(`#card${trip.id} #image`);
    let description = document.querySelector(`#card${trip.id} #description`);
    let price = document.querySelector(`#card${trip.id} #price`);
    let features = document.querySelector(`#card${trip.id} #features`);
    let btn = document.querySelector(`#card${trip.id} button`);

    title.innerHTML = trip.title;
    destination.innerHTML = trip.destination;
    image.src = trip.image;
    description.innerHTML = trip.description;
    price.innerHTML = `${trip.price} <span>€</span>`;

    trip.features.forEach(
      (feature) => (features.innerHTML += `<li> ${feature}</li> `)
    );

    btn.addEventListener("click", function () {
      ipcRenderer.send("create-view-item-window", trip);

      const edit = (e, data) => {
        console.log(data.title);
        title.innerHTML = data.title;
        destination.innerHTML = data.destination;
        image.src = data.image;
        description.innerHTML = data.description;
        price.innerHTML = `${data.price} <span>€</span>`;
        features.innerHTML = "";
        data.features.forEach(
          (feature) => (features.innerHTML += `<li> ${feature}</li> `)
        );

        // ipcRenderer.removeListener("update-item", edit);
      };
      ipcRenderer.on("update-item", edit);
    });
  });
}

const addBtn = document.querySelector("#addBtn");
addBtn.addEventListener("click", () => {
  ipcRenderer.send("create-new-item-window");
});

// *********************** IpcRenderer *********************

ipcRenderer.on("init-data", (e, data) => {
  generateCard(data);
});

ipcRenderer.on("delete-item", (e, id) => {
  document.querySelector(`#card${id}`).remove();
});

ipcRenderer.on("show-new-item", (e, data) => {
  generateCard(data.newItem);
});
