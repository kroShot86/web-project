import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Alert, Spinner, InputGroup, FormControl } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      toast.error(error.response?.data?.message || 'Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdating(userId);
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success('Роль обновлена');
      fetchUsers();
    } catch (error) {
      console.error('Ошибка при изменении роли:', error);
      toast.error(error.response?.data?.message || 'Ошибка при обновлении роли');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/admin/users/${userToDelete._id}`);
      toast.success('Пользователь удален');
      fetchUsers();
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      toast.error(error.response?.data?.message || 'Ошибка при удалении пользователя');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка пользователей...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <h1 className="mb-4">Управление пользователями</h1>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Все пользователи ({users.length})</h5>
            <InputGroup style={{ width: '300px' }}>
              <FormControl
                placeholder="Поиск по имени, email, телефону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setSearchTerm('')}
                disabled={!searchTerm}
              >
                Очистить
              </Button>
            </InputGroup>
          </div>

          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Роль</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                      {user._id === updating && (
                        <Spinner animation="border" size="sm" className="ms-2" />
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </Badge>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant={user.role === 'admin' ? 'primary' : 'danger'}
                          onClick={() => handleRoleChange(
                            user._id,
                            user.role === 'admin' ? 'user' : 'admin'
                          )}
                          disabled={updating === user._id}
                        >
                          {user.role === 'admin' ? 'Сделать пользователем' : 'Сделать администратором'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.role === 'admin'}
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <Alert variant="info" className="text-center mt-3">
              {searchTerm ? 'Пользователи не найдены' : 'Нет зарегистрированных пользователей'}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Модальное окно удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Удаление пользователя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <Alert variant="danger">
              <h6>Вы уверены, что хотите удалить пользователя?</h6>
              <p className="mb-0">
                <strong>Имя:</strong> {userToDelete.name}<br />
                <strong>Email:</strong> {userToDelete.email}<br />
                <strong>Телефон:</strong> {userToDelete.phone}
              </p>
              <hr />
              <p className="mb-0 text-danger">
                ⚠️ Это действие нельзя отменить! Все записи пользователя также будут удалены.
              </p>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Удалить пользователя
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUsers;