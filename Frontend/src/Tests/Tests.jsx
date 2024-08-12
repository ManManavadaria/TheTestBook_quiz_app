import React from "react";
import Navbar from "../components/Navbar";
import Test from "../components/Test";
import Footer from "../components/Footer";
function Tests() {
  return (
    <>
      <Navbar />
      {/* <div className=" min-h-screen"> */}
        <Test />
      {/* </div> */}
      <Footer />
    </>
  );
}

export default Tests;
