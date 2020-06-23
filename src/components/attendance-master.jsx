import React, { Component } from "react";

class AttendanceMaster extends Component {
  constructor(props) {
    super(props);
    this.handleSelectionSubmit = this.handleSelectionSubmit.bind(this);
    this.handleUpdateSubmit = this.handleUpdateSubmit.bind(this);
  }
  state = {
    course: "SPAN101",
    date: new Date()
      .toString()
      .replace(/^\w+? (\w+?) (\d+) (\d{4}).+$/, "$1_$2_$3"),
    receivedDate: "",
    receivedCourse: "",
    showResults: false,
    records: {},
    updateStatus: null
  };

  makeRequest = (method, url, params) => {
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
  };

  handleOptionChange(i, option) {
    let newState = Object.assign({}, this.state);
    newState.records[i][this.state.receivedDate] = option;
    this.setState(newState);
  }

  async handleSelectionSubmit(event) {
    event.preventDefault();
    let newState = Object.assign({}, this.state);
    var currentComponent = this;
    var { course, date } = this.state;
    if (/\w{3}_\d{2}_\d{4}/.test(date)) {
      var params = {
        course: course,
        date: date
      };
      let result = await this.makeRequest(
        "POST",
        "https://brody.linguatorium.com/courses/attendance-master",
        params
      );

      var responseData = JSON.parse(result);

      //##############
      //   var responseData = {
      //     date: "Dec_31_2019",
      //     records: [
      //       { name: "Brody Dingel", Dec_31_2019: "OK" },
      //       { name: "John Doe", Dec_31_2019: "T" }
      //     ]
      //   };
      //##############

      newState.records = responseData.records;
      newState.receivedDate = responseData.date;
      newState.receivedCourse = responseData.course;
      newState.showResults = true;

      currentComponent.setState(newState);
    } else {
      alert("Please reformat the date below in the form of mon_dd_yyyy");
    }
  }

  async handleUpdateSubmit(event) {
    event.preventDefault();
    let newState = Object.assign({}, this.state);
    var currentComponent = this;
    var { receivedCourse, receivedDate, records } = this.state;
    var params = {
      course: receivedCourse,
      date: receivedDate,
      records: records
    };
    let result = await this.makeRequest(
      "POST",
      "https://brody.linguatorium.com/courses/attendance-master-update",
      params
    );

    var responseData = JSON.parse(result);

    newState.updateStatus = responseData.updateStatus;
    console.log(newState.updateStatus);

    newState.showResults = false;

    currentComponent.setState(newState);
  }

  handleCourseChange = e => {
    let newState = Object.assign({}, this.state);
    newState.course = e.target.value;
    this.setState(newState);
  };

  handleDateChange = e => {
    let newState = Object.assign({}, this.state);
    newState.date = e.target.value;
    this.setState(newState);
  };

  render() {
    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col mt-4">
              <h2 className="text-center">Welcome, {this.props.givenname}!</h2>
              <h3>Attendance</h3>
            </div>
          </div>
        </div>
        <div className="container boxes py-2">
          <div className="row d-flex justify-content-center">
            <div className="col-md-6 col-sm-8 m-2 p-2 px-md-5 attendance-div">
              <form onSubmit={this.handleSelectionSubmit}>
                <p className="mb-0 d-inline mr-1">Choose course: </p>
                <input
                  type="radio"
                  value="SPAN101"
                  name="courseSelection"
                  checked={this.state.course === "SPAN101"}
                  onChange={this.handleCourseChange}
                  className=""
                  id="span101-radio-btn"
                />{" "}
                <label htmlFor="span101-radio-btn" className="px-2">
                  SPAN 101
                </label>
                <input
                  type="radio"
                  value="LING120"
                  name="courseSelection"
                  checked={this.state.course === "LING120"}
                  onChange={this.handleCourseChange}
                  className="ml-2"
                  id="ling120-radio-btn"
                />{" "}
                <label htmlFor="ling120-radio-btn" className="px-2">
                  LING 120
                </label>
                <div className="mt-2">
                  <p className="d-inline">Choose date: </p>
                  <input
                    type="text"
                    onChange={this.handleDateChange}
                    value={this.state.date}
                  />
                </div>
                <button type="submit">Submit</button>
              </form>

              {this.state.showResults ? (
                <div>
                  <form onSubmit={this.handleUpdateSubmit}>
                    {this.state.records.map((item, i) => {
                      return (
                        <div className="mt-3">
                          <p className="d-inline">{item["name"]} </p>
                          {/* <input
                            name="studentName"
                            value={item["name"]}
                            readOnly
                            required
                            tabIndex="-1"
                          /> */}
                          <input
                            type="radio"
                            name={item["name"]}
                            value="OK"
                            checked={
                              this.state.records[i][this.state.receivedDate] ===
                              "OK"
                            }
                            onChange={this.handleOptionChange.bind(
                              this,
                              i,
                              "OK"
                            )}
                            key={`OK_${i}`}
                            id={`OK_${i}`}
                            required
                            className=""
                          />
                          <label htmlFor={`OK_${i}`} className="px-2">
                            Present
                          </label>
                          <input
                            type="radio"
                            name={item["name"]}
                            value="A"
                            checked={
                              this.state.records[i][this.state.receivedDate] ===
                              "A"
                            }
                            onChange={this.handleOptionChange.bind(
                              this,
                              i,
                              "A"
                            )}
                            key={`A_${i}`}
                            id={`A_${i}`}
                            className=""
                          />
                          <label htmlFor={`A_${i}`} className="px-2">
                            Absent
                          </label>
                          <input
                            type="radio"
                            name={item["name"]}
                            value="T"
                            checked={
                              this.state.records[i][this.state.receivedDate] ===
                              "T"
                            }
                            onChange={this.handleOptionChange.bind(
                              this,
                              i,
                              "T"
                            )}
                            key={`T_${i}`}
                            id={`T_${i}`}
                            className=""
                          />
                          <label htmlFor={`T_${i}`} className="px-2">
                            Tardy
                          </label>
                          <br />
                        </div>
                      );
                    })}

                    <button type="submit">Submit</button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default AttendanceMaster;
