import { useState, SyntheticEvent } from 'react';
import Card from '@/components/Shared/Card/Card';
import FormLayout from '@/components/Shared/FormLayout/FormLayout';
import Button from '@/components/Shared/Button/Button';
import Input from '@/components/Shared/Input/Input';
import PageTitle from '@/components/Shared/PageTitle/PageTitle';
import styles from './AuthForm.module.css';

interface Props {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  error: string;
}

export default function AuthForm({ onLogin, onRegister, error }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (isLogin) await onLogin(username, password);
    else await onRegister(username, email, password);
  };

  return (
    <Card className={styles.authCard}>
      <PageTitle level="h1">
        {isLogin ? 'Entrar no GameLog' : 'Criar nova conta'}
      </PageTitle>

      {error && <p className={styles.error}>{error}</p>}

      <FormLayout onSubmit={handleSubmit}>
        <Input
          placeholder={isLogin ? 'Username ou E-mail' : 'Username'}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {!isLogin && (
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" fullWidth>
          {isLogin ? 'Entrar' : 'Registrar'}
        </Button>
      </FormLayout>

      <Button variant="ghost" fullWidth className={styles.toggleButton} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login'}
      </Button>
    </Card>
  );
}