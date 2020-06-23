import React, { Component } from "react";

class NavBar extends Component {
  render() {
    return (
      <nav class="navbar navbar-expand-md navbar-light">
        <a class="navbar-brand" href="#"></a>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <a class="nav-link" href="#">
                Home <span class="sr-only">(current)</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                Assignments
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                Sandbox
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                Grades
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                Attendance
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                Black Box
              </a>
            </li>
          </ul>
          <form class="form-inline my-2 my-lg-0">
            <button class="btn btn-sm btn-dark float-right">
              Login <i class="fas fa-sign-in-alt"></i>
            </button>
          </form>
        </div>
      </nav>
    );
  }
}

export default NavBar;
