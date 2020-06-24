import React, { Component } from "react";

class Err extends Component {
	state = {};
	render() {
		return (
			<React.Fragment>
				<div className="container">
					<div className="row">
						<div className="col mt-4">
							<h2 className="text-center mt-4">That's awkward...</h2>
							<h1 className="text-center mt-4">
								<u>404</u>
							</h1>
							<h5 className="text-center mt-4">
								The page you were looking for couldn't be found.
							</h5>
							<h5 className="text-center mt-4">
								If you're lost, try heading{" "}
								<a href="https://dingel.dev/" target="_blank">
									home
								</a>
								.
							</h5>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default Err;
