import React, { Component } from "react";
import Select from "react-select";
import RegexBox from "./regexbox";
import ResultsBox from "./resultsbox";

const assignmentOptions = [
	{ value: "articleReplacement", label: "Article Replacement" },
	{ value: "haigyPaigy", label: "Haigy Paigy" },
	{ value: "turkishPlurals", label: "Turkish Plurals" },
	{ value: "corpusCleaning", label: "Corpus Cleaning" },
];

class Assignments extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showResults: false,
			regexValue: "",
			assignmentValue: "",
			scoreValue: "",
			passFailValue: {},
			keys: [],
		};
	}

	handleRegexChange = (e) => {
		let newState = Object.assign({}, this.state);
		newState.regexValue = e.target.value;
		this.setState(newState);
	};

	handleAssignmentChange = (e) => {
		let newState = Object.assign({}, this.state);
		newState.assignmentValue = e;
		this.setState(newState);
	};

	handleResetClick = () => {
		this.setState({
			showResults: false,
			regexValue: "",
			assignmentValue: "",
			scoreValue: "",
			passFailValue: [],
		});
	};

	handleSubmit = (event) => {
		event.preventDefault();
		const { regexValue, assignmentValue } = this.state;
		var currentComponent = this;
		var newState = Object.assign({}, currentComponent.state);
		var params = {
			regexValue: regexValue,
			assignmentValue: assignmentValue,
		};
		var tempPassFailValue = [];

		validateInput(regexValue);

		function validateInput(regexValue) {
			try {
				var regexArr = regexValue
					.split(/\r?\n/)
					.filter((line) => !line.startsWith("//"));
				for (let j = 0; j < regexArr.length; j++) {
					let regexpStr = regexArr[j];
					var regexMatch = regexpStr.replace(/s\/(.*?)\/.*?\/\w+$/, "$1"); // get the MATCH from user input line
					var regexReplace = regexpStr.replace(/s\/.*?\/(.*?)\/\w+$/, "$1"); // get the REPLACE from user input line
					var regexFlags = regexpStr.replace(/s\/.*?\/.*?\/(\w*?)$/, "$1"); // get the FLAGS from user input line
					var realRegex = new RegExp(regexMatch, regexFlags); // create regex object using the MATCH and FLAGS
				}
				doRequestAndUpdate();
			} catch (err) {
				if (err.name === "SyntaxError") {
					alert(
						"The regular expressions you have entered are not valid. Please check your syntax and submit again."
					);
				} else {
					alert("An error has occurred. Please try refreshing the page.");
				}
			}
		}

		// function doSubmit() {
		//   doRequestAndUpdate();
		// }

		async function doRequestAndUpdate() {
			let result = await makeRequest(
				"POST",
				"https://courses.dingel.dev/regex-results"
			);

			var responseData = JSON.parse(result);
			newState.scoreValue = responseData.score;

			for (var i = 0; i < Object.keys(responseData.passFail).length; i++) {
				var item = "Test " + i;
				if (responseData["passFail"][item] === "PASS") {
					tempPassFailValue.push(
						<p className="mb-0" key={i}>
							{item}:&nbsp;
							<span className="text-success">PASS</span>
						</p>
					);
				} else {
					tempPassFailValue.push(
						<p className="mb-0" key={i}>
							{item}:&nbsp;
							<span className="text-danger">FAIL</span>
						</p>
					);
				}
			}

			newState.passFailValue = tempPassFailValue;
			newState.showResults = true;
			currentComponent.setState(newState);

			// xhr.onload = function() {
			//   console.log(xhr.responseText);
			// };
		}

		function makeRequest(method, url) {
			return new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open(method, url, true);
				xhr.setRequestHeader("Content-type", "application/json");
				xhr.onreadystatechange = () => {
					if (xhr.readyState === 4 && xhr.status === 200) {
						resolve(xhr.responseText);
					} else {
						reject({
							status: this.status,
							statusText: xhr.statusText,
						});
					}
				};
				xhr.onerror = function () {
					reject({
						status: this.status,
						statusText: xhr.statusText,
					});
				};
				xhr.send(JSON.stringify(params));
			});
		}
	};

	handleKeyDown = (e) => {
		// TODO: weird bug, likely to never be encountered by target audience
		// if Command + Shift + arrow is used to highlight a range,
		// and Command + / is subsequently used to comment out the range,
		// and Command is not released, then Command + Shift or Command + Arrow
		//will continue to commment out the range until Command is released (weird!)
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

	handleKeyUp = (e) => {
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

	getNumberArray = (arr) => {
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
				<form onSubmit={this.handleSubmit}>
					<div className="container">
						<div className="row">
							<div className="col mt-4">
								<h2 className="text-center">
									Welcome, {this.props.givenname}!
								</h2>
								<h3>Assignments</h3>
								<p className="my-0 d-inline">
									Please choose from the following
									assignments:&nbsp;&nbsp;&nbsp;
								</p>
								<div className="form-group d-inline position-relative">
									<label htmlFor="assignmentChoice"></label>
									<Select
										options={assignmentOptions}
										className="assignment-select"
										value={this.state.assignmentValue}
										onChange={this.handleAssignmentChange}
									/>
									<input
										required
										className="select-require"
										value={this.state.assignmentValue}
									/>
								</div>
								<p className="my-0">
									Assignment descriptions can be found{" "}
									<a
										href="/resources/120-regex-assignments.pdf"
										target="_blank">
										here
									</a>
									.
								</p>
								<p className="mt-1">
									Enter one regular expression per line using this format:{" "}
									<code>s/[search]/[replace]/[flags]</code>
								</p>
								<p>
									<b>Fun fact</b>: comment out lines using Cmd + / (Mac) or Ctrl
									+ / (Windows)!
								</p>
							</div>
						</div>
					</div>
					<div className="container boxes">
						<RegexBox
							onRegexChange={this.handleRegexChange}
							onResetClick={this.handleResetClick}
							regexValue={this.state.regexValue}
							onKeyDown={this.handleKeyDown}
							onKeyUp={this.handleKeyUp}
						/>
						{this.state.showResults ? (
							<ResultsBox
								scoreValue={this.state.scoreValue}
								passFailValue={this.state.passFailValue}
							/>
						) : null}
					</div>
				</form>
			</React.Fragment>
		);
	}
}

export default Assignments;
