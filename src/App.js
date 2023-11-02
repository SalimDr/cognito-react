// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, {useEffect, useState, Fragment} from "react";
import {Amplify, Auth, Hub, API } from "aws-amplify";
import {Container} from "react-bootstrap";

import Navigation from "./components/Navigation.js";
import FederatedSignIn from "./components/FederatedSignIn.js";
import MainRequest from "./components/MainRequest.js";
import "./App.css";

Amplify.configure({
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_YNeQzH2OC",
    userPoolWebClientId: "4m65gcouktn3mb4l6817ilcg7s",
    storage: sessionStorage ,
    oauth: {
      domain: "testadco1234.auth.us-east-1.amazoncognito.com",
      scope: ["email", "openid"],
      redirectSignIn: "https://d2pwlik551tcl4.cloudfront.net/",
      redirectSignOut: "<enter here the amplify hosted url>",
      responseType: "code"
    }
  },
  API: {
    endpoints: [
      {
        name: "MyBlogPostAPI",
        endpoint: "http://127.0.0.1/"
      }
    ]
  }
});

API.configure({API: {
  endpoints: [
    {
      name: "MyBlogPostAPI",
      endpoint: "http://127.0.0.1"
    }
  ]
}});

const federatedIdName =
  "Example-Corp-IDP";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    Hub.listen("auth", ({payload: {event, data}}) => {
      switch (event) {
        case "signIn":
        case "cognitoHostedUI":
          setToken("grating...");
          getToken().then(userToken => setToken(userToken.idToken.jwtToken));
          break;
        case "signOut":
          setToken(null);
          break;
        case "signIn_failure":
        case "cognitoHostedUI_failure":
          console.log("Sign in failure", data);
          break;
        default:
          break;
      }
    });
  }, []);

  function getToken() {
    return Auth.currentSession()
      .then(session => session)
      .catch(err => console.log(err));
  }

  return (
    <Fragment>
      <Navigation token={token} />
      <Container fluid>
        <br />
        {token ? (
          <MainRequest token={token} />
        ) : (
          <FederatedSignIn federatedIdName={federatedIdName} />
        )}
      </Container>
    </Fragment>
  );
}

export default App;
