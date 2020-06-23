import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./style.css";
import { Renderer } from "./renderer";

import HeaderLoggedIn from "./components/headerLoggedIn";
import HeaderLoggedOut from "./components/headerLoggedOut";
// import NavBar from "./components/navbar";
import Home from "./components/home";
import Assignments from "./components/assignments";
import SandBox from "./components/sandbox";
import Attendance from "./components/attendance";
import AttendanceMaster from "./components/attendance-master";
import Blackbox from "./components/blackbox";
import Grades from "./components/grades";
import Appointment from "./components/appointment";
import Err from "./components/err";

const renderer = new Renderer();

renderer.render(HeaderLoggedIn, "headerLoggedIn");
renderer.render(HeaderLoggedOut, "headerLoggedOut");
renderer.render(Home, "home");
renderer.render(Assignments, "assignments");
renderer.render(SandBox, "sandbox");
renderer.render(Attendance, "attendance");
renderer.render(AttendanceMaster, "attendanceMaster");
renderer.render(Blackbox, "blackbox");
renderer.render(Grades, "grades");
renderer.render(Appointment, "appointment");
renderer.render(Err, "err");
