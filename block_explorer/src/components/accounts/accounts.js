import "./accounts.scss";
import ErrorPage from "../error/error";
import { useGetAccountsQuery } from "../../features/apiSlice";
import { useState } from "react";
function Accounts() {
  const { data, error, isLoading } = useGetAccountsQuery();
  const [searchText, setSearchText] = useState();
  const [display, setDisplay] = useState("Copy full address");
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
  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setDisplay("Copied");
  };
  const resetCopyText = () => {
    setDisplay("Copy full address");
  };
  const onChangeHandler = (event) => {
    console.log(event.target.value);
    setSearchText(event.target.value);
  };
  console.log(data);
  return (
    <div className="background">
      <div className="heading">
        <form className="form-inline my-2 my-lg-2 searchForm">
          <input
            className="form-control mr-sm-2 inputk"
            type="search"
            placeholder="Search a public key 0xfg42..."
            aria-label="Search"
            value={searchText}
            onChange={onChangeHandler}
          />
          <button className="btn btn-outline-success" type="submit">
            Search
          </button>
        </form>
      </div>
      <div className="content">
        {data
          .filter((item) => {
            if (searchText !== undefined) {
              return item["address"].indexOf(searchText) > -1;
            }
            if (item["balance"] >= 0) {
              return item;
            }
          })
          .map((account, index) => {
            return (
              <div key={index} className="listel">
                <div className="half">
                  <div className="tooltip0">
                    <p
                      onClick={() => copyText(account["address"])}
                      onMouseOut={resetCopyText}
                      style={{ display: "felx" }}
                    >
                      <span className="tooltiptext" id="myTooltip">
                        {display}
                      </span>
                      <span className="itemName addr">Address: </span>{" "}
                      <span className="addr">
                        {account["address"].slice(0, 5)}...
                        {account["address"].slice(-5)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="half">
                  <p>
                    <span className="itemName">Balance:</span>{" "}
                    {account["balance"]} ARG
                  </p>
                  <p>
                    <span className="itemName">Staked Balance:</span>{" "}
                    {account["stake"]} ARG
                  </p>
                  <p>
                    <span className="itemName">Is Validator:</span>{" "}
                    {account["validator"].toString()}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Accounts;
