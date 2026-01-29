import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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

  const formatDateTime = (dateString, time) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy', { locale: ru }) + ' ' + time;
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    setCancelling(true);
    try {
      await axios.put(`/api/appointments/${selectedAppointment._id}`, {
        status: 'cancelled'
      });

      toast.success('Запись отменена');
      fetchAppointments(); // Обновляем список
    } catch (error) {
      toast.error('Ошибка при отмене записи');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
      setSelectedAppointment(null);
    }
  };

  const canCancel = (appointment) => {
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      return false;
    }

    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);

    return hoursDiff > 24; // Можно отменить только за 24 часа
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка записей...</p>
      </div>
    );
  }

  return (
    <div className="my-appointments-page">
      <h1 className="mb-4">Мои записи</h1>

      {appointments.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4 className="text-muted mb-3">У вас пока нет записей</h4>
            <p className="text-muted mb-4">
              Запишитесь на прием, чтобы увидеть свои записи здесь
            </p>
            <Button href="/create-appointment" variant="primary">
              Записаться на прием
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Дата и время</th>
                      <th>Специалист</th>
                      <th>Услуга</th>
                      <th>Статус</th>
                      <th>Примечания</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td>{formatDateTime(appointment.date, appointment.time)}</td>
                        <td>{appointment.specialist}</td>
                        <td>{appointment.service}</td>
                        <td>{getStatusBadge(appointment.status)}</td>
                        <td>
                          <small className="text-muted">
                            {appointment.notes || '—'}
                          </small>
                        </td>
                        <td>
                          {canCancel(appointment) && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleCancelClick(appointment)}
                            >
                              Отменить
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Статусы записей</Card.Title>
              <div className="d-flex flex-wrap gap-3">
                <div>
                  <Badge bg="warning" className="me-2">Ожидает</Badge>
                  <span>Запись ожидает подтверждения</span>
                </div>
                <div>
                  <Badge bg="success" className="me-2">Подтверждена</Badge>
                  <span>Запись подтверждена специалистом</span>
                </div>
                <div>
                  <Badge bg="danger" className="me-2">Отменена</Badge>
                  <span>Запись отменена</span>
                </div>
                <div>
                  <Badge bg="info" className="me-2">Завершена</Badge>
                  <span>Прием состоялся</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Модальное окно отмены */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Отмена записи</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <>
              <p>Вы уверены, что хотите отменить запись?</p>
              <Alert variant="warning">
                <strong>Информация о записи:</strong><br />
                Специалист: {selectedAppointment.specialist}<br />
                Дата: {formatDateTime(selectedAppointment.date, selectedAppointment.time)}<br />
                Услуга: {selectedAppointment.service}
              </Alert>
              <p className="text-danger">
                <small>
                  ⚠️ Отмена записи возможна не позднее чем за 24 часа до приема
                </small>
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelConfirm}
            disabled={cancelling}
          >
            {cancelling ? 'Отмена...' : 'Подтвердить отмену'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyAppointments;