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

function swapTag(node, tag) {
  const clone = document.createElement(tag)
  for (const attr of node.attributes) {
    clone.setAttribute(attr.name, attr.value)
  }
  while (node.firstChild) {
    clone.appendChild(node.firstChild)
  }
  node.replaceWith(clone)
};

function openModal(fieldsObj, submitFn) {
  const modal = htmlToElements(modalHTML)[0];
  const form = modal.querySelector("form");
  const title = modal.querySelector(".modal-title-span");
  const submit = modal.querySelector(".submit-btn");
  const close = modal.querySelector(".close-btn");
  title.textContent = Object.keys(fieldsObj)[0];
  Object.keys(fieldsObj).slice(1).forEach(field => {
    const template = modal.querySelector("template").content.cloneNode(true);
    const label = template.querySelector("label");
    const input = template.querySelector("input");
    input.id = field;
    if (typeof(fieldsObj[field])==="string") {
      input.setAttribute("type", fieldsObj[field]);
    } else {
      if (fieldsObj[field].required===false) {
        input.removeAttribute("required");
      };
      const tag = fieldsObj[field].tag;
      if (tag==="select") {
        fieldsObj[field].options.forEach(val => {
          const option = document.createElement("option");
          option.setAttribute("value",val);
          option.textContent = val;
          input.appendChild(option);
        });
      };
      swapTag(input, tag);
    };
    label.setAttribute("for",field);
    label.textContent = field;
    form.insertBefore(template, form.lastElementChild);
  });
  close.addEventListener("click", () => modal.remove());
  submit.addEventListener("click", (event) => {
    event.preventDefault();
    let valid = true;
    form.childNodes.forEach(node=>{
      if (node.required && node.value==="") {
        valid = false;
      };
    });
    if (valid) {valid=submitFn();};
    if (valid) {modal.remove();};
  });
  document.body.appendChild(modal);
  document.querySelector(".modal input").focus();
}

function addProject(projectName) {
  const newProj = projectTemplate.content.cloneNode(true);
  newProj.querySelector(".project-name").textContent = projectName;
  newProj.querySelector(".edit-project-btn").addEventListener("click", (event)=>{
    event.stopPropagation();
    openModal({"Edit Project Name:":"","New Name":"text"}, ()=>{
      mediator.publish("projectRenamed", 
        [projectName, document.getElementById("New Name").value]);
      return true;
    });
    mediator.publish("editProjectOpened", projectName)
  });
  newProj.querySelector(".delete-project-btn").addEventListener("click", (event)=>{
    event.stopPropagation();
    mediator.publish("projectRemoved", projectName)
  });
  projectList.appendChild(newProj);
  projectList.lastElementChild.addEventListener("click", ()=>{
    mediator.publish("tabChanged", projectName);
  });
};

function updateProjectTabs(list) {
  projectList.querySelectorAll("li").forEach(
    node => node.remove()
  );
  list.forEach(name => addProject(name));
  projectCount.textContent = list.length;
};

function changeTab(tabName) {
  const tabs = document.querySelectorAll(".nav-bar li");
  tabs.forEach(tab => {
    tab.classList = '';
    if (tabName===tab.querySelector("span").textContent) {
      tab.classList = "tab-selected";
    };
  });
};

function createProjectModal() {
  openModal(
    {
      "Create Project:":"",
      "Project Name":"text"
    }, 
    ()=>{
      const projName = document.getElementById("Project Name").value;
      mediator.publish("projectAdded", projName);
      return true;
    }
  );
};

function createTaskModal() {
  mediator.publish("requestProjList", null);
  openModal(
    {
      "Create Task:":"",
      "Select Project": {tag: "select",options:projSelectors.get()},
      "Task Name": "text",
      "Priority": {tag: "select", options:["High", "Medium", "Low"]},
      "Description": {tag: "textarea", required: false},
      "Notes": {tag: "textarea", required: false},
    },
    ()=>{
      const projName = document.getElementById("Select Project").value;
      const taskName = document.getElementById("Task Name").value;
      const priority = document.getElementById("Priority").value;
      const description = document.getElementById("Description").value;
      const notes = document.getElementById("Notes").value;
      mediator.publish("taskCreated", [
        projName, 
        taskName,
        {
          priority,
          description,
          notes,
        }
      ]);
      return true;
    }
  );
}

function renderTasks(taskList) {
  //do this later
};

const projSelectors = (()=>{
  let selectors = [];
  function set(projectList) {
    selectors = projectList;
  };
  function get() {
    return selectors;
  };
  return {set, get};
})();

const DOMmethods = {
  updateProjectTabs,
  changeTab,
  createProjectModal,
  createTaskModal,
  renderTasks,
  updateProjSelectors: projSelectors.set,
};

(()=>{ // Subscribe to relevant events
  mediator.subscribe("projectListUpdate", DOMmethods.updateProjectTabs);
  mediator.subscribe("tabChanged", DOMmethods.changeTab);
  mediator.subscribe("newProject", DOMmethods.createProjectModal);
  mediator.subscribe("newTask", DOMmethods.createTaskModal);
  mediator.subscribe("taskListUpdate", DOMmethods.renderTasks);
  mediator.subscribe("returnProjList", DOMmethods.updateProjSelectors);
})();

export default DOMmethods;