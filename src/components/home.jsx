import React, { Component } from "react";

class Home extends Component {
  state = {};
  render() {
    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col mt-4">
              <h2 className="text-center">Welcome, {this.props.givenname}!</h2>
              <h3>Home</h3>
              <p className="my-0 d-inline">
                For students in SPAN 101 and LING 120
              </p>
              <p className="mt-2 mb-0">
                Log in though Google with your ISU email to get started
              </p>
            </div>
          </div>
        </div>
        <div className="container boxes py-2 mt-3">
          <div className="row d-flex justify-content-center">
            <div className="col-md-8 col-sm-8 m-2 p-2 px-md-5 attendance-div">
              <div className="container">
                <div className="row">
                  <div className="col-12 col-lg-6 d-flex home-text">
                    <div className="container">
                      <div className="text-center">
                        <h5 className="mb-3">
                          <b>LING 120</b>
                        </h5>
                      </div>
                      <div className="row">
                        <ul className="pl-1 fa-ul ml-1">
                          <li className="mb-2">
                            <span className="fa-li">
                              <i class="fas fa-check"></i>
                            </span>
                            Complete Regex assignments
                          </li>
                          <li className="mb-2">
                            <span className="fa-li">
                              <i class="fas fa-check"></i>
                            </span>{" "}
                            Check your grades
                          </li>
                          <li className="mb-2">
                            <span className="fa-li">
                              <i class="fas fa-check"></i>
                            </span>
                            Play in the Regex Sandbox
                          </li>
                          <li className="mb-2">
                            <span className="fa-li">
                              <i class="fas fa-check"></i>
                            </span>
                            Send your instructor an anonymous message
                          </li>
                          <li className="mb-2">
                            <span className="fa-li">
                              <i class="fas fa-check"></i>
                            </span>{" "}
                            Check your attendance
                          </li>
                          <li className="mb-2">
                            <span className="fa-li">
                              <i class="fas fa-check"></i>
                            </span>{" "}
                            Schedule an appointment
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6 d-flex home-text">
                    <div className="container">
                      <div className="text-center">
                        <h5 className="mb-3">
                          <b>SPAN 101</b>
                        </h5>
                      </div>
                      <div className="row">
                        <ul className="pl-1 fa-ul">
                          <li className="mb-2">
                            <span className="fa-li">
                              <i class="fas fa-check"></i>
                            </span>
                            Check your attendance record
                          </li>
                          <li className="mb-2">
                            <span className="fa-li">
                              <i class="fas fa-check"></i>
                            </span>
                            Send your instructor an anonymous message
                          </li>
                          <li className="mb-2">
                            <span className="fa-li">
                              <i class="fas fa-check"></i>
                            </span>
                            Schedule an appointment
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Home;
