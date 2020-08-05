import React from 'react';
import './css/UserInfoView.css';

/**
 * User info view functional component. Displays the user's profile picture and some info.
 * Required props:
 *  - user: A "nice" Twitter user object, as returned by the server (take a look at
 * the "app.get('/user'" function in server.js).
 */
function UserInfoView(props) {
  return (
    <div className='UserInfoView'>
    <img src={props.user.profilePicUrl} alt="profile pic" />
    <p>Username: <b>{props.user.username}</b></p>
    <p>Twitter ID: <b>{props.user.twitterId}</b></p>
    <p>Following: <b>{props.user.following}</b></p>
    <p>Followers: <b>{props.user.followers}</b></p>
    <p>Tweets count: <b>{props.user.tweetsCount}</b></p>
    <p>Current status: <b>{props.user.currentStatus}</b></p>
    </div>
  );
}

export default UserInfoView;
