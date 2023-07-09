"use strict";
import mediator from "./mediator.js";

const projects = {
  projectsList: {},

  createProject: function createProject(projName) {
    projects.projectsList[projName] ||= {};
    mediator.publish("projectListUpdate", Object.keys(projects.projectsList));
  },
  deleteProject: function deleteProject(projName) {
    delete projects.projectsList[projName];
    mediator.publish("projectListUpdate", Object.keys(projects.projectsList));
  },
  renameProject: function renameProject([oldName, newName]) {
    if (oldName !== newName) {
      Object.defineProperty(projects.projectsList, newName,
        Object.getOwnPropertyDescriptor(projects.projectsList, oldName));
      delete projects.projectsList[oldName];
    };
    mediator.publish("projectListUpdate", Object.keys(projects.projectsList));
  },
  getProjects: function getProjects() {
    if (Object.keys(projects.projectsList).length==0) {
      projects.createProject("Default Project");
    };
    mediator.publish("returnProjList", Object.keys(projects.projectsList));
  },
  createTask: function createTask([projName, taskName, taskDataObj]) {
    projects.projectsList[projName][taskName] ||= taskDataObj;
    mediator.publish("taskListUpdate", Object.values(projects.projectsList));
  },
  deleteTask: function deleteTask([projName, taskName]) {
    delete projects.projectsList[projName][taskName];
    mediator.publish("taskListUpdate", Object.values(projects.projectsList));
  },
  toggleTaskDone: function toggleTaskDone([projName, taskName]) {
    const task = projects.projectsList[projName][taskName];
    task.done = !task.done;
  },
  editTask: function editTask([projName, taskName, taskDataObj]) {
    Object.keys(taskDataObj).forEach(key =>
      projects.projectsList[projName][taskName][key]=taskDataObj[key]
    );
    mediator.publish("taskListUpdate", Object.values(projects.projectsList));
  },
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
})();
window.projects=projects.projectsList;
export default projects;