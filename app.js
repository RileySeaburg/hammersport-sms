const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const Nexmo = require("nexmo");
const socketio = require("socket.io");
// Init App
const app = express();

// Init nexmo
const nexmo = new Nexmo(
  {
    apiKey: "abe25437",
    apiSecret: "LSzAlXu83KrneypH",
  },
  { debug: true }
);

// Template engine setup
app.set("view engine", "html");
app.engine("html", ejs.renderFile);

// Public Folder Setup
app.use(express.static(__dirname + "/public"));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index Route
app.get("/", (req, res) => {
  res.render("index");
});

// Catch form submit
app.post("/", (req, res) => {
  const number = req.body.number;
  const text = req.body.text;

  nexmo.message.sendSms(
      '19418883267',
      number,
      text,
      {
          type: 'unicode'
      },
      (err, responseData) => {
          if (err) {
              console.log(err);
          } else {
              console.dir(responseData);
            //   Get data from response
            const data = {
                id: responseData.messages[0]['message-id'],
                number: responseData.messages[0]['to']
            }
            // emit to the client
            io.emit('smsStatus', data)
          }
      }
  );
  
});

// Define port
const port = 3000;

// Start server
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
    console.log('Connected');
    io.on('disconnect', () =>{
        console.log('Disconnected');
    })
})