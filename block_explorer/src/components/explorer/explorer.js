import React, { useState } from "react";
import { useGetBlocksQuery } from "../../features/apiSlice";
import { Canvas, Node, Edge, MarkerArrow } from "reaflow";
import ErrorPage from "../error/error";
import "./explorer.scss";
import FloatingModal from "../floatingModal/floatingModal";
import DetailsO from "../DetailsO/DetailsO";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const OFFSET = -800;
function Explorer() {
  const { data, error, isLoading } = useGetBlocksQuery();
  const [activeBlock, setActiveBlock] = useState({
    hash: "",
    lastHash: "",
    signature: "",
    timestamp: "",
    data: "",
    validator: "",
  });
  const displayInfo = (id) => {
    setActiveBlock({
      hash: data[id].hash,
      lastHash: data[id].lastHash,
      signature: data[id].signature.s,
      timestamp: data[id].timestamp,
      data: data[id].data,
      validator: data[id].validator,
    });
  };
  if (isLoading) {
    return (
      <div className="lds-roller">
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
      validator: node["validator"],
      className: "BlockColours COMPLETED",
    };
  });
  return (
    <div className="boxin">
      <TransformWrapper
        options={{
          maxScale: 4,
          disablePadding: true,
          limitToBounds: true,
        }}
      >
        <TransformComponent>
          <FloatingModal />
          <Canvas
            className="canvas"
            minZoom={0.001}
            maxZoom={3}
            zoomable={false}
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
                    x={300 * event.node.id + OFFSET}
                    className={event.node.className}
                  >
                    <a
                      onClick={() => displayInfo(event.node.id)}
                      href="#modal"
                      role="button"
                      className="button__link"
                    >
                      <div
                        style={{
                          padding: 10,
                          textAlign: "center",
                        }}
                      >
                        <p>
                          Hash: {event.node.hash.toString().slice(0, 12)}...
                        </p>
                        <p>
                          Validator:{" "}
                          {event.node.validator.toString().slice(0, 12)}
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
          />
        </TransformComponent>
      </TransformWrapper>
      <div className="modal-wrapper" id="modal">
        <div className="modal-body card">
          <div className="modal-header">
            <h2 className="heading" style={{ padding: "1em" }}>
              Block Details
            </h2>
            <a
              href="#!"
              role="button"
              className="close"
              aria-label="close this modal"
              style={{ margin: "1em" }}
            >
              <svg color="" viewBox="0 0 24 24">
                <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
              </svg>
            </a>
          </div>
          <div className="modal-content">
            <p>Block hash: {activeBlock.hash}</p>
            <p>Last hash: {activeBlock.lastHash}</p>
            <p>
              Validator:{" "}
              {activeBlock.validator.toString().slice(0, 6) +
                "..." +
                activeBlock.validator.toString().slice(-6)}
            </p>
            <p>Signature: {activeBlock.signature}</p>
            <p>
              Created at:{" "}
              {new Date(activeBlock.timestamp)
                .toString()
                .split(" ")
                .slice(1, 5)
                .join(" ")}
            </p>
            <p>Data:</p>
            <DetailsO data={activeBlock.data} />
          </div>
        </div>
        <a href="#!" className="outside-trigger"></a>
      </div>
    </div>
  );
}

export default Explorer;
