import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost, setAdminToken } from '../api';

export function AdminLogin() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiPost('/api/admin/login', { user, pass });
      setAdminToken(data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-body">
      <div className="login-page">
        <div className="login-card">
          <p className="admin-badge">Panel administrador</p>
          <h1>Espacio Calma</h1>
          <p className="subtitle">Gestioná reservas, eventos y horarios bloqueados</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="user">Usuario</label>
              <input id="user" value={user} onChange={(e) => setUser(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="pass">Contraseña</label>
              <input id="pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Ingresar
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link to="/">← Volver al sitio</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
