"use-strict";
import mediator from "./mediator.js";
import modalHTML from "../html/modal.template.html";

const projectTemplate = document.querySelector(".project-template");
const projectCount = document.querySelector(".project-count");
const projectList = document.querySelector(".project-list");

function htmlToElements(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.childNodes;
};

function openModal(fieldsArr) {
  const modal = htmlToElements(modalHTML)[0];
  const submit = modal.querySelector(".btn-wrapper");
  const close = modal.querySelector(".close-btn");
  close.addEventListener("click", {/*Make it submit but not go anywhere*/});
  fieldsArr.forEach(field => {
    const template = modal.querySelector("template").content.cloneNode(true);
    template.querySelector("input").id = field;
    const label = template.querySelector("label");
    label.setAttribute("for",field);
    label.textContent = field;
    submit.parentElement.insertBefore(template, submit);
  });
  document.body.appendChild(modal);
}

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
  createProjectModal: function createProjectModal() {
    openModal(["Project Name"]);
    //get a return of the name entered
    //publish projectAdded here
  },
  renderTasks: function renderTasks(taskList) {
    //do this later
  },
};

(()=>{ // Subscribe to relevant events
  mediator.subscribe("projectAdded", DOMmethods.addProject);
  mediator.subscribe("projectRemoved", DOMmethods.removeProject);
  mediator.subscribe("tabChanged", DOMmethods.changeTab);
  mediator.subscribe("newProject", DOMmethods.createProjectModal);
})();

export default DOMmethods;