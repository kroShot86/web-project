import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments/my');
      setAppointments(response.data.data);
    } catch (error) {
      toast.error('Ошибка при загрузке записей');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info'
    };

    const labels = {
      pending: 'Ожидает',
      confirmed: 'Подтверждена',
      cancelled: 'Отменена',
      completed: 'Завершена'
    };

    return (
      <Badge bg={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  return (
    <div className="dashboard-page">
      <h1 className="mb-4">Панель управления</h1>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Добро пожаловать!</Card.Title>
              <Card.Text>
                <strong>{user?.name}</strong>
              </Card.Text>
              <Card.Text className="text-muted">
                {user?.email}
              </Card.Text>
              <Button as={Link} to="/create-appointment" variant="primary" className="mt-2">
                Новая запись
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Ваши данные</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Имя:</strong> {user?.name}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Email:</strong> {user?.email}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Телефон:</strong> {user?.phone}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Роль:</strong> {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title>Последние записи</Card.Title>
            <Button as={Link} to="/my-appointments" variant="outline-primary" size="sm">
              Все записи
            </Button>
          </div>

          {loading ? (
            <p className="text-center">Загрузка...</p>
          ) : appointments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">У вас пока нет записей</p>
              <Button as={Link} to="/create-appointment" variant="primary">
                Записаться на прием
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Услуга</th>
                    <th>Специалист</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{formatDate(appointment.date)}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.service}</td>
                      <td>{appointment.specialist}</td>
                      <td>{getStatusBadge(appointment.status)}</td>
                      <td>
                        <Button
                          as={Link}
                          to={`/my-appointments`}
                          variant="outline-primary"
                          size="sm"
                        >
                          Подробнее
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Быстрые действия</Card.Title>
              <div className="d-grid gap-2">
                <Button as={Link} to="/create-appointment" variant="primary" className="mb-2">
                  📅 Записаться на прием
                </Button>
                <Button as={Link} to="/my-appointments" variant="outline-primary" className="mb-2">
                  📋 Мои записи
                </Button>
                <Button variant="outline-secondary" className="mb-2">
                  📞 Контакты специалиста
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Полезная информация</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  🕒 Режим работы: Пн-Пт 9:00-18:00
                </ListGroup.Item>
                <ListGroup.Item>
                  📍 Адрес: ул. Примерная, д. 123
                </ListGroup.Item>
                <ListGroup.Item>
                  📞 Телефон: +7 (999) 123-45-67
                </ListGroup.Item>
                <ListGroup.Item>
                  ⚠️ Отмена записи возможна за 24 часа до приема
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;