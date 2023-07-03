"use strict";
import mediator from "./mediator.js";

// On load, create default project and set tab to 'All'
mediator.publish("projectAdded", "Default Project");
mediator.publish("tabChanged", "All");



const appLogic = {};

export default appLogic;