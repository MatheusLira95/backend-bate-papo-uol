import express, { json } from "express";
import cors from "cors";
import dayjs from "dayjs";

const app = express();
app.use(cors());
app.use(express.json());

let participants = [];
const messages = [];

setInterval(() => {
  participants.forEach((p) => {
    if (Date.now() - p.lastStatus > 10000) {
      let leaveMessage = {
        from: p.name,
        to: "Todos",
        text: "saiu da sala...",
        type: "status",
        time: dayjs().format("HH:mm:ss"),
      };
      messages.push(leaveMessage);
    }
  });
  participants = participants.filter(
    (p) => Date.now() - p.lastStatus > 10000,
    15000
  );
}, 15000);

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
  const loginMessage = {
    from: participant.name,
    to: "Todos",
    text: "entrou na sala",
    type: "status",
    time: dayjs().format("HH:mm:ss"),
  };
  messages.push(loginMessage);
  res.send(participants);
});

app.get("/participants", (req, res) => {
  res.send(participants);
});

app.post("/messages", (req, res) => {
  const message = req.body;
  message.from = req.headers.user;
  message.time = dayjs().format("HH:mm:ss");
  if (message.type !== "message") {
    if (
      message.to === "" ||
      message.text === "" ||
      message.type !== "private_message"
    ) {
      res.status(400);
      res.send("Ocorreu um erro em sua mensagem, tente novamente");
    }
  }
  messages.push(message);
  res.status(200).send(req.body);
});

app.get("/messages", (req, res) => {
  const messagesLimit = parseInt(req.query.limit);
  const messagesSent = [];
  const messagesFiltered = messages.filter(
    (m) =>
      m.to === "Todos" ||
      m.to === req.headers.user ||
      m.from === req.headers.user
  );

  for (let i = 0; i < messagesLimit; i++) {
    if (messagesFiltered[i] !== undefined) {
      messagesSent.push(messagesFiltered[i]);
    }
  }

  res.send(messagesSent);
});

app.post("/status", (req, res) => {
  const userStillOn = participants.find((p) => p.name === req.headers.user);
  if (userStillOn) {
    userStillOn.lastStatus = Date.now();
    res.status(200);
    res.send(userStillOn);
  } else {
    res.status(400);
  }

  res.send(req.headers.user);
});
app.listen(4000, () => {
  console.log("Server running");
});
