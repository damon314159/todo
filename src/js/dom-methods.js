"use-strict";
import mediator from "./mediator.js";
import modalHTML from "../html/modal.template.html";
import { format } from 'date-fns';

const projectTemplate = document.querySelector(".project-template");
const projectCount = document.querySelector(".project-count");
const projectList = document.querySelector(".project-list");
const taskTemplate = document.querySelector(".task-template");
const taskList = document.querySelector(".task-list");

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
    label.setAttribute("for",field);
    label.textContent = field;
    input.id = field;
    if (typeof(fieldsObj[field])==="string") {
      input.setAttribute("type", fieldsObj[field]);
    } else {
      if (fieldsObj[field].required===false) {
        input.removeAttribute("required");
        label.textContent += " (optional)";
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
      if (fieldsObj[field].value) {
        if (tag==="textarea") {
          input.innerHTML = fieldsObj[field].value;
        } else {
          input.value = fieldsObj[field].value;
        };
      };
      swapTag(input, tag);
    };
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
  document.querySelector(".modal form").children[2].focus();
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
  const title = document.querySelector(".tasks-container-title");
  tabs.forEach(tab => {
    tab.classList = '';
    if (tabName===tab.querySelector("span").textContent) {
      tab.classList = "tab-selected";
      const clone = tab.cloneNode(true);
      title.children[1].replaceWith(clone.children[1]);
      title.children[0].replaceWith(clone.children[0]);
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
      "Due Date": "date",
      "Description": {tag: "textarea", required: false},
      "Notes": {tag: "textarea", required: false},
    },
    ()=>{
      const projName = document.getElementById("Select Project").value;
      const taskName = document.getElementById("Task Name").value;
      const priority = document.getElementById("Priority").value;
      const date = document.getElementById("Due Date").value;
      const description = document.getElementById("Description").value;
      const notes = document.getElementById("Notes").value;
      mediator.publish("taskCreated", [
        projName, 
        taskName,
        {
          priority,
          date,
          description,
          notes,
          done: false,
          projName,
        }
      ]);
      return true;
    }
  );
}

function addTask(name, dataObj) {
  const newTask = taskTemplate.content.cloneNode(true);
  const title = newTask.querySelector(".task-title");
  title.textContent = name;
  const date = new Date(dataObj.date);
  newTask.querySelector(".due-date").textContent = format(date, "dd/MM");
  let bgColor;
  switch (dataObj.priority) {
    case "High":
      bgColor = "var(--red)";
      break;
    case "Medium":
      bgColor = "var(--yellow)";
      break;
    case "Low":
      bgColor = "var(--green)";
      break;
  };
  newTask.querySelector("li").style.backgroundColor = bgColor;
  const isDone = newTask.querySelector(".is-done");
  if (dataObj.done) {
    isDone.checked = true;
    title.style.textDecoration = "line-through";
  };
  newTask.querySelector(".description-span").textContent = 
    dataObj.description ? dataObj.description : "No description written";
  newTask.querySelector(".notes-span").textContent = 
    dataObj.notes ? dataObj.notes : "No notes taken";
  newTask.querySelector(".edit-task-btn").addEventListener("click", ()=>{
    openModal(
      {
        "Edit Task:":"",
        "Due Date": "date",
        "Priority": {tag: "select", options: ["High", "Medium", "Low"]},
        "Description": {tag: "textarea", required: false, value: dataObj.description},
        "Notes": {tag: "textarea", required: false, value: dataObj.notes},
      }, 
      ()=>{
        const date = document.getElementById("Due Date").value;
        const priority = document.getElementById("Priority").value;
        const description = document.getElementById("Description").value;
        const notes = document.getElementById("Notes").value;
        mediator.publish("taskEdited", 
          [
            dataObj.projName,
            name,
            {
              date,
              priority,
              description,
              notes,
            }
          ]);
        return true;
      }
    );
  });
  newTask.querySelector(".delete-task-btn").addEventListener("click", ()=>{
    mediator.publish("taskDeleted", [dataObj.projName, name]);
  });
  isDone.addEventListener("click", () => {
    mediator.publish("toggleTaskDone", [dataObj.projName, name]);
    if (isDone.checked) {
      title.style.textDecoration = "line-through";
    } else if (!isDone.checked) {
      title.style.textDecoration = "none";
    };
  })
  const dropDown = newTask.querySelector(".task-info-box");
  const seeMore = newTask.querySelector(".see-more-icon");
  seeMore.parentElement.addEventListener("click", ()=>{
    if (dropDown.style.display==="") {
      dropDown.style.display = "flex";
      seeMore.style.transform = "rotate(180deg)";
    } else if (dropDown.style.display==="flex") {
      dropDown.style.display = "";
      seeMore.style.transform = "";
    };
  })
  taskList.appendChild(newTask);
};

function renderTasks(taskLists) {
  taskList.querySelectorAll("li").forEach(
    node => node.remove()
  );
  Object.entries(taskLists).forEach(task => 
    addTask(task[0], task[1])
  );
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