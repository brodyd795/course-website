import React from "react";

const HeaderLoggedOut = () => {
	return (
		<React.Fragment>
			<div className="jumbotron jumbotron-fluid mb-0 p-4">
				<div className="container">
					<div className="row align-self-center text-center text-md-left">
						<div className="col-12">
							<h1>
								<a
									href="https://dingel.dev/courses"
									className="topHeading"
									target="_blank">
									LING 120 / SPAN 101
								</a>
							</h1>
							<h4>
								<a href="https://dingel.dev/courses" className="topHeading">
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
						<li className="nav-item active">
							<a className="nav-link" href="https://dingel.dev/courses">
								Home <span className="sr-only">(current)</span>
							</a>
						</li>
					</ul>
					<a href="/login" className="btn btn-sm btn-dark login-btn">
						Login <i className="fas fa-sign-in-alt"></i>
					</a>
				</div>
			</nav>
		</React.Fragment>
	);
};

export default HeaderLoggedOut;
