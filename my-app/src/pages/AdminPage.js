import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../App';
import { Button, ListGroup, Row, Col, Alert, Modal, Form } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import { Navigate } from 'react-router-dom';  // Import Navigate
import './adminPage.css';

function AdminPage() {
  const { userAuth: { access_token } } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    personal_info: {
      fullname: '',
      email: '',
      username: '',
      bio: '',
      role: 'user',
    },
    isRestricted: false,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [redirectToHome, setRedirectToHome] = useState(false);  // State for redirect

  // Fetch user data once on component mount
  useEffect(() => {
    fetchUsers();
  }, [access_token]);

  const fetchUsers = () => {
    if (access_token) {
      axios
        .get(`${process.env.REACT_APP_SOCKET_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => {
          setUsers(response.data);
        })
        .catch((err) => {
          console.error(err.message);
          setError(`${err.message}`);
          if (err.response && err.response.status === 403) {  // Check for access denied (status 403)
            setRedirectToHome(true);  // Trigger redirect
          }
        });
    }
  };

  // Handle adding or editing a user
  const handleSaveUser = (e) => {
    e.preventDefault();
    
    const endpoint = isEditMode
      ? `${process.env.REACT_APP_SOCKET_URL}/api/admin/users/${currentUser._id}`
      : `${process.env.REACT_APP_SOCKET_URL}/api/admin/users`;
    const method = isEditMode ? 'put' : 'post';
 
    axios[method](endpoint, currentUser, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then(() => {
        fetchUsers();
        setShowAddEditModal(false);
        setCurrentUser({
          personal_info: { fullname: '', email: '', username: '', bio: '', role: 'user' },
          isRestricted: false,
        });
      })
      .catch((err) => {
        console.error(err);
        setError(`Failed to ${isEditMode ? 'update' : 'add'} user.`);
      });
  };

  // Handle deleting a user
  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      axios
        .delete(`${process.env.REACT_APP_SOCKET_URL}/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(() => {
          setUsers(users.filter((user) => user._id !== userId));
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to delete user.');
        });
    }
  };

  // Toggle user restriction
  const handleRestrictUser = (userId) => {
    axios
      .patch(
        `${process.env.REACT_APP_SOCKET_URL}/api/admin/users/${userId}/restrict`,
        {},
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to restrict user.');
      });
  };

  // Export user data to CSV
  const handleExportUsers = () => {
    const csvContent = users
      .map((user) =>
        [
          user.personal_info.fullname,
          user.personal_info.email,
          user.personal_info.username,
          user.personal_info.bio,
          user.personal_info.role,
          user.isRestricted,
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'users.csv');
  };

  // Import user data from CSV
  const handleImportUsers = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const csvData = event.target.result
        .split('\n')
        .map((line) => line.split(','))
        .filter(([fullname, email, username, bio, role, isRestricted]) => {
          // Filter out empty or incomplete lines
          return fullname && email && username && bio && role !== undefined && isRestricted !== undefined;
        })
        .map(([fullname, email, username, bio, role, isRestricted]) => ({
          personal_info: { fullname, email, username, bio, role },
          isRestricted: isRestricted === 'true',
        }));
  
      axios
        .post(`${process.env.REACT_APP_SOCKET_URL}/api/admin/users/import`, csvData, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(() => {
          fetchUsers();
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to import users.');
        });
    };
    
    reader.readAsText(file);
  };

  // Open the add/edit modal
  const handleOpenModal = (user = null) => {
    setIsEditMode(!!user);
    setCurrentUser(
      user || {
        personal_info: { fullname: '', email: '', username: '', bio: '', role: 'user' },
        isRestricted: false,
      }
    );
    setShowAddEditModal(true);
  };

  if (redirectToHome) {
    return <Navigate to="/" />;  // Redirect to home page
  }

  return (
    <div className="admin-page">
      <Row>
        <Col>
          <h2>Admin Panel</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button variant="success" onClick={() => handleOpenModal()}>Add User</Button>
          <Button variant="primary" onClick={handleExportUsers}>Export Users</Button>
          
         <Form.Group>
        <Form.Label>Insert CSV File</Form.Label>
        <Form.Control type="file" accept=".csv" onChange={handleImportUsers} />
        </Form.Group>
          <ListGroup>
            {users.map((user) => (
              <ListGroup.Item key={user._id}>
                <Row>
                  <Col>
                    <strong>{user.personal_info.fullname}</strong> <br />
                    <small>{user.personal_info.email}</small> <br />
                    <small>Username: {user.personal_info.username}</small> <br />
                    <small>Bio: {user.personal_info.bio}</small> <br />
                    <small>Role: {user.personal_info.role}</small> <br />
                    <small>Restricted: {user.isRestricted ? 'Yes' : 'No'}</small>
                  </Col>
                  <Col>
                    <Button variant="warning" onClick={() => handleOpenModal(user)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDeleteUser(user._id)}>Delete</Button>
                    <Button variant="info" onClick={() => handleRestrictUser(user._id)}>
                      {user.isRestricted ? 'Unrestrict' : 'Restrict'}
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showAddEditModal} onHide={() => setShowAddEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveUser}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={currentUser.personal_info.fullname}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    personal_info: { ...currentUser.personal_info, fullname: e.target.value },
                  })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={currentUser.personal_info.email}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    personal_info: { ...currentUser.personal_info, email: e.target.value },
                  })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={currentUser.personal_info.username}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    personal_info: { ...currentUser.personal_info, username: e.target.value },
                  })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Bio</Form.Label>
              <Form.Control
                type="text"
                value={currentUser.personal_info.bio}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    personal_info: { ...currentUser.personal_info, bio: e.target.value },
                  })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                value={currentUser.personal_info.role}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    personal_info: { ...currentUser.personal_info, role: e.target.value },
                  })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Restricted"
                checked={currentUser.isRestricted}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    isRestricted: e.target.checked,
                  })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddEditModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminPage;
