import React, { Component } from "react";

class TestStringBox extends Component {
  state = {};
  render() {
    return (
      <div class="row mb-2 mt-3">
        <div class="col-md-6 p-0">
          <div class="container">
            <div class="row">
              <div class="col-12">
                <div class="form-group">
                  <label htmlFor="test strings"></label>
                  <textarea
                    className="form-control form-box"
                    rows="5"
                    class="w-100"
                    placeholder="Enter test strings"
                    onChange={this.props.onTestStringChange}
                    value={this.props.testStringValue}
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 p-0">
          <div class="container">
            <div class="row">
              <div class="col-12">
                <textarea
                  class="w-100"
                  rows="5"
                  placeholder="See regex test output"
                  value={this.props.outputValue}
                  readOnly
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TestStringBox;
