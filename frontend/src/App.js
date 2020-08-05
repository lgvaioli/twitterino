import React from 'react';
import './css/App.css';
import UserInfoView from './UserInfoView';


const TWITTER_MAX_LENGTH = 280;
const TWITTER_LENGTH_WARNING = (TWITTER_MAX_LENGTH / 100) * 50; // 50%

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: "",
      user: { },
    }
  }

  onInputChange = (event) => {
    let inputLen = event.target.value.length;
    let newInput = "";

    if(inputLen > TWITTER_MAX_LENGTH) {
      newInput = event.target.value.slice(0, TWITTER_MAX_LENGTH);
    } else {
      newInput = event.target.value;
    }

    this.setState({input: newInput});
  }

  onButtonClick = () => {
    // Do nothing on empty input
    if(this.state.input === "") {
      alert("You can't send an empty message");
      return;
    }

    // Send POST to express server
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();
    urlencoded.append("message", this.state.input);

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    };

    fetch("/message", requestOptions)
      .then(response => {
        if (response.status == 200) {
          // Success; update app state and show success alert

          const user = { ...this.state.user };
          user.tweetsCount += 1;
          user.currentStatus = this.state.input;

          this.setState({ user: user, input: "" });

          alert('Tweet was successful!');
        } else {
          // Failure
          alert(`Could not tweet message: ${response.text()}`);
        }
      })
      .catch(error => alert(`Unexpected error: ${error}`));
  }

  componentDidMount() {
    fetch("/user")
      .then(response => response.json())
      .then(data => {
        this.setState({ user: data });
      })
      .catch(error => alert(error));
  }

  render() {
    const inputLen = this.state.input.length;
    const charsLeftStyle = inputLen >= TWITTER_LENGTH_WARNING ? {visibility: "visible"} :
      {visibility: "hidden"};

    return (
      <div className="app">
      <UserInfoView user={this.state.user} />
      <h1>Let's tweet a message!</h1>
      <p
        id="chars-left"
        style={charsLeftStyle}>{TWITTER_MAX_LENGTH - this.state.input.length} characters left</p>
      <input type="text" onChange={this.onInputChange} value={this.state.input}
        placeholder="Write your message here" />
      <button onClick={this.onButtonClick}>Send</button>
      </div>
    );
  }
}

export default App;
