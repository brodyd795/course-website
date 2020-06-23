import React, { Component } from "react";

class Blackbox extends Component {
  state = { messageValue: "", showResponse: false, responseStatus: false };

  handleMessageChange = e => {
    this.setState({
      messageValue: e.target.value
    });
  };

  //   NOTE: currently the "require" on the textarea doesn't function
  //   Currently simply handling the bug in handleSubmit()
  handleSubmit = event => {
    event.preventDefault();
    const { messageValue } = this.state;
    var currentComponent = this;
    var newState = Object.assign({}, currentComponent.state);

    if (this.props.courseheading === "SPAN 101 / LING 120") {
      newState.showResponse = true;
      newState.responseStatus = false;
      currentComponent.setState(newState);
    } else if (this.state.messageValue === "") {
      alert("Please enter a message.");
    } else {
      var params = {
        messageValue: messageValue,
        courseHeading: this.props.courseheading
      };
      doRequestAndUpdate();
    }

    async function doRequestAndUpdate() {
      let result = await makeRequest(
        "POST",
        "https://brody.linguatorium.com/courses/blackbox"
      );
      newState.showResponse = true;
      newState.responseStatus = true;
      newState.messageValue = "";
      currentComponent.setState(newState);
    }

    function makeRequest(method, url) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject({
              status: this.status,
              statusText: xhr.statusText
            });
          }
        };
        xhr.onerror = function() {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        };
        xhr.send(JSON.stringify(params));
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col mt-4">
              <h2 className="text-center">Welcome, {this.props.givenname}!</h2>
              <h3>Black Box</h3>
              <p className="my-0">
                Use the "Black Box" below to send your instructor an{" "}
                <u>anonymous</u> message.
              </p>
              <p className="mt-0">
                <i>Note: Your instructor will reply to the entire class.</i>
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={this.handleSubmit}>
          <div className="container boxes blackbox-container">
            <div className="row d-flex justify-content-center mt-3">
              <div className="col-12">
                <button
                  className="btn btn-sm float-right mb-1"
                  id="blackboxSendBtn"
                  type="button"
                  data-toggle="modal"
                  data-target="#exampleModalCenter"
                >
                  Send <i class="far fa-paper-plane"></i>
                </button>
                <div
                  class="modal fade"
                  id="exampleModalCenter"
                  tabIndex="-1"
                  role="dialog"
                  aria-labelledby="exampleModalCenterTitle"
                  aria-hidden="true"
                >
                  <div
                    class="modal-dialog modal-dialog-centered"
                    role="document"
                  >
                    <div class="modal-content blackbox-modal">
                      <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLongTitle">
                          Send anonymous message?
                        </h5>
                        <button
                          type="button"
                          class="close"
                          data-dismiss="modal"
                          aria-label="Close"
                        >
                          <span aria-hidden="true" id="blackboxCloseBtn">
                            &times;
                          </span>
                        </button>
                      </div>
                      <div class="modal-body">
                        <p>
                          Are you sure you want to send this Black Box message
                          to your instructor?
                        </p>
                        <p>This can't be undone.</p>
                      </div>
                      <div class="modal-footer">
                        <button
                          type="button"
                          class="btn btn-secondary"
                          data-dismiss="modal"
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          class="btn btn-danger"
                          data-dismiss="modal"
                          onClick={this.handleSubmit}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label htmlFor="blackbox message"></label>
                  <textarea
                    className="form-control"
                    rows="5"
                    class="w-100 blackbox"
                    placeholder="Enter anonymous message here"
                    onChange={this.handleMessageChange}
                    value={this.state.messageValue}
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          {this.state.showResponse ? (
            this.state.responseStatus ? (
              <div className="container">
                <div className="row">
                  <div className="col mt-3">
                    <h5 className="text-danger font-weight-bold">
                      Thank you. Your instructor will respond to your message
                      soon.
                    </h5>
                  </div>
                </div>
              </div>
            ) : (
              <div className="container">
                <div className="row">
                  <div className="col mt-3">
                    <h5 className="text-danger font-weight-bold">
                      Sorry, but it looks like you aren't on the course roster.
                    </h5>
                    <h5 className="text-danger font-weight-bold">
                      If this is by mistake, please contact your instructor
                      directly at{" "}
                      <span className="text-primary">
                        <u>btdingel@iastate.edu</u>
                      </span>
                      .
                    </h5>
                  </div>
                </div>
              </div>
            )
          ) : null}
        </form>
      </React.Fragment>
    );
  }
}

export default Blackbox;
