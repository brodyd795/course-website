import React, { Component } from "react";

class Attendance extends Component {
  state = {};
  render() {
    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col mt-4">
              <h2 className="text-center">Welcome, {this.props.givenname}!</h2>
              <h3>Attendance</h3>
              <p className="my-0">
                Your attendance record in {this.props.heading} can be seen
                below.
              </p>
              <p className="mt-0">
                Questions? Contact your instructor via email at&nbsp;
                <span className="text-primary">
                  <u>btdingel@iastate.edu</u>.
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="container boxes py-2">
          <div className="row d-flex justify-content-center">
            <div className="col-md-6 col-sm-8 m-2 p-2 px-md-5 attendance-div">
              {this.props.records === false ? (
                <React.Fragment>
                  <h5 className="mt-2 mb-3">
                    Sorry, you aren't on the course roster.
                  </h5>
                  <p>
                    If this is a mistake, please contact your instructor
                    directly.
                  </p>
                  <p>
                    <b>NOTE</b>: attendance will not be taken during Week 1 of
                    classes. Your record will be reflected beginning Week 2.
                  </p>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.props.records.absences === 0 ? (
                    <p>Absences: 0</p>
                  ) : (
                    <p>
                      Absences: {this.props.records.absences} ––{" "}
                      {this.props.records.absencesList.join(", ")}
                    </p>
                  )}
                  {this.props.records.tardies === 0 ? (
                    <p className="my-0">Tardies: 0</p>
                  ) : (
                    <p className="my-0">
                      Tardies: {this.props.records.tardies} ––{" "}
                      {this.props.records.tardiesList.join(", ")}
                    </p>
                  )}

                  <p>
                    <small className="ml-3">
                      <i>*Note: 3 tardies constitute 1 absence</i>
                    </small>
                  </p>
                  <p>
                    Combined absences and tardies: {this.props.records.combined}
                  </p>
                  <hr></hr>
                  <p>
                    Amount to be deducted from final grade:{" "}
                    {this.props.records.subtracted}%
                  </p>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Attendance;
