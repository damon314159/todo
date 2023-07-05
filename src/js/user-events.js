"use strict";
import mediator from "./mediator.js";

// Add listeners to the navigation tabs on load
const navTabs = document.querySelectorAll(".nav-list>li");
navTabs.forEach(tab => tab.addEventListener("click", ()=>{
  const tabName = tab.querySelector("span").textContent;
  mediator.publish("tabChanged", tabName);
}));

const addProjBtn = document.querySelector(".add-project-btn");
addProjBtn.addEventListener("click", event => {
  mediator.publish("newProject", null);
});

const userEvents = {};

export default userEvents;