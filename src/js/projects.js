"use strict";
import mediator from "./mediator.js";

function storageSave() {
  localStorage.clear();
  localStorage.setItem("projectsList", JSON.stringify(projects.projectsList));
};

const projects = {
  projectsList: {},

  createProject: function createProject(projName) {
    projects.projectsList[projName] ||= {};
    mediator.publish("projectListUpdate", Object.keys(projects.projectsList));
    storageSave();
  },
  deleteProject: function deleteProject(projName) {
    delete projects.projectsList[projName];
    mediator.publish("projectListUpdate", Object.keys(projects.projectsList));
    storageSave();
  },
  renameProject: function renameProject([oldName, newName]) {
    if (oldName !== newName) {
      Object.defineProperty(projects.projectsList, newName,
        Object.getOwnPropertyDescriptor(projects.projectsList, oldName));
      delete projects.projectsList[oldName];
    };
    mediator.publish("projectListUpdate", Object.keys(projects.projectsList));
    storageSave();
  },
  getProjects: function getProjects() {
    if (Object.keys(projects.projectsList).length==0) {
      projects.createProject("Default Project");
    };
    mediator.publish("returnProjList", Object.keys(projects.projectsList));
  },
  createTask: function createTask([projName, taskName, taskDataObj]) {
    projects.projectsList[projName][taskName] ||= taskDataObj;
    mediator.publish("taskUpdate", null);
    storageSave();
  },
  deleteTask: function deleteTask([projName, taskName]) {
    delete projects.projectsList[projName][taskName];
    mediator.publish("taskUpdate", null);
    storageSave();
  },
  toggleTaskDone: function toggleTaskDone([projName, taskName]) {
    const task = projects.projectsList[projName][taskName];
    task.done = !task.done;
    storageSave();
  },
  editTask: function editTask([projName, taskName, taskDataObj]) {
    Object.keys(taskDataObj).forEach(key =>
      projects.projectsList[projName][taskName][key]=taskDataObj[key]
    );
    mediator.publish("taskUpdate", null);
    storageSave();
  },
  getTasks: function getTasks() {
    const taskList = {};
    Object.keys(projects.projectsList).forEach(project => {
      Object.entries(projects.projectsList[project]).forEach(task => {
        taskList[task[0]] = task[1];
      });
    });
    mediator.publish("returnTaskList", taskList);
  },
  loadStorage: function loadStorage() {
    const json = localStorage.getItem("projectsList");
    projects.projectsList = JSON.parse(json);
    mediator.publish("projectListUpdate", Object.keys(projects.projectsList));
  }
};

(()=>{ // Subscribe to relevant events
  mediator.subscribe("projectAdded", projects.createProject);
  mediator.subscribe("projectRemoved", projects.deleteProject);
  mediator.subscribe("projectRenamed", projects.renameProject);
  mediator.subscribe("taskCreated", projects.createTask);
  mediator.subscribe("taskDeleted", projects.deleteTask);
  mediator.subscribe("taskEdited", projects.editTask);
  mediator.subscribe("toggleTaskDone", projects.toggleTaskDone);
  mediator.subscribe("requestProjList", projects.getProjects);
  mediator.subscribe("requestTaskList", projects.getTasks);
  mediator.subscribe("storageLoad", projects.loadStorage);
})();

export default projects;