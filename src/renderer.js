import { render } from "react-dom";
import React from "react";

class Renderer {
  render = (Component, divId) => {
    if (divId !== undefined) {
      const container = document.getElementById(divId);
      if (container !== null) {
        //it can be null, eg. you might not have guests div on your index page
        const props = this.fetchContainerProps(container);
        render(React.createElement(Component, props, null), container);
      }
    }
  };

  fetchContainerProps = container => {
    if (!container.dataset) {
      return {};
    }
    const propsHash = {};
    for (const i in container.dataset) {
      propsHash[i] = JSON.parse(container.dataset[i]);
    }
    return propsHash;
  };
}

export { Renderer };
