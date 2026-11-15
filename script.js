const roomButtons = [...document.querySelectorAll("[data-room-target]")];
const roomCards = [...document.querySelectorAll(".room-card")];
const panels = [...document.querySelectorAll("[data-room-panel]")];
const closeButtons = [...document.querySelectorAll("[data-close-room]")];
const draggableCards = [...document.querySelectorAll("[data-draggable]")];
let activeRoom = null;

function openRoom(roomName, shouldScroll = true) {
  const nextPanel = document.querySelector(`[data-room-panel="${roomName}"]`);
  if (!nextPanel) return;

  activeRoom = roomName;
  panels.forEach((panel) => {
    panel.hidden = panel !== nextPanel;
  });
  roomCards.forEach((card) => {
    const isActive = card.dataset.roomTarget === roomName;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-expanded", String(isActive));
  });

  if (shouldScroll) {
    requestAnimationFrame(() => {
      nextPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      const heading = nextPanel.querySelector("h2");
      heading?.setAttribute("tabindex", "-1");
      window.setTimeout(() => heading?.focus({ preventScroll: true }), 450);
    });
  }

  history.replaceState(null, "", `#${roomName}`);
}

function closeRoom() {
  panels.forEach((panel) => { panel.hidden = true; });
  roomCards.forEach((card) => {
    card.classList.remove("is-active");
    card.setAttribute("aria-expanded", "false");
  });
  activeRoom = null;
  history.replaceState(null, "", "#rooms");
  document.querySelector("#rooms")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

roomButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    if (button.dataset.justDragged === "true") {
      event.preventDefault();
      button.dataset.justDragged = "false";
      return;
    }
    openRoom(button.dataset.roomTarget);
  });
});

closeButtons.forEach((button) => button.addEventListener("click", closeRoom));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeRoom) closeRoom();
});

const initialRoom = window.location.hash.replace("#", "");
if (["about", "projects", "personal"].includes(initialRoom)) {
  openRoom(initialRoom, false);
}

document.querySelector("#year").textContent = new Date().getFullYear();

function enableDeskDrag(card) {
  if (!window.matchMedia("(pointer: fine) and (min-width: 901px)").matches) return;

  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let moved = false;

  card.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    startX = event.clientX;
    startY = event.clientY;
    originX = Number(card.dataset.dragX || 0);
    originY = Number(card.dataset.dragY || 0);
    moved = false;
    card.classList.add("is-dragging");
    card.setPointerCapture(event.pointerId);
  });

  card.addEventListener("pointermove", (event) => {
    if (!card.hasPointerCapture(event.pointerId)) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.hypot(dx, dy) > 6) moved = true;
    if (!moved) return;
    const nextX = Math.max(-280, Math.min(280, originX + dx));
    const nextY = Math.max(-180, Math.min(220, originY + dy));
    card.dataset.dragX = String(nextX);
    card.dataset.dragY = String(nextY);
    card.style.setProperty("--drag-x", `${nextX}px`);
    card.style.setProperty("--drag-y", `${nextY}px`);
  });

  card.addEventListener("pointerup", (event) => {
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
    card.classList.remove("is-dragging");
    card.dataset.justDragged = String(moved);
  });

  card.addEventListener("pointercancel", () => card.classList.remove("is-dragging"));
}

draggableCards.forEach(enableDeskDrag);

document.querySelector("#tidy-desk")?.addEventListener("click", () => {
  draggableCards.forEach((card) => {
    card.dataset.dragX = "0";
    card.dataset.dragY = "0";
    card.style.setProperty("--drag-x", "0px");
    card.style.setProperty("--drag-y", "0px");
  });
});

