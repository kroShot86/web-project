import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Badge, Modal, Form,
  Alert, Spinner, Row, Col, InputGroup, FormControl
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const AdminPanel = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
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

  const handleActionClick = (appointment, type) => {
    setSelectedAppointment(appointment);
    setModalType(type);
    setNotes('');
    setShowModal(true);
  };

  const handleConfirm = async () => {
    try {
      await axios.put(`/api/appointments/${selectedAppointment._id}/confirm`);
      toast.success('Запись подтверждена');
      fetchAllAppointments();
      setShowModal(false);
    } catch (error) {
      toast.error('Ошибка при подтверждении записи');
    }
  };

  const handleCancel = async () => {
    try {
      await axios.put(`/api/appointments/${selectedAppointment._id}/cancel`, {
        notes: notes
      });
      toast.success('Запись отменена');
      fetchAllAppointments();
      setShowModal(false);
    } catch (error) {
      toast.error('Ошибка при отмене записи');
    }
  };

  const handleComplete = async () => {
    try {
      await axios.put(`/api/appointments/${selectedAppointment._id}/complete`, {
        notes: notes
      });
      toast.success('Запись завершена');
      fetchAllAppointments();
      setShowModal(false);
    } catch (error) {
      toast.error('Ошибка при завершении записи');
    }
  };

  const handleAddNotes = async () => {
    try {
      await axios.put(`/api/appointments/${selectedAppointment._id}/notes`, {
        notes: notes
      });
      toast.success('Комментарий добавлен');
      fetchAllAppointments();
      setShowModal(false);
    } catch (error) {
      toast.error('Ошибка при добавлении комментария');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await axios.delete(`/api/appointments/${appointmentId}`);
        toast.success('Запись удалена');
        fetchAllAppointments();
      } catch (error) {
        toast.error('Ошибка при удалении записи');
      }
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.user?.name?.toLowerCase().includes(searchLower) ||
      appointment.user?.email?.toLowerCase().includes(searchLower) ||
      appointment.user?.phone?.includes(searchTerm) ||
      appointment.service?.toLowerCase().includes(searchLower) ||
      appointment.status?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка записей...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1 className="mb-4">Панель администратора</h1>

      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <h5>Все записи ({appointments.length})</h5>
            </Col>
            <Col md={6}>
              <InputGroup>
                <FormControl
                  placeholder="Поиск по имени, email, телефону, услуге..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                  Очистить
                </Button>
              </InputGroup>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Пациент</th>
                  <th>Контакты</th>
                  <th>Дата и время</th>
                  <th>Услуга</th>
                  <th>Статус</th>
                  <th>Комментарий пациента</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <strong>{appointment.user?.name}</strong>
                    </td>
                    <td>
                      <div>{appointment.user?.email}</div>
                      <small className="text-muted">{appointment.user?.phone}</small>
                    </td>
                    <td>{formatDateTime(appointment.date, appointment.time)}</td>
                    <td>{appointment.service}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>
                      <small className="text-muted">
                        {appointment.notes || '—'}
                      </small>
                      {appointment.doctorNotes && (
                        <div className="mt-1">
                          <small className="text-primary">
                            <strong>Врач:</strong> {appointment.doctorNotes}
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {appointment.status === 'pending' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleActionClick(appointment, 'confirm')}
                            >
                              ✓ Подтвердить
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleActionClick(appointment, 'notes')}
                            >
                              📝 Заметка
                            </Button>
                          </>
                        )}

                        {appointment.status === 'confirmed' && (
                          <>
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleActionClick(appointment, 'complete')}
                            >
                              ✓ Завершить
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleActionClick(appointment, 'notes')}
                            >
                              📝 Заметка
                            </Button>
                          </>
                        )}

                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleActionClick(appointment, 'cancel')}
                          >
                            ✕ Отменить
                          </Button>
                        )}

                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(appointment._id)}
                        >
                          🗑️ Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {filteredAppointments.length === 0 && (
            <Alert variant="info" className="text-center">
              Записи не найдены
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Модальные окна */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'confirm' && 'Подтверждение записи'}
            {modalType === 'cancel' && 'Отмена записи'}
            {modalType === 'complete' && 'Завершение записи'}
            {modalType === 'notes' && 'Добавление комментария врача'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <>
              <Alert variant="info">
                <strong>Пациент:</strong> {selectedAppointment.user?.name}<br />
                <strong>Дата:</strong> {formatDateTime(selectedAppointment.date, selectedAppointment.time)}<br />
                <strong>Услуга:</strong> {selectedAppointment.service}
              </Alert>

              {(modalType === 'cancel' || modalType === 'complete' || modalType === 'notes') && (
                <Form.Group className="mb-3">
                  <Form.Label>
                    {modalType === 'notes' ? 'Комментарий врача:' : 'Причина:'}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      modalType === 'notes'
                        ? 'Введите комментарий врача...'
                        : 'Введите причину...'
                    }
                  />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Отмена
          </Button>
          <Button
            variant={
              modalType === 'confirm' ? 'success' :
              modalType === 'cancel' ? 'danger' :
              modalType === 'complete' ? 'info' : 'primary'
            }
            onClick={
              modalType === 'confirm' ? handleConfirm :
              modalType === 'cancel' ? handleCancel :
              modalType === 'complete' ? handleComplete : handleAddNotes
            }
            disabled={(modalType === 'cancel' || modalType === 'complete' || modalType === 'notes') && !notes}
          >
            {modalType === 'confirm' && 'Подтвердить'}
            {modalType === 'cancel' && 'Отменить запись'}
            {modalType === 'complete' && 'Завершить запись'}
            {modalType === 'notes' && 'Добавить комментарий'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Row>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>Ожидают подтверждения</Card.Title>
              <h2 className="text-warning">
                {appointments.filter(a => a.status === 'pending').length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>Подтвержденные</Card.Title>
              <h2 className="text-success">
                {appointments.filter(a => a.status === 'confirmed').length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>Завершенные</Card.Title>
              <h2 className="text-info">
                {appointments.filter(a => a.status === 'completed').length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPanel;