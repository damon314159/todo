"use-strict";
const projectTemplate = document.querySelector(".project-template");
const projectCount = document.querySelector(".project-count");
const projectList = document.querySelector(".project-list");

(()=>{ //Populate default project
  const defaultProj = projectTemplate.content.cloneNode(true);
  defaultProj.querySelector(".project-name").textContent = "Default Project";
  projectList.appendChild(defaultProj);
  projectCount.textContent = "1";
})();

const DOMmethods = {};

export default DOMmethods;