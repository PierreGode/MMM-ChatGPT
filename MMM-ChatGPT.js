Module.register("MMM-ChatGPT", {
  defaults: {
    updateInterval: 1000,
  },

  start: function () {
    this.response = "";
    this.sendSocketNotification("START_CHATGPT");
  },

  getStyles: function () {
    return ["MMM-ChatGPT.css"];
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "chatgpt-wrapper";
    const responseElement = document.createElement("div");
    responseElement.className = "chatgpt-response";
    responseElement.innerHTML = this.response;
    wrapper.appendChild(responseElement);
    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CHATGPT_RESPONSE") {
      this.response = payload;
      this.updateDom();
    }
  },

  notificationReceived: function (notification, payload, sender) {
    if (notification === "DOM_OBJECTS_CREATED") {
      setInterval(() => {
        this.sendSocketNotification("START_CHATGPT");
      }, this.config.updateInterval);
    }
  },
});
