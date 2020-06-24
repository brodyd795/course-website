import React, { Component } from "react";
import Select, { components } from "react-select";

class Appointment extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dateValue: new Date().toISOString().substring(0, 10),
			timeSlotOption: "",
			timeSlotOptions: this.makeAvailableSlotsPretty(
				new Date().toISOString().substring(0, 10)
			),
			reason: "",
			showResult: false,
		};
	}

	makeAvailableSlotsPretty = (day) => {
		let availableSlotsPretty = [];
		for (let i of this.props.availableslots[day]) {
			let dateObj = new Date(i);
			let usrHrs =
				dateObj.getHours() > 12 ? dateObj.getHours() - 12 : dateObj.getHours();
			let usrMins = /^0$/.test(dateObj.getMinutes())
				? `${dateObj.getMinutes()}0`
				: dateObj.getMinutes();
			let usrAmPm = dateObj.getHours() < 12 ? "am" : "pm";
			let usrDate = `${usrHrs}:${usrMins}${usrAmPm}`;
			availableSlotsPretty.push({
				value: dateObj.toISOString(),
				label: usrDate,
			});
		}
		return availableSlotsPretty;
	};

	handleDateChange = (e) => {
		if (this.props.availableslots[e.target.value].length === 0) {
			alert("Sorry, no times are available for this day.");
		} else {
			let newState = Object.assign({}, this.state);
			newState.dateValue = e.target.value;
			newState.timeSlotOptions = this.makeAvailableSlotsPretty(e.target.value);
			newState.timeSlotOption = "";
			this.setState(newState);
		}
	};

	handleReasonChange = (e) => {
		let newState = Object.assign({}, this.state);
		newState.reason = e.target.value;
		this.setState(newState);
	};

	handleTimeSlotChange = (e) => {
		let newState = Object.assign({}, this.state);
		newState.timeSlotOption = e;
		this.setState(newState);
	};

	handleSubmit = (event) => {
		event.preventDefault();
		// alert(`Date/time selected: ${selection}`);
		var currentComponent = this;
		var newState = Object.assign({}, currentComponent.state);

		var params = {
			selection: this.state.timeSlotOption,
			reason: this.state.reason,
		};
		doRequestAndUpdate();

		async function doRequestAndUpdate() {
			let result = await makeRequest(
				"POST",
				"https://dingel.dev/courses/appointment"
			);

			// newState.dateValue = new Date().toISOString().substring(0, 10);
			// newState.timeSlotOption = "";
			// newState.timeSlotOptions = this.makeAvailableSlotsPretty(
			//   new Date().toISOString().substring(0, 10)
			// );
			// newState.reason = "";
			newState.showResult = true;

			currentComponent.setState(newState);

			// currentComponent.setState({
			//   dateValue: new Date().toISOString().substring(0, 10),
			//   timeSlotOption: "",
			//   timeSlotOptions: this.makeAvailableSlotsPretty(
			//     new Date().toISOString().substring(0, 10)
			//   ),
			//   reason: "",
			//   showResult: true
			// });
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

	render() {
		var minDate = new Date().toISOString().substring(0, 10);
		var date = new Date();
		date.setTime(date.getTime() + 14 * 86400000);
		var maxDate = date.toISOString().substring(0, 10);
		const dateSelected = this.state.dateValue;
		return (
			<React.Fragment>
				<div className="container">
					<div className="row">
						<div className="col mt-4">
							<h2 className="text-center">Welcome, {this.props.givenname}!</h2>
							<h3>Appointment</h3>
							<p className="my-0">
								Need to meet with your {this.props.heading} instructor?
							</p>
							<p className="mt-0">
								Select a time below that fits in your schedule (30min
								appointments).
							</p>
							<p className="mt-0">
								<b>Note:</b> you will receive a notification regarding whether
								your appointment has been approved or declined.
							</p>
						</div>
					</div>
				</div>
				<div className="container boxes py-2">
					<div className="row d-flex justify-content-center">
						<div className="col-md-6 col-sm-8 m-2 p-2 px-md-5 attendance-div">
							<form onSubmit={this.handleSubmit}>
								Select Date:{" "}
								<input
									type="date"
									name="apptDate"
									min={minDate}
									max={maxDate}
									value={dateSelected}
									onChange={this.handleDateChange}
									className="my-2"
								/>
								<label htmlFor="timeSlotOption"></label>
								<Select
									options={this.state.timeSlotOptions}
									className="timeslotSelect"
									value={this.state.timeSlotOption}
									onChange={this.handleTimeSlotChange}
									className="my-2"
								/>
								<input
									required
									className="select-require"
									value={this.state.timeSlotOption}
								/>
								<input
									type="text"
									name="reason"
									className="w-100 mb-2"
									placeholder="Reason for appointment..."
									onChange={this.handleReasonChange}
									required
								/>
								<input type="submit" className="mt-2" />
							</form>
							{this.state.showResult ? (
								<p className="mt-3 text-danger font-weight-bold">
									Thank you. Please check your email for an invitation to this
									appointment.
								</p>
							) : null}
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default Appointment;
