import React, { useEffect, useState } from "react";
import {
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from "@material-ui/core";
import './App.css'
import { makeStyles } from "@material-ui/core/styles";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

import Webcam from "react-webcam";


const App = () => {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));
  const classes = useStyles();

  
  const webcamRef = React.useRef(null);

  const [model, setModel] = useState();

  
  const loadModel =  async () => {
    try {
      const model = await cocoSsd.load();
      setModel(model);
    } catch (err) {
      console.log(err);
    }
  }

  
  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);


  const predictObject = async () => {
    const predictions = await model.detect(document.getElementById("img"));
    let cnvs = document.getElementById("myCanvas");
    cnvs.width =  webcamRef.current.video.videoWidth;
    cnvs.height = webcamRef.current.video.videoHeight;

    let ctx = cnvs.getContext("2d");
    ctx.clearRect(
      0,
      0,
      webcamRef.current.video.videoWidth,
      webcamRef.current.video.videoHeight
    );

    if (predictions.length > 0) {
      for (let n = 0; n < predictions.length; n++) {
        if (predictions[n].score > 0.8) {
          let bboxLeft = predictions[n].bbox[0];
          let bboxTop = predictions[n].bbox[1];
          let bboxWidth = predictions[n].bbox[2];
          let bboxHeight = predictions[n].bbox[3]; // - bboxTop;

          ctx.beginPath();
          ctx.font = "28px Arial";
          ctx.fillStyle = "red";

          ctx.fillText(
            predictions[n].class +
              ": " +
              Math.round(parseFloat(predictions[n].score) * 100) +
              "%",
            bboxLeft,
            bboxTop
          );

          ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
          ctx.strokeStyle = "#FF0000";

          ctx.lineWidth = 3;
          ctx.stroke();

          console.log("detected");
        }
      }
    }

    setTimeout(() => predictObject(), 500);
  }

 
  const videoConstraints = {
    height: 1080,
    width: 1920,
    maxWidth: "100vw",
    facingMode: "environment",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        marginTop: -8,
        backgroundImage:
          "radial-gradient( circle 993px at 0.5% 50.5%,  rgba(137,171,245,0.37) 0%, rgba(245,247,252,1) 100.2% )",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Object Detection using TensorFlow.js
          </Typography>
        </Toolbar>
      </AppBar>

      <Box mt={1} />
      <Grid
        container
        style={{
          height: "100vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          padding: 20,
        }}
      >
        <Grid
          item
          xs={12}
          md={12}
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <>
            <Box mt={2} />
            {
              <Button
                variant={"contained"}
                style={{
                  color: "white",
                  backgroundColor: "green",
                  width: "100%",
                  maxWidth: "250px",
                }}
                onClick={() => {
                  predictObject()
                }}
              >
                Start Detect
              </Button>
            }
            <Box mt={2} />{" "}
          </>
          <div style={{ position: "absolute", top: "400px", zIndex: "9999" }}>
            <canvas
              id="myCanvas"
              width={960}
              height={640}
              style={{ backgroundColor: "transparent" }}
            />
          </div>
          <div style={{ position: "absolute", top: "400px" }}>
            <Webcam
              audio={false}
              id="img"
              ref={webcamRef}
              screenshotQuality={1}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          </div>
        </Grid>
        <Grid item xs={12} md={12}></Grid>
      </Grid>
    </div>
  );
}

export default App;
