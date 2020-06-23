import React, { Component } from "react";
import RegexBox from "./regexbox";
import TestStringBox from "./teststringbox";

class SandBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      regexValue: "",
      testStringValue: "",
      outputValue: "",
      keys: []
    };
  }

  handleRegexChange = e => {
    let newState = Object.assign({}, this.state);
    newState.regexValue = e.target.value;
    this.setState(newState);
  };

  handleTestStringChange = e => {
    let newState = Object.assign({}, this.state);
    newState.testStringValue = e.target.value;
    this.setState(newState);
  };

  handleResetClick = () => {
    this.setState({
      regexValue: "",
      testStringValue: "",
      outputValue: ""
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    const { regexValue, testStringValue } = this.state;
    var currentComponent = this;

    validateInput(regexValue);

    function validateInput(regexValue) {
      try {
        var regexArr = regexValue
          .trim()
          .split(/\r?\n/)
          .filter(line => !line.startsWith("//"));
        var testString = testStringValue;
        for (var i in regexArr) {
          var regexStr = regexArr[i];
          var regexMatch = regexStr.replace(/s\/(.*?)\/.*?\/\w+$/, "$1");
          var regexReplace = regexStr.replace(/s\/.*?\/(.*?)\/\w+$/, "$1");
          var regexFlags = regexStr.replace(/s\/.*?\/.*?\/(\w*?)$/, "$1");
          var realRegex = new RegExp(regexMatch, regexFlags);
          testString = testString.replace(realRegex, regexReplace);
        }

        let newState = Object.assign({}, currentComponent.state);
        newState.outputValue = testString;
        currentComponent.setState(newState);
      } catch {
        alert(
          "The regular expressions you have entered are not valid. Please check your syntax and submit again."
        );
      }
    }
  };

  // TODO: weird bug, likely to never be encountered by target audience
  // if Command + Shift + arrow is used to highlight a range,
  // and Command + / is subsequently used to comment out the range,
  // and Command is not released, then Command + Shift or Command + Arrow
  //will continue to commment out the range until Command is released (weird!)
  handleKeyDown = e => {
    let newState = Object.assign({}, this.state);
    newState.keys[e.keyCode] = e.keyCode;

    var keysArray = this.getNumberArray(newState.keys);
    var inputValue = document.getElementById("regexBox");

    var inputValueChars = inputValue.value.split("");

    // if keys pressed are Mac Command (left or right) or Windows Control + '/'
    if (
      (keysArray.includes(91) && keysArray.includes(191)) ||
      (keysArray.includes(93) && keysArray.includes(191)) ||
      (keysArray.includes(17) && keysArray.includes(191))
    ) {
      // get array of lines from text field
      var lines = inputValue.value.split("\n");

      // get indices of newlines (and manually add one at index 0 so that we can detect comments on the first line)
      var regex = /\n/g;
      var result = [];
      var newLineIndices = [0];
      while ((result = regex.exec(inputValue.value))) {
        newLineIndices.push(result.index);
      }

      // get cursor/selection position
      var startPos = inputValue.selectionStart;
      var endPos = inputValue.selectionEnd - 1;
      // take care of single cursor location (nothing highlighted)
      endPos = startPos == endPos + 1 ? startPos : endPos;

      // find first and last lines in selection to later put comment in
      var lowestLine, highestLine;
      for (var i = 0; i < newLineIndices.length; i++) {
        if (newLineIndices[i] <= startPos) {
          lowestLine = i;
        }
        if (newLineIndices[i] <= endPos) {
          highestLine = i;
        }
      }

      // when the cursor is at the end of a line, it thinks it should put the '//' after the newline
      // so, move it forward by one manually
      if (inputValueChars[endPos] == "\n") {
        lowestLine -= 1;
        highestLine -= 1;
      }

      // need to track number of '//' changes to reset cursor position later
      var changes;
      highestLine != lowestLine ? (changes = 1) : (changes = 0);
      // var changes = 0;

      // go through all lines, and if it's in the range of selection, change the line
      // track changes so that cursor position gets correctly set later
      for (var i = 0; i < lines.length; i++) {
        if (lowestLine <= i && i <= highestLine) {
          if (/^\/\//.test(lines[i])) {
            lines[i] = lines[i].replace(/^\/\//, "");
            changes -= 2;
          } else {
            lines[i] = lines[i].replace(/^/, "//");
            changes += 2;
          }
        }
      }

      // put lines back into textarea
      newState.regexValue = lines.join("\n");

      // put cursor to original position
      function setCaretPosition(elemId, caretPos) {
        var el = document.getElementById(elemId);
        if (el !== null) {
          if (el.createTextRange) {
            var range = el.createTextRange();
            range.move("character", caretPos);
            range.select();
            return true;
          } else {
            if (el.selectionStart || el.selectionStart === 0) {
              el.focus();
              el.setSelectionRange(caretPos, caretPos);
              return true;
            } else {
              el.focus();
              return false;
            }
          }
        }
      }
      this.setState(newState, () => {
        setCaretPosition("regexBox", endPos + changes);
      });
    }
  };

  handleKeyUp = e => {
    this.state.keys[e.keyCode] = false;
    var keysArray = this.getNumberArray(this.state.keys);
    if (
      (e.keyCode == 91 && keysArray.includes(191)) ||
      (e.keyCode == 93 && keysArray.includes(191))
    ) {
      this.state.keys[191] = false;
      keysArray = this.getNumberArray(this.state.keys);
    }
  };

  getNumberArray = arr => {
    var newArr = new Array();
    for (var i = 0; i < arr.length; i++) {
      if (typeof arr[i] == "number") {
        newArr[newArr.length] = arr[i];
      }
    }
    return newArr;
  };

  render() {
    return (
      <React.Fragment>
        <div class="container">
          <div class="row">
            <div class="col mt-4">
              <h2 className="text-center">Welcome, {this.props.givenname}!</h2>
              <h3>Sandbox</h3>
              <p class="my-0">
                Use the Sandbox below to test your regular expressions.
              </p>
              <p className="mt-1">Enter one regular expression per line using this format: <code>s/[search]/[replace]/[flags]</code></p>
              <p><b>Fun fact</b>: comment out lines using Cmd + / (Mac) or Ctrl + / (Windows)!</p>
            </div>
          </div>
        </div>
        <div class="container boxes">
          <form onSubmit={this.handleSubmit}>
            <RegexBox
              onResetClick={this.handleResetClick}
              onRegexChange={this.handleRegexChange}
              regexValue={this.state.regexValue}
              onKeyDown={this.handleKeyDown}
              onKeyUp={this.handleKeyUp}
            />
            <TestStringBox
              onTestStringChange={this.handleTestStringChange}
              testStringValue={this.state.testStringValue}
              outputValue={this.state.outputValue}
            />
          </form>
        </div>
      </React.Fragment>
    );
  }
}

export default SandBox;
