import React from "react";

const HeaderLoggedIn = (props) => {
	return (
		<React.Fragment>
			<div className="jumbotron jumbotron-fluid mb-0 p-4">
				<div className="container">
					<div className="row align-self-center text-center text-md-left">
						<div className="col-12">
							<h1>
								<a href="https://courses.dingel.dev" className="topHeading">
									{props.courseheading || "SPAN 101 / LING 120"}
								</a>
							</h1>
							<h4>
								<a
									href="https://courses.dingel.dev"
									className="topHeading"
									target="_blank">
									Courses with Brody
								</a>
							</h4>
						</div>
					</div>
				</div>
			</div>
			<nav className="navbar navbar-expand-md navbar-light">
				<a className="navbar-brand" href="#"></a>
				<button
					className="navbar-toggler"
					type="button"
					data-toggle="collapse"
					data-target="#navbarSupportedContent"
					aria-controls="navbarSupportedContent"
					aria-expanded="false"
					aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="navbarSupportedContent">
					<ul className="navbar-nav mr-auto">
						<li
							className={
								"nav-item " + (props.currenttab === "Home" ? "active " : "")
							}>
							<a className="nav-link" href="https://courses.dingel.dev">
								Home
							</a>
						</li>
						<li
							className={
								"nav-item " +
								(props.currenttab === "Assignments" ? "active " : "") +
								(props.courseheading === "Español 101" ? "d-none" : "")
							}>
							<a
								className="nav-link"
								href="https://courses.dingel.dev/assignments">
								Assignments
							</a>
						</li>
						<li
							className={
								"nav-item " +
								(props.currenttab === "Sandbox" ? "active " : "") +
								(props.courseheading === "Español 101" ? "d-none" : "")
							}>
							<a className="nav-link" href="https://courses.dingel.dev/sandbox">
								Sandbox
							</a>
						</li>
						<li
							className={
								"nav-item " +
								(props.currenttab === "Grades" ? "active " : "") +
								(props.courseheading === "Español 101" ? "d-none" : "")
							}>
							<a className="nav-link" href="https://courses.dingel.dev/grades">
								Grades
							</a>
						</li>
						<li
							className={
								"nav-item " +
								(props.currenttab === "Attendance" ? "active " : "")
							}>
							<a
								className="nav-link"
								href="https://courses.dingel.dev/attendance">
								Attendance
							</a>
						</li>
						<li
							className={
								"nav-item " +
								(props.currenttab === "Black Box" ? "active " : "")
							}>
							<a
								className="nav-link"
								href="https://courses.dingel.dev/blackbox">
								Black Box
							</a>
						</li>
						<li
							className={
								"nav-item " +
								(props.currenttab === "Appointment" ? "active " : "")
							}>
							<a
								className="nav-link"
								href="https://courses.dingel.dev/appointment">
								Appointment
							</a>
						</li>
					</ul>
					<a href="/logout" className="btn btn-sm btn-dark login-btn">
						Logout <i className="fas fa-sign-in-alt"></i>
					</a>
				</div>
			</nav>
		</React.Fragment>
	);
};

export default HeaderLoggedIn;
