import React, { Component } from "react";

class RegexBox extends Component {
  state = {};

  render() {
    return (
      <div className="row mt-3">
        <div className="col-12">
          <button
            className="btn btn-sm btn-primary float-right regex-btn mb-1"
            type="submit"
          >
            Test Regular Expressions <i className="fas fa-play"></i>
          </button>
          <button
            data-toggle="modal"
            data-target="#exampleModalCenter"
            type="button"
            className="btn btn-sm btn-danger float-right regex-btn mb-1 mr-1"
          >
            Reset <i className="fas fa-exclamation-circle"></i>
          </button>
          <div
            className="modal fade"
            id="exampleModalCenter"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="exampleModalCenterTitle"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLongTitle">
                    Reset all content?
                  </h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to reset all of your regular
                    expressions and test strings?
                  </p>
                  <p>This can't be undone.</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    data-dismiss="modal"
                    onClick={this.props.onResetClick}
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="regular expressions"></label>
            <textarea
              className="form-control"
              rows="5"
              className="w-100"
              id="regexBox"
              placeholder="Enter regex here"
              onChange={this.props.onRegexChange}
              onKeyDown={this.props.onKeyDown}
              onKeyUp={this.props.onKeyUp}
              value={this.props.regexValue}
              tabIndex="0"
              required
            ></textarea>
          </div>
        </div>
      </div>
    );
  }
}

export default RegexBox;
