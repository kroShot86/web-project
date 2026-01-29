import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button, NavbarText } from 'react-bootstrap'; // Добавили NavbarText
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          🩺 Запись к специалисту
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/dashboard">Панель управления</Nav.Link>
                <Nav.Link as={Link} to="/create-appointment">Записаться</Nav.Link>
                <Nav.Link as={Link} to="/my-appointments">Мои записи</Nav.Link>
                {user?.role === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/admin">Админ-панель</Nav.Link>
                    <Nav.Link as={Link} to="/admin/users">Пользователи</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <NavbarText className="me-3">
                  Привет, <strong>{user?.name}</strong>
                </NavbarText>
                <Button variant="outline-light" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="me-2">
                  <Button variant="outline-light">Войти</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="primary">Регистрация</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;