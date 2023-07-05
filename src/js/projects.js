"use strict";
import mediator from "./mediator.js";

const projects = {
  projectsList: {},

  createProject: function createProject(projName) {
    projects.projectsList[projName] ||= {};
  },
  deleteProject: function deleteProject(projName) {
    delete projects.projectsList[projName];
  },
  createTask: function createTask([projName, taskName, taskDataObj]) {
    projects.projectsList[projName][taskName] ||= taskDataObj;
  },
  deleteTask: function deleteTask([projName, taskName]) {
    delete projects.projectsList[projName][taskName];
  },
  toggleTaskDone: function toggleTaskDone([projName, taskName]) {
    const task = projects.projectsList[projName][taskName];
    task.done = !task.done;
  },
};

(()=>{ // Subscribe to relevant events
  mediator.subscribe("projectAdded", projects.createProject);
  mediator.subscribe("projectRemoved", projects.deleteProject);
  mediator.subscribe("taskCreated", projects.createTask);
  mediator.subscribe("taskDeleted", projects.deleteTask);
  mediator.subscribe("toggleTaskDone", projects.toggleTaskDone);
})();

export default projects;

// task object looks like
// {
//   title,
//   dueDate,
//   priority,
//   description,
//   done,
//   checklist,
// }