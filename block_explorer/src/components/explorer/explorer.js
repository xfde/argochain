import React, { useState } from "react";
import { useGetBlocksQuery } from "../../features/apiSlice";
import { Canvas, Node, Edge, MarkerArrow } from "reaflow";
import ErrorPage from "../error/error";
import "./explorer.scss";
import FloatingModal from "../floatingModal/floatingModal";

function Explorer() {
  const { data, error, isLoading } = useGetBlocksQuery();
  const [activeBlock, setActiveBlock] = useState({});
  const displayInfo = (id) => {
    setActiveBlock(data[id]);
  };
  if (isLoading) {
    return (
      <div class="lds-roller">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
  if (error) {
    return <ErrorPage error={error} />;
  }
  let nodes = data.map((node, index) => {
    return {
      id: index,
      hash: node["hash"],
      timestamp: node["timestamp"],
      signer: node["signer"],
      className: "BlockColours COMPLETED",
    };
  });
  return (
    <div className="boxin">
      <FloatingModal />
      <Canvas
        className="canvas"
        minZoom={0.001}
        maxZoom={3}
        pannable={true}
        maxHeight={800}
        nodes={nodes}
        edges={[]}
        node={
          <Node>
            {(event) => (
              <foreignObject
                height={125}
                width={200}
                x={300 * event.node.id}
                className={event.node.className}
              >
                <a
                  onClick={() => displayInfo(event.node.id)}
                  href="#modal"
                  role="button"
                  class="button__link"
                >
                  <div
                    style={{
                      padding: 10,
                      textAlign: "center",
                    }}
                  >
                    <p>Hash: {event.node.hash}</p>
                    <p>
                      Signer: {event.node.signer ? event.node.signer : "N/A"}
                    </p>
                    <p>
                      {event.node.timestamp
                        ? new Date(event.node.timestamp)
                            .toString()
                            .split(" ")
                            .slice(1, 5)
                            .join(" ")
                        : new Date()
                            .toString()
                            .split(" ")
                            .slice(1, 5)
                            .join(" ")}
                    </p>
                  </div>
                </a>
              </foreignObject>
            )}
          </Node>
        }
        arrow={<MarkerArrow style={{ fill: "#b1b1b7" }} />}
        edge={<Edge className="edge" />}
      />
      <div class="modal-wrapper" id="modal">
        <div class="modal-body card">
          <div class="modal-header">
            <h2 class="heading" style={{ padding: "1em" }}>
              Block Details
            </h2>
            <a
              href="#!"
              role="button"
              class="close"
              aria-label="close this modal"
              style={{ background: "white", margin: "1em" }}
            >
              <svg color="" viewBox="0 0 24 24">
                <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
              </svg>
            </a>
          </div>
          <div className="modal-content">
            <p>Block hash: {activeBlock["hash"]}</p>
            <p>Last hash: {activeBlock["lastHash"]}</p>
            <p>Signer: {activeBlock["signer"]}</p>
            <p>
              Created at:{" "}
              {new Date(activeBlock["timestamp"])
                .toString()
                .split(" ")
                .slice(1, 5)
                .join(" ")}
            </p>
            <p>Data: {activeBlock["data"]}</p>
          </div>
        </div>
        <a href="#!" class="outside-trigger"></a>
      </div>
    </div>
  );
}

export default Explorer;
