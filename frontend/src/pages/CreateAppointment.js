import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format } from 'date-fns';

const CreateAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date(),
    time: '',
    service: 'Консультация',
    specialist: 'Доктор Иванов',
    notes: ''
  });

  const services = [
    'Консультация',
    'Диагностика',
    'Лечение',
    'Обследование'
  ];

  const specialists = [
    'Доктор Иванов'
  ];

  useEffect(() => {
    fetchAvailableTimes();
  }, [formData.date, formData.specialist]);

  const fetchAvailableTimes = async () => {
    if (!formData.date) return;

    setLoadingTimes(true);
    try {
      const formattedDate = format(formData.date, 'yyyy-MM-dd');
      const response = await axios.get('/api/appointments/available-times', {
        params: {
          date: formattedDate,
          specialist: formData.specialist
        }
      });

      setAvailableTimes(response.data.availableTimes);

      // Если выбранное время больше недоступно, сбрасываем его
      if (formData.time && !response.data.availableTimes.includes(formData.time)) {
        setFormData({ ...formData, time: '' });
        toast.warning('Выбранное время стало недоступно');
      }
    } catch (error) {
      toast.error('Ошибка при загрузке доступного времени');
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date,
      time: '' // Сбрасываем время при смене даты
    });
  };

  const handleTimeSelect = (time) => {
    setFormData({
      ...formData,
      time: time
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.time) {
      toast.error('Пожалуйста, выберите время');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        ...formData,
        date: format(formData.date, 'yyyy-MM-dd')
      };

      await axios.post('/api/appointments', appointmentData);

      toast.success('Запись успешно создана!');
      navigate('/my-appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка при создании записи');
    } finally {
      setLoading(false);
    }
  };

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Не воскресенье и не суббота
  };

  return (
    <div className="create-appointment-page">
      <h1 className="mb-4">Запись на прием</h1>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Специалист *</Form.Label>
                  <Form.Select
                    name="specialist"
                    value={formData.specialist}
                    onChange={handleChange}
                    required
                  >
                    {specialists.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Услуга *</Form.Label>
                  <Form.Select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    {services.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Дата приема *</Form.Label>
                  <div>
                    <DatePicker
                      selected={formData.date}
                      onChange={handleDateChange}
                      dateFormat="dd.MM.yyyy"
                      className="form-control"
                      filterDate={isWeekday}
                      minDate={new Date()}
                      placeholderText="Выберите дату"
                      required
                    />
                  </div>
                  <Form.Text className="text-muted">
                    Приемы только по будним дням
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Время приема *</Form.Label>
                  {loadingTimes ? (
                    <div className="text-center py-3">
                      <Spinner size="sm" /> Загрузка доступного времени...
                    </div>
                  ) : (
                    <div className="time-slots">
                      <Row>
                        {availableTimes.length > 0 ? (
                          availableTimes.map((time) => (
                            <Col key={time} xs={6} sm={4} md={3} className="mb-2">
                              <Button
                                variant={formData.time === time ? "primary" : "outline-primary"}
                                className="w-100 time-slot"
                                onClick={() => handleTimeSelect(time)}
                                type="button"
                              >
                                {time}
                              </Button>
                            </Col>
                          ))
                        ) : (
                          <Col>
                            <Alert variant="warning">
                              На выбранную дату нет доступного времени
                            </Alert>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Примечания (необязательно)</Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Дополнительная информация, симптомы, вопросы и т.д."
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {formData.notes.length}/500 символов
              </Form.Text>
            </Form.Group>

            <div className="selected-appointment-info mb-4 p-3 bg-light rounded">
              <h5>Информация о записи:</h5>
              <p>
                <strong>Специалист:</strong> {formData.specialist}<br />
                <strong>Услуга:</strong> {formData.service}<br />
                <strong>Дата:</strong> {formData.date ? format(formData.date, 'dd.MM.yyyy') : 'не выбрана'}<br />
                <strong>Время:</strong> {formData.time || 'не выбрано'}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !formData.time}
              >
                {loading ? 'Создание записи...' : 'Записаться на прием'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Важная информация</Card.Title>
          <ul>
            <li>Пожалуйста, приходите за 10 минут до назначенного времени</li>
            <li>При себе иметь паспорт и полис ОМС</li>
            <li>Отмена записи возможна не позднее чем за 24 часа до приема</li>
            <li>При опоздании более чем на 15 минут запись может быть аннулирована</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateAppointment;