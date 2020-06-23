import React, { Component } from "react";
const request = require("request");
const fs = require("fs");

class Grades extends Component {
  constructor(props) {
    super(props);
    this.state = { isInRoster: true };
  }

  render() {
    var grades = this.props.grades;

    var { basicJSCount, regexCount, debugCount, totalCount } = grades[0];

    var {
      haigyPaigyScore,
      turkishPluralsScore,
      corpusCleaningScore,
      articleReplacementScore,
      averageScore
    } = grades[1];

    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col mt-4">
              <h2 className="text-center">Welcome, {this.props.givenname}!</h2>
              <h3>Grades</h3>
              <p className="my-0">
                Your grades for Assignment 4 and freeCodeCamp can be seen below.
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
              {grades === "Not in roster" ? (
                <React.Fragment>
                  <h5>Sorry, you aren't on the course roster.</h5>
                  <p>
                    If this is a mistake, please contact your instructor
                    directly.
                  </p>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <h5>Regex Grades</h5>
                  <p>Article Replacement: {articleReplacementScore || "0"}%</p>
                  <p>Haigy Paigy: {haigyPaigyScore || "0"}%</p>
                  <p>Turkish Plurals: {turkishPluralsScore || "0"}%</p>
                  <p>Corpus Cleaning: {corpusCleaningScore || "0"}%</p>
                  <p>Total: {averageScore || "0"}%</p>

                  <hr></hr>
                  <h5>FreeCodeCamp Grades</h5>
                  <p>
                    {grades[0] === "No fCC challenges completed yet." ? (
                      <React.Fragment>
                        <p>
                          Please set up an account at{" "}
                          <a
                            href="https://www.freecodecamp.org/"
                            target="_blank"
                          >
                            freecodecamp.org
                          </a>
                          .
                        </p>
                        <p>
                          Make sure your username is your net-ID followed by
                          "_ling120" (e.g., johndoe_ling120).
                        </p>
                        <p>
                          Also make sure to set your Profile and Timeline to
                          "public" in the{" "}
                          <a
                            href="https://www.freecodecamp.org/settings/"
                            target="_blank"
                          >
                            settings
                          </a>
                          .
                        </p>
                      </React.Fragment>
                    ) : grades[0] === "Not public" ? (
                      <React.Fragment>
                        <p>
                          Please set your Profile and Timeline to "public" in
                          the{" "}
                          <a
                            href="https://www.freecodecamp.org/settings/"
                            target="_blank"
                          >
                            settings
                          </a>
                          .
                        </p>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <p>Basic JavaScript: {basicJSCount * 100}%</p>
                        <p>Regular Expressions: {regexCount * 100}%</p>
                        <p>Debugging: {debugCount * 100}%</p>
                        <p>Total: {totalCount * 100}%</p>
                      </React.Fragment>
                    )}
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

export default Grades;
