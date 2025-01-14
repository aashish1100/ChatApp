import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button, Form, Alert, ListGroup, Row, Col, Image } from 'react-bootstrap';
import { UserContext } from '../App';
import { Navigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext'; // Import the useSocket hook
import axios from 'axios';
import './chatPage.css'; // Custom CSS for styling the chat page

function ChatPage({ receiverId }) {
  const [messages, setMessages] = useState([]); // To hold the list of messages
  const [newMessage, setNewMessage] = useState(''); // For the message input
  const [error, setError] = useState(''); // For error messages
  const [receiverDetails, setReceiverDetails] = useState(null); // For receiver's username and profile image
  const [file, setFile] = useState(null); // State for the selected file
  const [filePreview, setFilePreview] = useState(null); // State for file preview (image/video)
  const { userAuth: { access_token, id, isRestricted } } = useContext(UserContext); // Access token from UserContext
  const socket = useSocket(); // Use the socket from context
  const formElement = useRef(null); // To reference the form
  const messagesEndRef = useRef(null); // To reference the end of the messages list

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch receiver details from the API
  useEffect(() => {
    if (receiverId && access_token) {
      axios
        .get(`${process.env.REACT_APP_SOCKET_URL}/api/user/${receiverId}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then((response) => {
          setReceiverDetails(response.data); // Set receiver details from API response
        })
        .catch((err) => {
          console.error('Error fetching receiver details:', err);
          setError('Failed to load receiver details.');
        });
    }
  }, [receiverId, access_token]);

  // Fetch chat messages when component mounts
  useEffect(() => {
    if (access_token) {
      axios
        .get(`${process.env.REACT_APP_SOCKET_URL}/chat/${receiverId}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then((response) => {
          setMessages(response.data.messages);
          scrollToBottom(); // Scroll to the latest message after fetching
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load messages.');
        });
    }
  }, [access_token, receiverId]);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (info) => {
        if (info.receiverId === id) {
          setMessages((prevMessages) => [...prevMessages, info.newMessage]); // Add the new message to the list
        }
      });

      return () => {
        socket.off('receive_message'); // Clean up the listener on unmount
      };
    }
  }, [socket]);

  // Handle message sending
  const sendMessage = async (e) => {
    e.preventDefault();

    if (isRestricted && (file || newMessage.trim())) {
      setError('You are restricted from sending messages or files.');
      return;
    }

    if (!newMessage.trim() && !file) {
      setError('Message or file cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.append('message', newMessage);
    formData.append('receiverId', receiverId);
    if (file) formData.append('file', file);

    try {
      const response = await axios.post(`${process.env.REACT_APP_SOCKET_URL}/chat/send`, formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Emit the message via socket
      socket.emit('send_message', response.data.message);

      setMessages((prevMessages) => [...prevMessages, response.data.message]); // Add the new message to the list
      setNewMessage(''); // Clear the message input
      setFile(null); // Clear the file input
      setFilePreview(null); // Clear the file preview
      setError(''); // Clear any previous error messages
    } catch (err) {
      console.error(err);
      setError('Failed to send the message.');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create a preview for image or video files
    if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
      setFilePreview(URL.createObjectURL(selectedFile));
    }
    setError(''); // Clear previous error messages if any
  };

  // Cancel file selection
  const cancelFile = () => {
    setFile(null);
    setFilePreview(null); // Clear the file preview
  };

  if (!access_token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="chat-page-container">
      <div className="chat-card">
        {/* Receiver's profile section */}
        <div className="chat-header">
          {receiverDetails && (
            <Row className="header">
              <Col xs={2}>
                <Image
                  src={receiverDetails.personal_info.profile_img || '/default-profile.png'} // Use a default image if none exists
                  alt={receiverDetails.personal_info.username}
                  roundedCircle
                  className="profile-image"
                />
              </Col>
              <Col xs={10} className="d-flex align-items-center">
                <h5 className="username">{receiverDetails.personal_info.fullname}</h5>
              </Col>
            </Row>
          )}
        </div>

        {/* Display error message */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Message List */}
        <ListGroup className="message-list">
          {messages.map((msg, index) => (
            <ListGroup.Item
              key={index}
              className={msg.receiverId === receiverId ? 'sent' : 'received'}
              style={{ maxWidth: '70%', alignSelf: msg.receiverId === receiverId ? 'flex-end' : 'flex-start' }}
            >
              {/* Check if the message contains a file */}
              {msg.file && (
                <div>
                  {msg.file.type.startsWith('image/') ? (
                    <img
                      src={msg.file.url}
                      alt={msg.file.filename}
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                    />
                  ) : msg.file.type.startsWith('video/') ? (
                    <video
                      src={msg.file.url}
                      controls
                      style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                  ) : (
                    <a href={msg.file.url} target="_blank" rel="noopener noreferrer">
                      📎 {msg.file.name}
                    </a>
                  )}
                </div>
              )}
              {/* Display text below the file */}
              {msg.message && <p>{msg.message}</p>}
            </ListGroup.Item>
          ))}
          <div ref={messagesEndRef} /> {/* Reference to the end of the messages */}
        </ListGroup>
        
        {filePreview && (
  <div className="file-preview">
    <h6>File Preview:</h6>
    {file.type.startsWith('image/') ? (
      <div className="image-preview-container">
        <img src={filePreview} alt="Preview" className="file-preview-image" />
        <button type="button" className="cancel-btn" onClick={cancelFile}>Cancel</button>
      </div>
    ) : file.type.startsWith('video/') ? (
      <div className="video-preview-container">
        <video src={filePreview} controls className="file-preview-video" />
        <button type="button" className="cancel-btn" onClick={cancelFile}>Cancel</button>
      </div>
    ) : (
      <div className="file-preview-text">
        <p>{file.name}</p>
        <button type="button" className="cancel-btn" onClick={cancelFile}>Cancel</button>
      </div>
    )}
  </div>
)}


        {/* Message Form */}
        
        <Form ref={formElement} onSubmit={sendMessage} className="d-flex align-items-center text-bar">
          <label htmlFor="file-input" className="me-2 attach-btn">
            📎
          </label>
          <input
            id="file-input"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept="image/*, video/*"
          />
          <Form.Control
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="message-input"
            disabled={isRestricted}
          />
          <Button type="submit" className="send-btn" disabled={isRestricted}>
            Send
          </Button>
        </Form>
    
      </div>
    </div>
  );
}

export default ChatPage;
