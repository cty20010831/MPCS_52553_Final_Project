# Final Project: Belay (a Slack clone)

This is repostiroy for the MPCS 52553 Web Development Final Project. In this project, in collaboration with Weiwu Yan and Peiran Qin, I created a Slack clone called [Belay](https://en.wikipedia.org/wiki/Belaying). 

## Core Behavior of Belay
- Belay lets users send and read real-time chat messages that are organized into
  rooms called Channels. Users see a list of all the channels on the server and
  can click one to enter that channel. Inside, they see all the messages posted
  to that channel by any user, and can post their own messages. All messages
  belong to a channel and all channels are visible to all users; we don't need
  to implement private rooms or direct messages.
- Any user can create a new channel by supplying a display name. Channel names
  must be unique. If you wish, you may choose to limit what characters are
  allowed in channel names.
- Like Slack, messages may be threaded as Replies in response to a message in a
  channel. Messages in the channel will display how many replies they have if
  that number is greater than zero. We don't support nested threads; messages
  either belong directly to a channel or are replies in a thread to a message
  that does, but replies can't have nested replies of their own.


## Running Belay
Before running Belay, it is recommended to install the dependencies for the flask backend by creting a virtual environment and installing the dependencies:
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

In order to run Belay, you must first run the backend and then the frontend. It is suggested to split the terminal into two separate tabs (one for the backend and one for the frontend). 

To run the backend, navigate to the backend directory and run the following command:
```
cd backend
flask run
```

To run the frontend, navigate to the frontend directory and run the following command:
```
cd frontend
npm install
npm start
```

If everything is set up correctly, you should be able to access the app at `http://127.0.0.1:3000`.

### Note on Using `flask_cors` Package
In this project, I included the `flask_cors` package to enable secure communication between the React frontend running on `localhost:3000` and the Flask backend running on a different port. Without CORS, web browsers would block these cross-origin requests due to security policies. The configuration explicitly allows specific HTTP methods (GET, POST, PUT, DELETE) and headers (Content-Type, Authorization) needed for the application's functionality, while maintaining security by only permitting requests from the trusted frontend origin. This setup is particularly crucial for supporting features like user authentication and data management across the separated frontend and backend architecture.