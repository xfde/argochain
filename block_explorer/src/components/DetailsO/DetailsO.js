import { useEffect, useState } from "react";
import "./DetailsO.scss";
function DetailsO(data) {
  return (
    <div className="scrollable">
      <pre>{JSON.stringify(data, null, 1)}</pre>
    </div>
  );
}

export default DetailsO;
