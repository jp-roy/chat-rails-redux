import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getMessages, displayCableMessage } from '../actions';
import MessageForm from '../containers/message_form.jsx'

import stringToColour from '../utils/channel.js';
import Moment from 'react-moment';
import Emojify from 'react-emojione';
import cable from "actioncable";

class Channel extends Component {
  componentWillMount() {
    this.props.getMessages(this.props.selectedChannel);
  }

  componentWillUnmount() {
    App.chatChannel.unsubscribe();
  }

  componentDidMount() {
    this.createCableSubscription(this.props.selectedChannel);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedChannel !== nextProps.selectedChannel) {
      this.props.getMessages(nextProps.selectedChannel);
      App.chatChannel.unsubscribe();
      this.createCableSubscription(nextProps.selectedChannel);
    };
  }

  componentDidUpdate() {
    this.messageList.scrollTop = this.messageList.scrollHeight;
  }

  createCableSubscription = (channel_id) => {
    App.chatChannel = App.cable.subscriptions.create(
      { channel: 'ChatChannel', channel_id: channel_id },
      { received: (data) => this.checkNewCableMessage(data) }
    )
  }

  checkNewCableMessage = (data) => {
    let messages = this.props.messages.slice(0)
    let messageIndex = messages.findIndex(message => message.id == data.id)
    if (messageIndex == -1) { this.props.displayCableMessage(data) }
  }

  render() {
    return (
      <div className="channel">
        <div className="message-list" ref={(div) => { this.messageList = div; }}>
          {this.props.messages.map((message) =>
            <div className="message" key={message.created_at}>
              <div className="header">
                <span className="author" style={{ color: stringToColour(message.author) }}><strong>{message.author}</strong></span>
                <span className="time">&nbsp;-&nbsp;
                  <Moment format="HH:m:ss">
                    {message.created_at}
                  </Moment>
                </span>
              </div>
              <div className="content">
                <Emojify>
                  {message.content}
                </Emojify>
              </div>
            </div>
          )}
        </div>
        <MessageForm selectedChannel={this.props.selectedChannel} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    messages: state.messages
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { getMessages, displayCableMessage },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Channel);
