import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section text-center py-5 mb-5 bg-primary text-white rounded">
        <h1 className="display-4 mb-3">Запись к специалисту онлайн</h1>
        <p className="lead mb-4">
          Удобная система записи на прием к врачу. Выберите время, заполните форму - и запись готова!
        </p>
        {!isAuthenticated && (
          <div className="mt-4">
            <Button as={Link} to="/register" variant="light" size="lg" className="me-3">
              Зарегистрироваться
            </Button>
            <Button as={Link} to="/login" variant="outline-light" size="lg">
              Войти
            </Button>
          </div>
        )}
      </div>

      <Container>
        <h2 className="text-center mb-4">Наши услуги</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>🩺</span>
                </div>
                <Card.Title>Консультация</Card.Title>
                <Card.Text>
                  Профессиональная консультация специалиста. Получите ответы на все ваши вопросы.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>🔍</span>
                </div>
                <Card.Title>Диагностика</Card.Title>
                <Card.Text>
                  Современные методы диагностики для точной постановки диагноза.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>💊</span>
                </div>
                <Card.Title>Лечение</Card.Title>
                <Card.Text>
                  Эффективные методы лечения с использованием современных технологий.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Как это работает?</Card.Title>
                <ol className="mt-3">
                  <li>Зарегистрируйтесь в системе</li>
                  <li>Выберите удобное время приема</li>
                  <li>Заполните форму записи</li>
                  <li>Получите подтверждение записи</li>
                </ol>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Наш специалист</Card.Title>
                <div className="d-flex align-items-center mt-3">
                  <div className="me-3">
                    <div style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: '#4361ee',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem'
                    }}>
                      ДИ
                    </div>
                  </div>
                  <div>
                    <h5>Доктор Иванов Иван Иванович</h5>
                    <p className="text-muted mb-1">Врач-терапевт высшей категории</p>
                    <p className="text-muted">Стаж работы: 15 лет</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;