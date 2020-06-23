import React, { Component } from "react";

class ResultsBox extends Component {
  state = {};
  render() {
    return (
      <div className="row mb-2 mt-3">
        <div className="col-sm-12 col-md-9 col-lg-6">
          <div className="results-div p-2 position-relative">
            <div className="results-score-div position-absolute border border-dark rounded d-flex align-items-center mx-2 bg-secondary">
              <p className="m-2 text-white">{this.props.scoreValue + "%"}</p>
            </div>
            <div>{this.props.passFailValue}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default ResultsBox;
