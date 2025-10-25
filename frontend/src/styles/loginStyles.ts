export const loginStyles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'url("/assets/images/login-bg.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  card: {
    maxWidth: 400,
    width: '90%',
    padding: 4,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    width: 120,
    height: 'auto',
    marginBottom: 2,
    display: 'block',
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  submitButton: {
    marginTop: 2,
    height: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 3,
    color: '#1976d2',
  },
};