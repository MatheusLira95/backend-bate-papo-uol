import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const participants = [];
const messages = [];

app.post("/participants", (req, res) => {
  const participant = req.body;
  if (
    participant.name === "" ||
    participants.find((p) => p.name === participant.name)
  ) {
    res.status(400);
    res.send("Name its blank or there is already a participant with that name");
  }
  participant.lastStatus = Date.now();
  participants.push(participant);
  res.send(participants);
});
app.listen(4000, () => {
  console.log("Server running");
});
