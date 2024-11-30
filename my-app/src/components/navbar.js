import { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import { UserContext } from '../App';
import './navbar.css'; // Custom CSS for sliding animation
import { removeFromSession } from '../common/session';

function NavScroll() {
  const { userAuth, userAuth: { access_token, profile_img, username } ,setUserAuth} = useContext(UserContext);
const handleLogout=()=>
{
  removeFromSession("user");
  setUserAuth({access_token:null});
}
  return (
    <Navbar expand="lg" className="bg-dark navbar-dark">
      <Container fluid>
        <Navbar.Brand href="#">Blogging</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse
          id="navbarScroll"
          className="slide-navbar" // Custom class for slide animation
        >
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="#action2">Write</Nav.Link>
          </Nav>

          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-success" className="me-3">
              Search
            </Button>
          </Form>

          {access_token ? (
            <Dropdown>
              <Dropdown.Toggle
                as="div"
                className="d-flex align-items-center"
                style={{ cursor: 'pointer' }}
              >
               
                <img
                  src={profile_img}
                  alt="Profile"
                  className="rounded-circle profileImg"
                />
              </Dropdown.Toggle>

              <Dropdown.Menu
                align="start" // Aligns the dropdown to the left of the profile picture
                 className='profileDropdown'
                
              >
                {/* Display user's full name */}
                <Dropdown.ItemText style={{ fontWeight: 'bold', textAlign: 'center', padding: '0px' }}>
                  @{username}
                </Dropdown.ItemText>
                <Dropdown.Item
                onClick={handleLogout}
                style={{textAlign:"center"}}
                >
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav className="d-flex">
              <Nav.Link href="/login" className="text-light">
                Login
              </Nav.Link>
              <Nav.Link href="/signup" className="me-3 text-light">
                Signup
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavScroll;
