"use-strict";
import mediator from "./mediator.js";

const projectTemplate = document.querySelector(".project-template");
const projectCount = document.querySelector(".project-count");
const projectList = document.querySelector(".project-list");
// Add listeners to the navigation tabs on load
const navTabs = document.querySelectorAll(".nav-list>li");
navTabs.forEach(tab => tab.addEventListener("click", ()=>{
  const tabName = tab.querySelector("span").textContent;
  mediator.publish("tabChanged", tabName);
}));


const DOMmethods = {
  addProject: function addProject(projectName) {
    const newProj = projectTemplate.content.cloneNode(true);
    newProj.querySelector(".project-name").textContent = projectName;
    projectList.appendChild(newProj);
    projectList.lastElementChild.addEventListener("click", ()=>{
      mediator.publish("tabChanged", projectName);
    });
  },
  removeProject: function removeProject(projectName) {
    const delProj = projectList.querySelector("."+projectName).parentElement;
    delProj.remove();
  },
  changeTab: function changeTab(tabName) {
    const tabs = document.querySelectorAll(".nav-bar li");
    tabs.forEach(tab => {
      tab.classList = '';
      if (tabName===tab.querySelector("span").textContent) {
        tab.classList = "tab-selected";
      };
    });
  },
  renderTasks: function renderTasks(taskList) {
    //do this later
  },
};

(()=>{ // Subscribe to relevant events
  mediator.subscribe("projectAdded", DOMmethods.addProject);
  mediator.subscribe("projectRemoved", DOMmethods.removeProject);
  mediator.subscribe("tabChanged", DOMmethods.changeTab);
})();

export default DOMmethods;