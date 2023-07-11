"use strict";
import mediator from "./mediator.js";
import { differenceInCalendarDays } from 'date-fns';

// On load, create default project and set tab to 'All'
mediator.publish("projectAdded", "Default Project");
mediator.publish("tabChanged", "All");

const currTab = (()=>{
  let tab = "All";
  function set(tabName) {
    tab = tabName;
    requestTaskList();
  };
  function get() {
    return tab;
  };
  return {set, get};
})();

function requestTaskList() {
  mediator.publish("requestTaskList", null);
};

function filterObject(obj, callback) {
  return Object.fromEntries(Object.entries(obj).
    filter(([key, val]) => callback(key, val)));
};

function filterTasks(taskList) {
  const tab = currTab.get();
  const today = new Date();
  let callback;
  switch (tab) {
    case "All":
      callback = ((key, val) => true);
      break;
    case "Today":
      callback = ((key, val) => differenceInCalendarDays(new Date(val.date), today)===0);
      break;
    case "Week":
      callback = ((key, val) => {
        const diff = differenceInCalendarDays(new Date(val.date), today);
        return diff>=0 && diff<7;
      });
      break;
    case "Important":
      callback = ((key, val) => val.priority==="High");
      break;
    case "Completed":
      callback = ((key, val) => val.done);
      break;
    default:
      callback = ((key, val) => val.projName===tab);
      break;
  };
  const filteredList = filterObject(taskList, callback);
  mediator.publish("taskListUpdate", filteredList);
};

const appLogic = {
  requestTaskList,
  filterTasks,
  updateTab: currTab.set,
};

(()=>{ // Subscribe to relevant events
  mediator.subscribe("tabChanged", appLogic.updateTab);
  mediator.subscribe("taskUpdate", appLogic.requestTaskList);
  mediator.subscribe("returnTaskList", appLogic.filterTasks);
})();

export default appLogic;