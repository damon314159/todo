"use strict";

const mediator = {
  events: {},
  subscribe: function(eventName, callback) {
    this.events[eventName] ||= [];
    this.events[eventName].push(callback);
  },
  unsubscribe: function(eventName, callback) {
    this.events[eventName] &&= this.events[eventName].filter(f => f!==callback);
  },
  publish: function(eventName, data) {
    this.events[eventName] && this.events[eventName].forEach(f=>{f(data);});
  },
};

export default mediator;