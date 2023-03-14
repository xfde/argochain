import React, { useEffect } from "react";
import "./error.scss";
function ErrorPage(error) {
  useEffect(() => {
    console.log(error.error);
  }, []);
  return (
    <div className="canvas">
      <div id="notfound">
        <div className="notfound">
          <div className="notfound-404">
            <h3>Oops! Something went wrong</h3>
          </div>
          <h2>Status: {error.error.status}</h2>
          <a className="backhome" href="/">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
